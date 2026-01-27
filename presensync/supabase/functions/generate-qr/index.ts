// Supabase Edge Function: Generate QR Code
// Deploy: supabase functions deploy generate-qr

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import QRCode from "https://esm.sh/qrcode@1.5.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is authenticated
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { class_id, expiry_minutes = 30, location, module_name, start_time, end_time, duration_minutes } = await req.json();

    if (!class_id) {
      return new Response(
        JSON.stringify({ error: "class_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is instructor of this class (via courses.lecturer_id)
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select(`
        id,
        course_id,
        courses (
          id,
          lecturer_id
        )
      `)
      .eq("id", class_id)
      .single();

    if (classError || !classData) {
      return new Response(
        JSON.stringify({ error: "Class not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is the lecturer (courses is an array in Supabase, get first item)
    const course = Array.isArray(classData.courses) ? classData.courses[0] : classData.courses;
    if (!course || course.lecturer_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Not the instructor of this class" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate unique token
    const qrToken = crypto.randomUUID();

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + (expiry_minutes * 60 * 1000));

    // Create class session
    const { data: session, error: sessionError } = await supabase
      .from("class_sessions")
      .insert({
        class_id,
        qr_token: qrToken,
        expires_at: expiresAt.toISOString(),
        location: location || null,
        module_name: module_name || null,
        start_time: start_time || null,
        end_time: end_time || null,
        duration_minutes: duration_minutes || null,
      })
      .select()
      .single();

    if (sessionError) {
      return new Response(
        JSON.stringify({ error: "Failed to create session", details: sessionError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate QR code URL
    const qrUrl = `${Deno.env.get("APP_URL") || "https://yourapp.com"}/scan?token=${qrToken}`;

    // Generate QR code image (optimized for faster generation)
    // Using lower error correction (L) and smaller size for speed
    const qrImage = await QRCode.toDataURL(qrUrl, {
      errorCorrectionLevel: "L", // Changed from M to L for faster generation
      type: "image/png",
      width: 200, // Reduced from 300 to 200 for faster generation
      margin: 1, // Reduced margin for smaller file size
    });

    return new Response(
      JSON.stringify({
        success: true,
        qrImage,
        qrToken,
        sessionId: session.id,
        expiresAt: expiresAt.toISOString(),
        qrUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
