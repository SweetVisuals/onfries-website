import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Check if user is admin based on email
        const isAdmin = session.user.email === 'admin@admin.com';
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email || '',
          email: session.user.email || '',
          role: isAdmin ? 'admin' : 'customer',
          isAdmin
        });
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Check if user is admin based on email
          const isAdmin = session.user.email === 'admin@admin.com';
          const userData = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email || '',
            email: session.user.email || '',
            role: isAdmin ? 'admin' as const : 'customer' as const,
            isAdmin
          };
          setUser(userData);
          // Store admin status in localStorage for app initialization
          localStorage.setItem('isAdmin', isAdmin.toString());
        } else {
          setUser(null);
          localStorage.removeItem('isAdmin');
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      console.error('Login error:', error.message);
      return false;
    }

    return !!data.user;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
      },
    });

    if (error) {
      console.error('Signup error:', error.message);
      setIsLoading(false);
      return false;
    }

    // If signup successful, insert user data into users table
    if (data.user) {
      const { error: insertError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            full_name: name,
            email: email,
          },
        ]);

      if (insertError) {
        console.error('Error inserting user data:', insertError.message);
        // Note: Auth user is created, but profile data failed
        // You might want to handle this case differently
      }
    }

    setIsLoading(false);
    return !!data.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};