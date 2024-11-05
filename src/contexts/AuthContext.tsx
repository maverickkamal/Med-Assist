import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient, User, AuthError, Session } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  }
);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: ProfileData) => Promise<{ user: User | null; session: Session | null; }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  updateProfile: (data: ProfileData) => Promise<void>;
}

interface ProfileData {
  name?: string;
  hospital?: string;
  specialty?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    signIn: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    signUp: async (email: string, password: string, metadata: ProfileData) => {
      try {
        // First, create the auth user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: metadata.name,
              hospital: metadata.hospital,
              specialty: metadata.specialty
            }
          }
        });

        if (signUpError) {
          console.error('SignUp error:', signUpError);
          throw signUpError;
        }

        if (!authData.user) {
          throw new Error('No user data returned');
        }

        // Create the profile only after successful auth signup
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            name: metadata.name,
            hospital: metadata.hospital,
            specialty: metadata.specialty
          })
          .single();

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // If profile creation fails, clean up the auth user
          await supabase.auth.signOut();
          throw new Error('Failed to create profile');
        }

        return authData;
      } catch (error: any) {
        console.error('Complete signup error:', error);
        throw error;
      }
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    forgotPassword: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    },
    updateProfile: async (data: ProfileData) => {
      if (!user) throw new Error('No user logged in');
      
      const { error: updateError } = await supabase.auth.updateUser({
        data: data
      });
      if (updateError) throw updateError;

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id,
          ...data,
          updated_at: new Date().toISOString()
        });
      if (profileError) throw profileError;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 