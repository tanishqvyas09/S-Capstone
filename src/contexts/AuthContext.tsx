import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';

interface User {
  id: string;
  email: string;
  role: 'teacher' | 'student';
  full_name?: string;
  subject?: string;
  grade_level?: string;
  class_year?: string;
  roll_number?: string;
  phone?: string;
  institution?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: 'teacher' | 'student') => Promise<void>;
  signup: (email: string, password: string, role: 'teacher' | 'student', data: any) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AuthProvider] Initializing auth state...');
    // No auth state listener needed for simple auth
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role?: 'teacher' | 'student') => {
    console.log('[AuthProvider] Login attempt for:', email);
    
    try {
      // If role is specified, only check that table to avoid cross-role logins
      if (role === 'teacher') {
        const { data: teacherData } = await supabase
          .from('teachers')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .maybeSingle();
        if (teacherData) {
          console.log('[AuthProvider] Teacher login successful:', teacherData);
          setUser({ ...teacherData, role: 'teacher' });
          return;
        }
      } else if (role === 'student') {
        const { data: studentData } = await supabase
          .from('students')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .maybeSingle();
        if (studentData) {
          console.log('[AuthProvider] Student login successful:', studentData);
          setUser({ ...studentData, role: 'student' });
          return;
        }
      } else {
        // No role specified: try teachers first, then students (backwards compatible)
        const { data: teacherData } = await supabase
          .from('teachers')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .maybeSingle();
        if (teacherData) {
          console.log('[AuthProvider] Teacher login successful:', teacherData);
          setUser({ ...teacherData, role: 'teacher' });
          return;
        }

        const { data: studentData } = await supabase
          .from('students')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .maybeSingle();
        if (studentData) {
          console.log('[AuthProvider] Student login successful:', studentData);
          setUser({ ...studentData, role: 'student' });
          return;
        }
      }
      
      // If no match found
      throw new Error('Invalid email or password');
      
    } catch (error: any) {
      console.error('[AuthProvider] Login failed:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, role: 'teacher' | 'student', data: any) => {
    console.log('[AuthProvider] Signup attempt for:', { email, role, extraData: data });
    
    try {
      const tableName = role === 'teacher' ? 'teachers' : 'students';
      
      // Check if email already exists
      const { data: existingUser } = await supabase
        .from(tableName)
        .select('email')
        .eq('email', email)
        .maybeSingle();
      
      if (existingUser) {
        throw new Error('Email already exists. Please login instead.');
      }
      
      // Create user profile with password
      const userProfile = {
        id: crypto.randomUUID(), // Generate a unique ID
        email,
        password, // Store password directly
        full_name: data.full_name || '',
        phone: data.phone || '',
        institution: data.institution || '',
        ...(role === 'teacher' ? {
          subject: data.subject || '',
          grade_level: data.grade_level || ''
        } : {
          class_year: data.class_year || '',
          roll_number: data.roll_number || ''
        })
      };
      
      console.log('[AuthProvider] Creating profile in', tableName, ':', userProfile);
      
      const { error: insertError } = await supabase
        .from(tableName)
        .insert(userProfile);
      
      if (insertError) {
        console.error('[AuthProvider] Profile insert error:', insertError);
        
        if (insertError.code === '42P01') {
          throw new Error(`Table "${tableName}" not found. Please run DATABASE_SETUP.sql in Supabase SQL Editor.`);
        } else if (insertError.code === '23505') {
          throw new Error('An account with this email already exists. Please login instead.');
        }
        
        throw new Error('Failed to create profile: ' + insertError.message);
      }

      console.log('[AuthProvider] Profile created successfully');
      
      // Set user state
      const newUser = { ...userProfile, role };
      setUser(newUser);
      console.log('[AuthProvider] Signup complete!');
    } catch (error: any) {
      console.error('[AuthProvider] Signup failed:', error.message);
      throw error;
    }
  };

  const logout = async () => {
    console.log('[AuthProvider] Logging out...');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;