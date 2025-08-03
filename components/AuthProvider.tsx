import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService, User } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  signInWithPhone: (phone: string, code: string) => Promise<void>;
  sendSMSVerification: (phone: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    // Initialize auth service and listen for changes
    const initAuth = async () => {
      try {
        await authService.initialize();
        if (isMounted.current) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    const unsubscribe = authService.onAuthStateChanged((user) => {
      if (isMounted.current) {
        setUser(user);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted.current = false;
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    try {
      await authService.signInWithEmail(email, password);
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    try {
      await authService.signUpWithEmail(email, password, name);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const signInWithGoogle = async () => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    try {
      await authService.signInWithGoogle();
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };
  const signInWithApple = async () => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    try {
      await authService.signInWithApple();
    } catch (error) {
      console.error('Apple sign in error:', error);
      throw error;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const signInWithTwitter = async () => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    try {
      await authService.signInWithTwitter();
    } catch (error) {
      console.error('Twitter sign in error:', error);
      throw error;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const signInWithPhone = async (phone: string, code: string) => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    try {
      await authService.signInWithPhone(phone, code);
    } catch (error) {
      console.error('Phone sign in error:', error);
      throw error;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const sendSMSVerification = async (phone: string) => {
    try {
      await authService.sendSMSVerification(phone);
    } catch (error) {
      console.error('SMS verification error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      signIn,
      signUp,
      signInWithGoogle,
      signInWithApple,
      signInWithTwitter,
      signInWithPhone,
      sendSMSVerification,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
