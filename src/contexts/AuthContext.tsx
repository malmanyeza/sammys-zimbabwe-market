import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type UserRole = 'customer' | 'seller' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const isAuthenticated = user !== null;

  useEffect(() => {
    console.log("AuthProvider: Setting up auth state change listener");
    
    // Set up auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("AuthProvider: Auth state changed", { event, hasSession: !!currentSession });
        setSession(currentSession);
        
        if (currentSession?.user) {
          console.log("AuthProvider: User session found, fetching profile for:", currentSession.user.id);
          
          // The setTimeout helps prevent potential deadlocks in Supabase authentication
          setTimeout(async () => {
            try {
              // Get user profile data
              console.log("AuthProvider: Attempting to fetch profile data");
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', currentSession.user.id)
                .single();
              
              if (error) {
                console.error("AuthProvider: Error fetching user profile:", error);
              } else {
                console.log("AuthProvider: Profile data fetched successfully:", profile);
              }
              
              if (profile) {
                const userData = {
                  id: currentSession.user.id,
                  name: profile.name || 'User',
                  email: profile.email || currentSession.user.email || '',
                  role: profile.role as UserRole || 'customer'
                };
                console.log("AuthProvider: Setting user data:", userData);
                setUser(userData);
              } else {
                console.log("AuthProvider: No profile found, setting user to null");
                setUser(null);
              }
              
              setIsLoading(false);
            } catch (error) {
              console.error("AuthProvider: Unexpected error fetching user profile:", error);
              setIsLoading(false);
            }
          }, 0);
        } else {
          console.log("AuthProvider: No user session, clearing user state");
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    console.log("AuthProvider: Checking for existing session");
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      console.log("AuthProvider: Initial session check", { hasSession: !!currentSession });
      setSession(currentSession);
      
      if (currentSession?.user) {
        console.log("AuthProvider: Initial session found, fetching profile for:", currentSession.user.id);
        try {
          // Get user profile data
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();

          if (error) {
            console.error("AuthProvider: Error fetching initial profile:", error);
          } else {
            console.log("AuthProvider: Initial profile data:", profile);
          }

          if (profile) {
            const userData = {
              id: currentSession.user.id,
              name: profile.name || 'User',
              email: profile.email || currentSession.user.email || '',
              role: profile.role as UserRole || 'customer'
            };
            console.log("AuthProvider: Setting initial user data:", userData);
            setUser(userData);
          }
        } catch (error) {
          console.error("AuthProvider: Unexpected error fetching initial profile:", error);
        }
      }
      
      setIsLoading(false);
    });

    return () => {
      console.log("AuthProvider: Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("Login: Starting login attempt for email:", email);
    
    try {
      console.log("Login: Calling supabase.auth.signInWithPassword");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log("Login: Supabase auth response", { 
        hasData: !!data, 
        hasUser: !!data?.user, 
        hasSession: !!data?.session,
        error: error 
      });
      
      if (error) {
        console.error("Login: Supabase auth error:", error);
        toast.error(error.message);
        return false;
      }
      
      if (data?.user) {
        console.log("Login: User authenticated successfully:", data.user.id);
      }
      
      console.log("Login: Authentication successful, showing success toast");
      toast.success("Successfully logged in!");
      return true;
    } catch (error) {
      console.error("Login: Unexpected error during login:", error);
      toast.error("Failed to log in. Please try again.");
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    console.log("Register: Starting registration attempt");
    console.log("Register: Input parameters:", {
      name: name,
      email: email,
      passwordLength: password ? password.length : 0,
      role: role
    });
    
    try {
      console.log("Register: Preparing signup data object");
      const signupData = {
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      };
      console.log("Register: Signup data prepared:", {
        email: signupData.email,
        hasPassword: !!signupData.password,
        passwordLength: signupData.password ? signupData.password.length : 0,
        optionsData: signupData.options.data
      });
      
      console.log("Register: Calling supabase.auth.signUp");
      const { data, error } = await supabase.auth.signUp(signupData);
      
      console.log("Register: Supabase signup response received");
      console.log("Register: Response data:", {
        hasData: !!data,
        hasUser: !!data?.user,
        hasSession: !!data?.session,
        userData: data?.user ? {
          id: data.user.id,
          email: data.user.email,
          emailConfirmed: data.user.email_confirmed_at,
          userMetadata: data.user.user_metadata,
          rawUserMetadata: data.user.user_metadata
        } : null
      });
      console.log("Register: Response error:", error);
      
      if (error) {
        console.error("Register: Supabase signup error details:", {
          message: error.message,
          status: error.status,
          statusCode: error.status,
          name: error.name
        });
        toast.error(error.message);
        return false;
      }
      
      console.log("Register: Signup successful, no error returned");
      toast.success("Registration successful! Check your email for verification.");
      return true;
    } catch (error) {
      console.error("Register: Unexpected error during registration:");
      console.error("Register: Error type:", typeof error);
      console.error("Register: Error object:", error);
      console.error("Register: Error message:", error instanceof Error ? error.message : String(error));
      console.error("Register: Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      
      toast.error("Failed to register. Please try again.");
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      toast.success("You have been successfully logged out.");
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated,
        login,
        register,
        logout
      }}
    >
      {!isLoading && children}
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
