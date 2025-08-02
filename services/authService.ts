import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { supabase, isSupabaseConfigured } from './supabase/supabaseClient';
import { ENV } from '@/config/env';

WebBrowser.maybeCompleteAuthSession();

export interface User {
  id: string;
  email: string;
  name: string;
  profileImage?: string;
  phone?: string;
  provider: 'email' | 'google' | 'apple' | 'twitter' | 'phone';
  createdAt: Date;
}

class AuthService {
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  // Initialize auth service
  async initialize() {
    try {
      if (isSupabaseConfigured()) {
        // Check Supabase session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          this.currentUser = this.mapSupabaseUser(session.user);
          this.notifyListeners();
          return;
        }
      }

      // Fallback to local storage
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  // Map Supabase user to our User interface
  private mapSupabaseUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || 'User',
      profileImage: supabaseUser.user_metadata?.avatar_url,
      provider: supabaseUser.app_metadata?.provider || 'email',
      createdAt: new Date(supabaseUser.created_at),
    };
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Listen to auth state changes
  onAuthStateChanged(callback: (user: User | null) => void) {
    this.listeners.push(callback);
    callback(this.currentUser);
    
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  // Email/Password Sign Up
  async signUpWithEmail(email: string, password: string, name: string): Promise<User> {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name,
            }
          }
        });

        if (error) throw error;
        if (!data.user) throw new Error('Failed to create user');

        const user = this.mapSupabaseUser(data.user);
        await this.saveUser(user);
        return user;
      } else {
        // Fallback to mock authentication
        const user: User = {
          id: await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, email),
          email,
          name,
          provider: 'email',
          createdAt: new Date(),
        };

        await this.saveUser(user);
        return user;
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account. Please try again.');
    }
  }

  // Email/Password Sign In
  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        if (!data.user) throw new Error('Failed to sign in');

        const user = this.mapSupabaseUser(data.user);
        await this.saveUser(user);
        return user;
      } else {
        // Fallback to mock authentication
        const user: User = {
          id: await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, email),
          email,
          name: email.split('@')[0],
          provider: 'email',
          createdAt: new Date(),
        };

        await this.saveUser(user);
        return user;
      }
    } catch (error: any) {
      throw new Error(error.message || 'Invalid email or password.');
    }
  }

  // Google Sign In
  async signInWithGoogle(): Promise<User> {
    try {
      if (!ENV.GOOGLE.CLIENT_ID || ENV.GOOGLE.CLIENT_ID === 'your-google-client-id-here') {
        throw new Error('Google Client ID not configured. Please add EXPO_PUBLIC_GOOGLE_CLIENT_ID to your .env file.');
      }

      const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
      
      const request = new AuthSession.AuthRequest({
        clientId: ENV.GOOGLE.CLIENT_ID,
        scopes: ['openid', 'profile', 'email'],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
        codeChallenge: await AuthSession.AuthRequest.createRandomCodeChallenge(),
      });

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/oauth/authorize',
      });

      if (result.type === 'success' && result.params.code) {
        if (isSupabaseConfigured()) {
          // Use Supabase Google OAuth
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: redirectUri,
            }
          });

          if (error) throw error;
        }

        // For now, create a mock Google user
        const user: User = {
          id: 'google_' + Date.now(),
          email: 'user@gmail.com',
          name: 'Google User',
          provider: 'google',
          createdAt: new Date(),
        };

        await this.saveUser(user);
        return user;
      } else {
        throw new Error('Google sign in was cancelled');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in with Google. Please check your configuration.');
    }
  }

  // Apple Sign In
  async signInWithApple(): Promise<User> {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'apple'
        });

        if (error) throw error;
      }

      // For now, create a mock Apple user
      const user: User = {
        id: 'apple_' + Date.now(),
        email: 'user@icloud.com',
        name: 'Apple User',
        provider: 'apple',
        createdAt: new Date(),
      };

      await this.saveUser(user);
      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in with Apple');
    }
  }

  // Twitter/X Sign In
  async signInWithTwitter(): Promise<User> {
    try {
      if (!ENV.SOCIAL.TWITTER_CLIENT_ID || ENV.SOCIAL.TWITTER_CLIENT_ID === 'your-twitter-client-id-here') {
        throw new Error('Twitter Client ID not configured. Please add EXPO_PUBLIC_TWITTER_CLIENT_ID to your .env file.');
      }

      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'twitter'
        });

        if (error) throw error;
      }

      // For now, create a mock Twitter user
      const user: User = {
        id: 'twitter_' + Date.now(),
        email: 'user@twitter.com',
        name: 'Twitter User',
        provider: 'twitter',
        createdAt: new Date(),
      };

      await this.saveUser(user);
      return user;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in with Twitter. Please check your configuration.');
    }
  }

  // Phone Number Sign In
  async signInWithPhone(phoneNumber: string, verificationCode: string): Promise<User> {
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.verifyOtp({
          phone: phoneNumber,
          token: verificationCode,
          type: 'sms'
        });

        if (error) throw error;
        if (!data.user) throw new Error('Invalid verification code');

        const user = this.mapSupabaseUser(data.user);
        await this.saveUser(user);
        return user;
      } else {
        // Mock phone authentication
        const user: User = {
          id: 'phone_' + Date.now(),
          email: `${phoneNumber}@phone.local`,
          name: 'Phone User',
          phone: phoneNumber,
          provider: 'phone',
          createdAt: new Date(),
        };

        await this.saveUser(user);
        return user;
      }
    } catch (error: any) {
      throw new Error(error.message || 'Invalid verification code');
    }
  }

  // Send SMS verification code
  async sendSMSVerification(phoneNumber: string): Promise<void> {
    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signInWithOtp({
          phone: phoneNumber
        });

        if (error) throw error;
      } else {
        // Mock SMS sending
        console.log(`Mock: Sending SMS to ${phoneNumber}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send verification code');
    }
  }

  // Sign Out
  async signOut(): Promise<void> {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
      
      await AsyncStorage.removeItem('user');
      this.currentUser = null;
      this.notifyListeners();
    } catch (error) {
      throw new Error('Failed to sign out');
    }
  }

  // Save user to storage
  private async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      this.currentUser = user;
      this.notifyListeners();
    } catch (error) {
      throw new Error('Failed to save user data');
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }
}

export const authService = new AuthService();