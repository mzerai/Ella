-- Add course_id column to lab_attempts (if it doesn't exist)
-- Run this in the Supabase SQL Editor
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'lab_attempts' AND column_name = 'course_id'
    ) THEN
        ALTER TABLE public.lab_attempts ADD COLUMN course_id TEXT DEFAULT 'pe';
    END IF;
END $$;
