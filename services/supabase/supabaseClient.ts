import { createClient } from '@supabase/supabase-js';
import { ENV } from '@/config/env';

// Create Supabase client
export const supabase = createClient(
  ENV.SUPABASE.URL,
  ENV.SUPABASE.ANON_KEY
);

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return ENV.SUPABASE.URL && 
         ENV.SUPABASE.ANON_KEY && 
         ENV.SUPABASE.URL !== EXPO_PUBLIC_SUPABASE_URL &&
         ENV.SUPABASE.ANON_KEY !== EXPO_PUBLIC_SUPABASE_ANON_KEY;
};