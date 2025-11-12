import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import type { User, Role } from '../types/index';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
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
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[AuthProvider] Auth state changed:', { event: _event, userId: session?.user?.id });
      if (session?.user) {
        try {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          console.log('[AuthProvider] User data fetched:', data);
          setUser(data);
        } catch (error) {
          console.error('[AuthProvider] Failed to fetch user data:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log('[AuthProvider] Login attempt for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('[AuthProvider] Login auth error:', error.message, error);
      throw new Error(error.message || 'Login failed');
    }
    console.log('[AuthProvider] Auth login successful for user:', data.user?.id);
    
    try {
      // First, check if user exists in users table
      const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user!.id)
        .maybeSingle(); // Use maybeSingle() instead of single() to handle 0 results
      
      if (fetchError) {
        console.error('[AuthProvider] Failed to fetch user data:', fetchError);
        throw new Error('Failed to fetch user profile: ' + fetchError.message);
      }
      
      // If user doesn't exist in users table, create it
      if (!userData) {
        console.warn('[AuthProvider] User not found in users table, creating profile...');
        const { data: newUserData, error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user!.id,
            email: data.user!.email!,
            role: 'student', // Default role, can be changed later
          })
          .select()
          .single();
        
        if (insertError) {
          console.error('[AuthProvider] Failed to create user profile:', insertError);
          throw new Error('Failed to create user profile: ' + insertError.message);
        }
        
        console.log('[AuthProvider] User profile created:', newUserData);
        setUser(newUserData);
      } else {
        console.log('[AuthProvider] Login successful, user data:', userData);
        setUser(userData);
      }
    } catch (error: any) {
      console.error('[AuthProvider] Failed to fetch/create user after login:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string, role: 'teacher' | 'student', data: any) => {
    console.log('[AuthProvider] Signup attempt for:', { email, role, extraData: data });
    
    try {
      // Step 1: Create auth user
      const { data: authData, error: signupError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            role: role,
            ...data
          }
        }
      });
      
      if (signupError) {
        console.error('[AuthProvider] Signup auth error:', signupError.message);
        throw new Error(signupError.message || 'Signup failed');
      }
      
      if (!authData.user) {
        throw new Error('Signup failed: no user returned from auth');
      }

      console.log('[AuthProvider] Auth signup successful, user ID:', authData.user.id);

      // Step 2: Create user profile in users table
      const userProfile = {
        id: authData.user.id,
        email,
        role,
        ...data
      };
      
      console.log('[AuthProvider] Creating user profile:', userProfile);
      
      const { error: insertError } = await supabase
        .from('users')
        .upsert(userProfile, { onConflict: 'id' }); // Use upsert to avoid duplicate errors
      
      if (insertError) {
        console.error('[AuthProvider] User insert error:', insertError);
        
        // Provide user-friendly error messages
        if (insertError.code === '42501') {
          throw new Error('Permission denied. Please run the SQL setup from SUPABASE_SQL_SETUP.md');
        } else if (insertError.code === '23505') {
          // If duplicate, try to fetch existing user
          console.log('[AuthProvider] User already exists, fetching...');
        } else {
          throw new Error('Failed to create profile: ' + insertError.message);
        }
      }

      console.log('[AuthProvider] User profile created successfully');
      
      // Step 3: Set user state
      const newUser = { id: authData.user.id, email, role, ...data };
      setUser(newUser);
      console.log('[AuthProvider] Signup complete!');
    } catch (error: any) {
      console.error('[AuthProvider] Signup failed:', error.message);
      throw error;
    }
  };

  const logout = async () => {
    console.log('[AuthProvider] Logging out...');
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;