// Quiz Question Type
export interface Question {
  question: string;
  options: string[];
  answer: string;
  type?: 'mcq' | 'tf' | 'fill';
  explanation?: string;
}

// Quiz Type
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  created_by: string;
  created_at: string;
  access_code?: string;
}

// Student Score Type
export interface Score {
  id?: string;
  quiz_id: string;
  student_id: string;
  score: string; // Format: "5/10"
  date: string;
}

// Student Type
export interface Student {
  id: string;
  email: string;
  full_name: string;
  class_year?: string;
  roll_number?: string;
  phone?: string;
  institution?: string;
  created_at?: string;
}

// Teacher Type
export interface Teacher {
  id: string;
  email: string;
  full_name: string;
  subject?: string;
  grade_level?: string;
  phone?: string;
  institution?: string;
  created_at?: string;
}
