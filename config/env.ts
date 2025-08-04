// Environment Configuration
// This file centralizes all environment variables

export const ENV = {
  // OpenAI Configuration
  OPENAI: {
    API_KEY: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
    BASE_URL: process.env.EXPO_PUBLIC_OPENAI_BASE_URL || 'https://api.openai.com/v1',
  },

  // Google Services
  GOOGLE: {
    CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
    VISION_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_VISION_API_KEY || '',
  },

  // Supabase Configuration
  SUPABASE: {
    URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },

  // Social Authentication
  SOCIAL: {
    APPLE_CLIENT_ID: process.env.EXPO_PUBLIC_APPLE_CLIENT_ID || '',
    TWITTER_CLIENT_ID: process.env.EXPO_PUBLIC_TWITTER_CLIENT_ID || '',
    TWITTER_CLIENT_SECRET: process.env.EXPO_PUBLIC_TWITTER_CLIENT_SECRET || '',
  },

  // SMS Service
  TWILIO: {
    ACCOUNT_SID: process.env.EXPO_PUBLIC_TWILIO_ACCOUNT_SID || '',
    AUTH_TOKEN: process.env.EXPO_PUBLIC_TWILIO_AUTH_TOKEN || '',
    PHONE_NUMBER: process.env.EXPO_PUBLIC_TWILIO_PHONE_NUMBER || '',
  },
};

// Validation functions
export const validateEnv = () => {
  const missing = [];
  
  if (!ENV.OPENAI.API_KEY) missing.push('EXPO_PUBLIC_OPENAI_API_KEY');
  if (!ENV.GOOGLE.CLIENT_ID) missing.push('EXPO_PUBLIC_GOOGLE_CLIENT_ID');
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing.join(', '));
    console.warn('Please check your .env file');
  }
  
  return missing.length === 0;
};

export const isOpenAIConfigured = () => {
  return ENV.OPENAI.API_KEY && ENV.OPENAI.API_KEY !== 'your-openai-api-key-here';
};

export const isGoogleConfigured = () => {
  return ENV.GOOGLE.CLIENT_ID && ENV.GOOGLE.CLIENT_ID !== 'your-google-client-id-here';
};

export const isSupabaseConfigured = () => {
  return ENV.SUPABASE.URL && ENV.SUPABASE.ANON_KEY;
};