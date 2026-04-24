-- ============================================================
-- Migration: lesson_checkpoints_progress
-- Persists student checkpoint state across page refreshes
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Create the table
CREATE TABLE IF NOT EXISTS lesson_checkpoints_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    checkpoint_id TEXT NOT NULL,
    dynamic_question TEXT NOT NULL DEFAULT '',
    student_response TEXT DEFAULT '',
    ella_feedback TEXT DEFAULT '',
    passed BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Unique constraint for upsert
ALTER TABLE lesson_checkpoints_progress
ADD CONSTRAINT uq_checkpoint_per_user
UNIQUE (user_id, course_id, module_id, checkpoint_id);

-- 3. Index for fast loading by module
CREATE INDEX IF NOT EXISTS idx_checkpoint_user_module
ON lesson_checkpoints_progress (user_id, course_id, module_id);

-- 4. Enable Row Level Security
ALTER TABLE lesson_checkpoints_progress ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies — each student can only access their own data
CREATE POLICY "Users read own checkpoint progress"
ON lesson_checkpoints_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own checkpoint progress"
ON lesson_checkpoints_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own checkpoint progress"
ON lesson_checkpoints_progress FOR UPDATE
USING (auth.uid() = user_id);

-- 6. Allow service role to bypass RLS (for admin/backend operations)
-- The service key used by the backend automatically bypasses RLS.
