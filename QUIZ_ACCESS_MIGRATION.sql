-- Migration: create quiz_access table to record student access via access_code
-- Run this in Supabase SQL editor (SQL) to create the table and indexes.

-- Enable pgcrypto for gen_random_uuid() if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.quiz_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL,
  access_code varchar(6),
  granted_at timestamptz NOT NULL DEFAULT now()
);

-- Index to speed up lookups by student
CREATE INDEX IF NOT EXISTS idx_quiz_access_student_id ON public.quiz_access(student_id);

-- Index to find quizzes by access code
CREATE INDEX IF NOT EXISTS idx_quiz_access_access_code ON public.quiz_access(access_code);

-- Optional: comment describing purpose
COMMENT ON TABLE public.quiz_access IS 'Records when a student was granted access to a quiz via an access code (or QR)';
