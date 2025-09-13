/*
  # Disable RLS for quote_requests table

  This migration completely disables Row Level Security for the quote_requests table
  to allow anonymous users to submit quote requests without authentication issues.

  1. Changes
    - Disable RLS on quote_requests table
    - Remove all existing policies
    - Allow unrestricted access for quote submissions
*/

-- Disable RLS on quote_requests table
ALTER TABLE quote_requests DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on quote_requests table
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'quote_requests'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON quote_requests', policy_record.policyname);
    END LOOP;
END $$;