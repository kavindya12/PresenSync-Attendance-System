-- Add missing qr_code_expiry column to classes table
-- This fixes the Prisma schema mismatch error

ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS qr_code_expiry timestamp with time zone;

-- Add other missing columns that might be needed
ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS nfc_tag_id text;

ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS beacon_id text;

ALTER TABLE public.classes 
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default now();

-- Create a trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_classes_updated_at ON public.classes;
CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON public.classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
