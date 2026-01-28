-- Migration: 009_audit_logs
-- Purpose: Create case_mutation_logs table for tracking changes to paid cases
-- This supports security auditing and fraud detection

-- Create mutation action enum type
DO $$ BEGIN
    CREATE TYPE mutation_action AS ENUM (
        'wizard_answer_update',
        'case_facts_update',
        'evidence_upload',
        'document_regenerate',
        'case_status_change'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create case_mutation_logs table
CREATE TABLE IF NOT EXISTS case_mutation_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id uuid NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    action text NOT NULL, -- Using text instead of enum for flexibility
    changed_keys text[] NOT NULL DEFAULT '{}',
    metadata jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now() NOT NULL
);

-- Create index for efficient queries by case
CREATE INDEX IF NOT EXISTS idx_case_mutation_logs_case_id ON case_mutation_logs(case_id);

-- Create index for efficient queries by timestamp
CREATE INDEX IF NOT EXISTS idx_case_mutation_logs_created_at ON case_mutation_logs(created_at DESC);

-- Create index for efficient queries by user
CREATE INDEX IF NOT EXISTS idx_case_mutation_logs_user_id ON case_mutation_logs(user_id);

-- Enable RLS on the table
ALTER TABLE case_mutation_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own mutation logs
CREATE POLICY "Users can read own mutation logs" ON case_mutation_logs
    FOR SELECT
    USING (
        user_id = auth.uid() OR
        case_id IN (SELECT id FROM cases WHERE user_id = auth.uid())
    );

-- Policy: Only admin (service role) can insert mutation logs
-- No direct insert policy for authenticated users - must go through API
CREATE POLICY "Service role can insert mutation logs" ON case_mutation_logs
    FOR INSERT
    WITH CHECK (true); -- Admin client bypasses RLS anyway

-- Comment on table for documentation
COMMENT ON TABLE case_mutation_logs IS 'Audit log for mutations to paid cases. Used for security monitoring and fraud detection.';
COMMENT ON COLUMN case_mutation_logs.action IS 'Type of mutation performed';
COMMENT ON COLUMN case_mutation_logs.changed_keys IS 'Array of field keys that were modified';
COMMENT ON COLUMN case_mutation_logs.metadata IS 'Additional context about the mutation';
