-- =============================================================================
-- LANDLORD HEAVEN - STORAGE SETUP
-- =============================================================================
-- Migration 008: Supabase Storage bucket configuration
-- =============================================================================

-- =============================================================================
-- STORAGE BUCKETS
-- =============================================================================
-- Note: Buckets are created via Supabase Dashboard or CLI, but we define
-- the expected structure here for documentation and RLS policies.

-- Expected buckets:
-- 1. 'documents' - For generated PDF documents
-- 2. 'evidence' - For uploaded evidence files (photos, PDFs)
-- 3. 'certificates' - For HMO compliance certificates

-- =============================================================================
-- STORAGE RLS POLICIES (run after bucket creation)
-- =============================================================================

-- Documents bucket: Users can access their own documents
-- Policy name: "Users can view own documents"
-- SELECT: bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]

-- Evidence bucket: Users can upload/view evidence for their cases
-- Policy name: "Users can manage own evidence"
-- ALL: bucket_id = 'evidence' AND auth.uid()::text = (storage.foldername(name))[1]

-- Certificates bucket: Users can manage HMO certificates
-- Policy name: "Users can manage own certificates"
-- ALL: bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]

-- =============================================================================
-- STORAGE HELPER FUNCTION
-- =============================================================================
-- Function to generate storage path for a user's documents
CREATE OR REPLACE FUNCTION generate_document_path(
  p_user_id UUID,
  p_case_id UUID,
  p_document_type TEXT,
  p_filename TEXT
)
RETURNS TEXT AS $$
BEGIN
  RETURN CONCAT(
    p_user_id::text, '/',
    p_case_id::text, '/',
    p_document_type, '/',
    p_filename
  );
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- STORAGE SETUP INSTRUCTIONS
-- =============================================================================
-- Run these commands in Supabase Dashboard > Storage or via CLI:
--
-- 1. Create 'documents' bucket:
--    - Name: documents
--    - Public: false
--    - File size limit: 10MB
--    - Allowed MIME types: application/pdf
--
-- 2. Create 'evidence' bucket:
--    - Name: evidence
--    - Public: false
--    - File size limit: 25MB
--    - Allowed MIME types: application/pdf, image/jpeg, image/png, image/webp
--
-- 3. Create 'certificates' bucket:
--    - Name: certificates
--    - Public: false
--    - File size limit: 10MB
--    - Allowed MIME types: application/pdf, image/jpeg, image/png
--
-- 4. Set up RLS policies in Dashboard > Storage > Policies
-- =============================================================================

-- =============================================================================
-- MIGRATION 008 COMPLETE
-- =============================================================================
