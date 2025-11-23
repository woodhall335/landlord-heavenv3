-- =============================================================================
-- ALLOW ANONYMOUS DOCUMENT GENERATION
-- =============================================================================
-- This migration enables document generation for anonymous wizard users
-- Extends the "try before you buy" flow to include document preview
-- =============================================================================

-- 1. Make user_id nullable in documents table (allow anonymous documents)
ALTER TABLE public.documents
  ALTER COLUMN user_id DROP NOT NULL;

-- 2. Drop existing RLS policies for documents
DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can create own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;

-- 3. Create new RLS policies that support both authenticated and anonymous users
-- SELECT: Users can view their own documents (authenticated) OR anonymous documents (if not logged in)
CREATE POLICY "Users can view own and anonymous documents"
  ON public.documents FOR SELECT
  USING (
    user_id = auth.uid()
    OR (user_id IS NULL AND auth.uid() IS NULL)
  );

-- INSERT: Allow both authenticated users and anonymous users to create documents
CREATE POLICY "Anyone can create documents"
  ON public.documents FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR user_id IS NULL
  );

-- UPDATE: Users can update their own documents OR anonymous documents (before sign-up)
CREATE POLICY "Users can update own and anonymous documents"
  ON public.documents FOR UPDATE
  USING (
    user_id = auth.uid()
    OR (user_id IS NULL)
  );

-- DELETE: Users can delete their own documents
CREATE POLICY "Users can delete own documents"
  ON public.documents FOR DELETE
  USING (user_id = auth.uid());

-- 4. Add index for null user_id queries (anonymous documents)
CREATE INDEX IF NOT EXISTS idx_documents_null_user_id
  ON public.documents(created_at)
  WHERE user_id IS NULL;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- Now anonymous users can:
-- 1. Complete wizard anonymously
-- 2. Generate document preview (user_id = null)
-- 3. View their generated documents
-- 4. Hit paywall → Sign up
-- 5. Anonymous documents get linked to user account (handled in application code)
-- =============================================================================
