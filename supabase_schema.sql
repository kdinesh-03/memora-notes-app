-- Supabase Schema for Memora Notes App

-- 1. Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the notes table
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT CHECK (type IN ('note', 'reminder')) DEFAULT 'note',
    reminder_at BIGINT,
    is_pinned BOOLEAN DEFAULT FALSE,
    audio_uri TEXT,
    images JSONB,
    is_locked BOOLEAN DEFAULT FALSE,
    sync_status TEXT CHECK (sync_status IN ('pending', 'synced', 'failed')) DEFAULT 'synced',
    device_id TEXT,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    deleted_at BIGINT
);

-- 3. Enable Row Level Security (RLS) on notes table
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for users to only access their own notes

-- Policy: Users can select their own notes
CREATE POLICY "Users can select their own notes"
ON public.notes
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own notes
CREATE POLICY "Users can insert their own notes"
ON public.notes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own notes
CREATE POLICY "Users can update their own notes"
ON public.notes
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own notes
CREATE POLICY "Users can delete their own notes"
ON public.notes
FOR DELETE
USING (auth.uid() = user_id);

-- 5. Create indexes for performant sync queries
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON public.notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_user_updated ON public.notes(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_sync_deleted ON public.notes(user_id) WHERE deleted_at IS NOT NULL;

-- 6. Create the delete_user function for account deletion
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.notes WHERE user_id = auth.uid();
    DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;
