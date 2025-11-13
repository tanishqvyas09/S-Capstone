-- Add access_code column to quizzes table
-- Run this in your Supabase SQL Editor

-- Add access_code column if it doesn't exist
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS access_code VARCHAR(6) UNIQUE;

-- Generate access codes for existing quizzes (optional)
-- You can run this to add codes to existing quizzes without codes
UPDATE quizzes 
SET access_code = LPAD(FLOOR(RANDOM() * 900000 + 100000)::TEXT, 6, '0')
WHERE access_code IS NULL;

-- Create index for faster lookups by access code
CREATE INDEX IF NOT EXISTS idx_quizzes_access_code ON quizzes(access_code);

-- Comments
COMMENT ON COLUMN quizzes.access_code IS 'Six-digit access code for students to join quiz via QR or manual entry';
