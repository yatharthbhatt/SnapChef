# hey guys yatharth this side , NOW WE NEED TO SET UP SUPABASE 
# 🚀 Supabase Setup Guide for SnapChef

Follow these steps to set up Supabase for your SnapChef application.

## Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up with GitHub, Google, or email
4. Verify your email if needed

## Step 2: Create New Project

1. Click "New Project"
2. Choose your organization (or create one)
3. Fill in project details:
   - **Name**: `snapchef-app`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

## Step 3: Get API Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)

## Step 4: Add Keys to Your App

1. Open your `.env` file in the project
2. Replace the placeholder values:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 5: Set Up Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste this SQL:

```sql
-- Create users profile table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Create fitness logs table
CREATE TABLE fitness_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  type TEXT NOT NULL,
  food_name TEXT,
  calories INTEGER,
  macros JSONB,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create saved recipes table
CREATE TABLE saved_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  ingredients JSONB,
  instructions JSONB,
  calories INTEGER,
  cook_time TEXT,
  difficulty TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitness_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own fitness logs" ON fitness_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fitness logs" ON fitness_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own recipes" ON saved_recipes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipes" ON saved_recipes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own recipes" ON saved_recipes
  FOR DELETE USING (auth.uid() = user_id);
```

4. Click "Run" to execute the SQL

## Step 6: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Under **Site URL**, add your app's URL:
   - For development: `http://localhost:8081`
   - For production: your actual domain
3. Under **Redirect URLs**, add:
   - `http://localhost:8081/**`
   - Your production URLs

## Step 7: Enable Social Providers (Optional)

### Google OAuth:
1. Go to **Authentication** → **Providers**
2. Enable "Google"
3. Add your Google Client ID and Secret
4. Set redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### Apple OAuth:
1. Enable "Apple" provider
2. Add your Apple credentials

### Twitter OAuth:
1. Enable "Twitter" provider  
2. Add your Twitter API credentials

## Step 8: Test Your Setup

1. Restart your Expo app: `npm run dev`
2. Try creating an account with email
3. Check Supabase dashboard → **Authentication** → **Users** to see if user was created
4. Try logging in and out

## Step 9: Production Setup

When deploying to production:

1. Update **Site URL** in Supabase settings
2. Add production redirect URLs
3. Update your `.env` file with production values
4. Consider upgrading to Supabase Pro for better performance

## 🎉 You're Done!

Your SnapChef app now has:
- ✅ User authentication (email, Google, Apple, Twitter)
- ✅ User profiles
- ✅ Fitness tracking data storage
- ✅ Recipe saving functionality
- ✅ Secure database with Row Level Security

## Troubleshooting

**Can't connect to Supabase?**
- Check your API keys are correct
- Ensure no extra spaces in `.env` file
- Restart your Expo app after changing `.env`

**Authentication not working?**
- Check Site URL and Redirect URLs in Supabase settings
- Verify social provider credentials
- Check browser console for errors

**Database errors?**
- Verify RLS policies are set up correctly
- Check user permissions in SQL Editor
- Review Supabase logs in dashboard

Need help? Check the [Supabase documentation](https://supabase.com/docs) or ask in their Discord community!