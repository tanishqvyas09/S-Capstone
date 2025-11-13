-- ==============================================
-- SIMPLE DATABASE SETUP (NO SECURITY)
-- Run this in Supabase SQL Editor
-- ==============================================

-- Drop old tables if they exist
DROP TABLE IF EXISTS scores CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS teachers CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==============================================
-- 1. TEACHERS TABLE
-- ==============================================
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  subject TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  phone TEXT,
  institution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 2. STUDENTS TABLE
-- ==============================================
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  class_year TEXT NOT NULL,
  roll_number TEXT,
  phone TEXT,
  institution TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- 3. QUIZZES TABLE
-- ==============================================
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  created_by UUID REFERENCES teachers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable security (for development)
ALTER TABLE quizzes DISABLE ROW LEVEL SECURITY;

-- ==============================================
-- 4. SCORES TABLE
-- ==============================================
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  score TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable security (for development)
ALTER TABLE scores DISABLE ROW LEVEL SECURITY;

-- ==============================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ==============================================
CREATE INDEX idx_quizzes_created_by ON quizzes(created_by);
CREATE INDEX idx_scores_quiz_id ON scores(quiz_id);
CREATE INDEX idx_scores_student_id ON scores(student_id);

-- ==============================================
-- DONE! You now have:
-- ✅ teachers table - stores all teacher info
-- ✅ students table - stores all student info
-- ✅ quizzes table - stores quizzes created by teachers
-- ✅ scores table - stores student quiz scores
-- ✅ NO security restrictions (open for development)
-- ==============================================
