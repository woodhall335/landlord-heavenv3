-- =============================================================================
-- ALLOW ANONYMOUS WIZARD ACCESS
-- =============================================================================
-- This migration enables the "try before you buy" wizard flow
-- Users can complete the wizard anonymously, then sign up at the paywall
-- =============================================================================

-- 1. Make user_id nullable in cases table (allow anonymous cases)
ALTER TABLE public.cases
  ALTER COLUMN user_id DROP NOT NULL;

-- 2. Drop existing RLS policies for cases
DROP POLICY IF EXISTS "Users can view own cases" ON public.cases;
DROP POLICY IF EXISTS "Users can create own cases" ON public.cases;
DROP POLICY IF EXISTS "Users can update own cases" ON public.cases;
DROP POLICY IF EXISTS "Users can delete own cases" ON public.cases;

-- 3. Create new RLS policies that support both authenticated and anonymous users
-- SELECT: Users can view their own cases (authenticated) OR anonymous cases (if not logged in)
CREATE POLICY "Users can view own and anonymous cases"
  ON public.cases FOR SELECT
  USING (
    user_id = auth.uid()
    OR (user_id IS NULL AND auth.uid() IS NULL)
  );

-- INSERT: Allow both authenticated users and anonymous users to create cases
CREATE POLICY "Anyone can create cases"
  ON public.cases FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    OR user_id IS NULL
  );

-- UPDATE: Users can update their own cases OR anonymous cases (before sign-up)
CREATE POLICY "Users can update own and anonymous cases"
  ON public.cases FOR UPDATE
  USING (
    user_id = auth.uid()
    OR (user_id IS NULL)
  );

-- DELETE: Users can delete their own cases
CREATE POLICY "Users can delete own cases"
  ON public.cases FOR DELETE
  USING (user_id = auth.uid());

-- 4. Add index for null user_id queries (anonymous cases)
CREATE INDEX IF NOT EXISTS idx_cases_null_user_id
  ON public.cases(created_at)
  WHERE user_id IS NULL;

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
-- Now anonymous users can:
-- 1. Start wizard without login (user_id = null)
-- 2. Complete all wizard questions
-- 3. See preview/analysis
-- 4. Hit paywall → Sign up
-- 5. Anonymous case gets linked to new user account (handled in application code)
-- =============================================================================
