-- Certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    course_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_email TEXT NOT NULL,
    score FLOAT NOT NULL,
    competencies JSONB NOT NULL DEFAULT '[]',
    issued_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Users can read their own certificates
CREATE POLICY "Users can read own certificates" ON public.certificates
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own certificates
CREATE POLICY "Users can insert own certificates" ON public.certificates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public can read any certificate (for verification page)
CREATE POLICY "Public can verify certificates" ON public.certificates
    FOR SELECT USING (true);

CREATE INDEX idx_certificates_user ON public.certificates(user_id);
CREATE INDEX idx_certificates_course ON public.certificates(course_id);
