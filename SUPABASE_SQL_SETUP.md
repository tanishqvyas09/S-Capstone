# COMPLETE SQL FOR SUPABASE SETUP

Run this ENTIRE SQL script in Supabase SQL Editor:

```sql
-- Create users table that links to Supabase auth
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('teacher', 'student')),
  subject TEXT,
  grade_level TEXT,
  full_name TEXT,
  class_year TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own data" ON users;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
ON users FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for quizzes
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view quizzes" ON quizzes;
DROP POLICY IF EXISTS "Teachers can create quizzes" ON quizzes;
DROP POLICY IF EXISTS "Teachers can update their own quizzes" ON quizzes;
DROP POLICY IF EXISTS "Teachers can delete their own quizzes" ON quizzes;

-- RLS Policies for quizzes (allow everyone to read, only creators to modify)
CREATE POLICY "Anyone can view quizzes"
ON quizzes FOR SELECT
USING (true);

CREATE POLICY "Teachers can create quizzes"
ON quizzes FOR INSERT
WITH CHECK (created_by = auth.uid());

CREATE POLICY "Teachers can update their own quizzes"
ON quizzes FOR UPDATE
USING (created_by = auth.uid());

CREATE POLICY "Teachers can delete their own quizzes"
ON quizzes FOR DELETE
USING (created_by = auth.uid());

-- Create scores table
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  score TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for scores
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Students can view their own scores" ON scores;
DROP POLICY IF EXISTS "Teachers can view scores for their quizzes" ON scores;
DROP POLICY IF EXISTS "Students can insert their own scores" ON scores;

-- RLS Policies for scores
CREATE POLICY "Students can view their own scores"
ON scores FOR SELECT
USING (student_id = auth.uid() OR EXISTS (
  SELECT 1 FROM quizzes WHERE quizzes.id = scores.quiz_id AND quizzes.created_by = auth.uid()
));

CREATE POLICY "Teachers can view scores for their quizzes"
ON scores FOR SELECT
USING (EXISTS (
  SELECT 1 FROM quizzes WHERE quizzes.id = scores.quiz_id AND quizzes.created_by = auth.uid()
));

CREATE POLICY "Students can insert their own scores"
ON scores FOR INSERT
WITH CHECK (student_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_scores_quiz_id ON scores(quiz_id);
CREATE INDEX IF NOT EXISTS idx_scores_student_id ON scores(student_id);
```

## After running, you should have 3 tables:
1. ✅ users
2. ✅ quizzes  
3. ✅ scores
