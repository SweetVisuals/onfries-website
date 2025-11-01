import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
      async (_event, session) => {
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

    // If signup was successful and we have a user, automatically sign them in
    if (data.user) {
      // Check if the user is already authenticated (no email confirmation required)
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        // User is already signed in, return success
        setIsLoading(false);
        return true;
      } else {
        // Try to sign in automatically after signup
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.error('Auto-login after signup failed:', signInError.message);
          // Still return true for successful signup, but user will need to sign in manually
          setIsLoading(false);
          return true;
        }

        setIsLoading(false);
        return !!signInData.user;
      }
    }

    setIsLoading(false);
    return false;
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