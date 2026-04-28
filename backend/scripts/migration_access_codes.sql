-- Migration: Course Access Codes System
-- Run this against your Supabase database

-- Table des codes d'accès par cours
CREATE TABLE IF NOT EXISTS public.course_access_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    course_id VARCHAR(20) NOT NULL,
    max_uses INTEGER DEFAULT NULL,  -- NULL = unlimited
    current_uses INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ DEFAULT NULL,  -- NULL = never expires
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- Table des déblocages de cours par utilisateur
CREATE TABLE IF NOT EXISTS public.course_unlocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    course_id VARCHAR(20) NOT NULL,
    code_used VARCHAR(50) REFERENCES public.course_access_codes(code),
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)  -- Un user ne peut débloquer un cours qu'une fois
);

-- Index pour les lookups fréquents
CREATE INDEX idx_access_codes_code ON public.course_access_codes(code);
CREATE INDEX idx_access_codes_course ON public.course_access_codes(course_id);
CREATE INDEX idx_unlocks_user_course ON public.course_unlocks(user_id, course_id);

-- RLS (Row Level Security)
ALTER TABLE public.course_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_unlocks ENABLE ROW LEVEL SECURITY;

-- Policies : les utilisateurs authentifiés peuvent lire les codes (pour vérification) et leurs propres unlocks
CREATE POLICY "Users can check codes" ON public.course_access_codes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can see their own unlocks" ON public.course_unlocks
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own unlocks" ON public.course_unlocks
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Insérer des codes initiaux pour la démo
INSERT INTO public.course_access_codes (code, course_id, max_uses, is_active) VALUES
    ('AILE-DEMO-2026', 'aile', 50, true),
    ('AILE-CODIR-001', 'aile', 10, true),
    ('PE-ESPRIT-2026', 'pe', 200, true),
    ('RL-ESPRIT-2026', 'rl', 200, true);
