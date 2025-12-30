-- =============================================================================
-- FIX ANONYMOUS CASE RLS - ADD SESSION TOKEN VALIDATION
-- =============================================================================
-- This migration adds session token validation for anonymous cases to prevent
-- unauthorized access to cases that don't belong to the current session.
--
-- Security improvement:
-- - Anonymous cases now require a matching session_token for access
-- - Session tokens are generated client-side and stored with the case
-- - Only the holder of the session token can read/update anonymous cases
-- =============================================================================

-- 1. Add session_token column to cases table for anonymous session validation
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS session_token TEXT;

-- 2. Add session_token column to documents table for anonymous document access
ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS session_token TEXT;

-- 3. Create index for session_token lookups on cases
CREATE INDEX IF NOT EXISTS idx_cases_session_token
  ON public.cases(session_token)
  WHERE session_token IS NOT NULL;

-- 4. Create index for session_token lookups on documents
CREATE INDEX IF NOT EXISTS idx_documents_session_token
  ON public.documents(session_token)
  WHERE session_token IS NOT NULL;

-- 5. Drop existing overly permissive RLS policies for cases
DROP POLICY IF EXISTS "Users can view own and anonymous cases" ON public.cases;
DROP POLICY IF EXISTS "Anyone can create cases" ON public.cases;
DROP POLICY IF EXISTS "Users can update own and anonymous cases" ON public.cases;
DROP POLICY IF EXISTS "Users can delete own cases" ON public.cases;

-- 6. Create new, more restrictive RLS policies for cases
-- Note: Anonymous access now requires passing session_token as a request header
-- The application code must set the x-session-token header for anonymous requests

-- SELECT: Users can view their own cases OR anonymous cases with matching session token
-- For anonymous cases, we check the session_token via current_setting (set by application)
CREATE POLICY "Users can view own cases or anonymous cases with token"
  ON public.cases FOR SELECT
  USING (
    -- Authenticated users see their own cases
    (user_id = auth.uid())
    OR
    -- Anonymous cases can be viewed if session_token matches (or no token required for service role)
    (
      user_id IS NULL
      AND (
        -- Service role can see all anonymous cases
        auth.role() = 'service_role'
        OR
        -- Anonymous users can see cases with matching session token
        (auth.uid() IS NULL AND session_token IS NOT NULL AND session_token = current_setting('request.headers.x-session-token', true))
      )
    )
  );

-- INSERT: Allow both authenticated users and anonymous users to create cases
CREATE POLICY "Users can create cases with valid ownership"
  ON public.cases FOR INSERT
  WITH CHECK (
    -- Authenticated users can create cases for themselves
    (user_id = auth.uid())
    OR
    -- Anonymous users can create anonymous cases (must include session_token in application code)
    (user_id IS NULL)
  );

-- UPDATE: Users can update their own cases OR anonymous cases with matching session token
CREATE POLICY "Users can update own cases or anonymous cases with token"
  ON public.cases FOR UPDATE
  USING (
    -- Authenticated users update their own cases
    (user_id = auth.uid())
    OR
    -- Service role can update any case
    (auth.role() = 'service_role')
    OR
    -- Anonymous users can only update cases with matching session token
    (
      user_id IS NULL
      AND auth.uid() IS NULL
      AND session_token IS NOT NULL
      AND session_token = current_setting('request.headers.x-session-token', true)
    )
  );

-- DELETE: Only authenticated users can delete their own cases (no anonymous deletion)
CREATE POLICY "Users can delete own cases only"
  ON public.cases FOR DELETE
  USING (user_id = auth.uid());

-- 7. Drop existing overly permissive RLS policies for documents
DROP POLICY IF EXISTS "Users can view own and anonymous documents" ON public.documents;
DROP POLICY IF EXISTS "Anyone can create documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update own and anonymous documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;

-- 8. Create new, more restrictive RLS policies for documents

-- SELECT: Users can view their own documents OR anonymous documents with matching token
CREATE POLICY "Users can view own documents or anonymous with token"
  ON public.documents FOR SELECT
  USING (
    (user_id = auth.uid())
    OR
    (
      user_id IS NULL
      AND (
        auth.role() = 'service_role'
        OR
        (auth.uid() IS NULL AND session_token IS NOT NULL AND session_token = current_setting('request.headers.x-session-token', true))
      )
    )
  );

-- INSERT: Allow both authenticated users and anonymous users to create documents
CREATE POLICY "Users can create documents with valid ownership"
  ON public.documents FOR INSERT
  WITH CHECK (
    (user_id = auth.uid())
    OR
    (user_id IS NULL)
  );

-- UPDATE: Users can update their own documents OR anonymous documents with matching token
CREATE POLICY "Users can update own documents or anonymous with token"
  ON public.documents FOR UPDATE
  USING (
    (user_id = auth.uid())
    OR
    (auth.role() = 'service_role')
    OR
    (
      user_id IS NULL
      AND auth.uid() IS NULL
      AND session_token IS NOT NULL
      AND session_token = current_setting('request.headers.x-session-token', true)
    )
  );

-- DELETE: Only authenticated users can delete their own documents
CREATE POLICY "Users can delete own documents only"
  ON public.documents FOR DELETE
  USING (user_id = auth.uid());

-- =============================================================================
-- APPLICATION CODE CHANGES REQUIRED:
-- =============================================================================
-- 1. When creating anonymous cases, generate a UUID session token and store it:
--    - Generate: crypto.randomUUID()
--    - Store in localStorage: localStorage.setItem('lh_session_token', token)
--    - Pass to case creation: { ..., session_token: token }
--
-- 2. When accessing anonymous cases, pass the session token in headers:
--    - Get from localStorage: localStorage.getItem('lh_session_token')
--    - Add header: { 'x-session-token': token }
--
-- 3. The session token persists in localStorage until user signs up or clears
-- =============================================================================

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================
