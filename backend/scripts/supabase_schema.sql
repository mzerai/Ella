-- ============================================
-- ELLA Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT DEFAULT '',
    role TEXT DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
    profile_type TEXT DEFAULT 'engineering' CHECK (profile_type IN ('engineering', 'business')),
    avatar_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Lab Attempts (stores every lab submission)
-- ============================================

CREATE TABLE IF NOT EXISTS public.lab_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    lab_id TEXT NOT NULL,
    mission_id TEXT NOT NULL,
    student_prompt TEXT NOT NULL,
    llm_output TEXT DEFAULT '',
    total_score INTEGER DEFAULT 0,
    max_score INTEGER DEFAULT 10,
    evaluation JSONB DEFAULT '{}',
    execution_time_ms FLOAT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lab_attempts ENABLE ROW LEVEL SECURITY;

-- Users can read their own attempts
CREATE POLICY "Users can read own attempts" ON public.lab_attempts
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own attempts
CREATE POLICY "Users can insert own attempts" ON public.lab_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index for fast lookups
CREATE INDEX idx_lab_attempts_user ON public.lab_attempts(user_id);
CREATE INDEX idx_lab_attempts_lab ON public.lab_attempts(lab_id, mission_id);

-- ============================================
-- Chat Conversations (stores chat history)
-- ============================================

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id TEXT DEFAULT 'pe',
    messages JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own conversations" ON public.conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON public.conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON public.conversations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE INDEX idx_conversations_user ON public.conversations(user_id);
