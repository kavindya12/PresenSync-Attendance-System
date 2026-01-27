// Supabase Edge Function: Mark Attendance
// Deploy: supabase functions deploy mark-attendance

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { session_id } = await req.json();

    if (!session_id) {
      return new Response(
        JSON.stringify({ error: "session_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify session is valid and not expired
    const { data: session, error: sessionError } = await supabase
      .from("class_sessions")
      .select("*")
      .eq("id", session_id)
      .gt("expires_at", new Date().toISOString())
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid or expired session" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if already marked
    const { data: existingAttendance } = await supabase
      .from("attendance")
      .select("id")
      .eq("student_id", user.id)
      .eq("session_id", session_id)
      .single();

    if (existingAttendance) {
      return new Response(
        JSON.stringify({ success: false, error: "Attendance already marked" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get class_id from session for compatibility
    const classId = session.class_id;

    // Mark attendance in QR attendance table (student_id comes from auth session, NOT frontend)
    const { data: attendance, error: attendanceError } = await supabase
      .from("attendance")
      .insert({
        student_id: user.id, // From auth session - secure!
        session_id: session_id,
        class_id: classId, // For compatibility
      })
      .select()
      .single();

    if (attendanceError) {
      return new Response(
        JSON.stringify({ success: false, error: attendanceError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Also create/update attendance_records for compatibility with existing system
    if (classId) {
      const { error: recordsError } = await supabase
        .from("attendance_records")
        .upsert({
          class_id: classId,
          student_id: user.id,
          status: "present",
          method: "qr",
          session_id: session_id, // Link to QR session if column exists
        }, {
          onConflict: "class_id,student_id",
        });

      if (recordsError) {
        console.warn("Failed to update attendance_records (non-critical):", recordsError);
        // Don't fail the request if this fails - QR attendance is already recorded
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        attendance,
        message: "Attendance marked successfully",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
