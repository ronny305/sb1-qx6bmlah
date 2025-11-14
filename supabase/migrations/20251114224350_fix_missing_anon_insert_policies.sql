/*
  # Fix Missing Anonymous and Authenticated INSERT Policies for Quote Requests
  
  ## Problem
  The previous migration (20251114215640_fix_rls_authenticated_insert_policy) dropped the 
  admin_full_access_quotes policy but only recreated SELECT, UPDATE, and DELETE policies.
  The critical INSERT policies for anonymous and authenticated users were NOT recreated,
  causing all quote submissions to fail with RLS policy violations.
  
  ## Root Cause
  Migration 20251114215640 assumed existing INSERT policies would remain, but they were
  lost when the admin_full_access_quotes policy (which covered ALL operations) was dropped.
  
  ## Solution
  Explicitly recreate the missing INSERT policies for both anonymous and authenticated users.
  
  ## Changes Made
  
  ### 1. Drop Any Conflicting Policies (Safety Cleanup)
  Remove any partial or conflicting INSERT policies that might exist
  
  ### 2. Create Anonymous INSERT Policy
  - Policy Name: "anon_insert_quotes"
  - Role: anon (unauthenticated/anonymous users)
  - Operation: INSERT only
  - Restriction: None (WITH CHECK true) - allows public quote submissions
  - Purpose: Enable public users to submit quote requests from the website
  
  ### 3. Create Authenticated INSERT Policy
  - Policy Name: "authenticated_insert_quotes"
  - Role: authenticated (logged-in users)
  - Operation: INSERT only
  - Restriction: None (WITH CHECK true) - allows all authenticated users to submit quotes
  - Purpose: Enable logged-in users to also submit quote requests
  
  ## Security Notes
  - Public quote submission is a business requirement (no authentication needed)
  - INSERT-only policies ensure anonymous users cannot view/modify/delete data
  - Admin policies (SELECT, UPDATE, DELETE) remain unchanged
  - Authenticated users can SELECT their own quotes via existing policy
  - This creates a secure funnel: anyone can submit, only admins can manage
  
  ## Expected Behavior After Migration
  ✓ Anonymous users can submit quote requests (INSERT)
  ✓ Authenticated users can submit quote requests (INSERT)
  ✓ Admins can view all quote requests (SELECT)
  ✓ Admins can update all quote requests (UPDATE)
  ✓ Admins can delete all quote requests (DELETE)
  ✓ Authenticated users can view their own quotes (SELECT where email matches)
  ✗ Anonymous users cannot view any quotes (no SELECT policy)
  ✗ Non-admin authenticated users cannot view other users' quotes
*/

-- ============================================================================
-- STEP 1: Clean Up Any Conflicting or Partial Policies
-- ============================================================================

-- Drop any INSERT policies that might exist from previous attempts
DROP POLICY IF EXISTS "anon_insert_quotes" ON quote_requests;
DROP POLICY IF EXISTS "authenticated_insert_quotes" ON quote_requests;
DROP POLICY IF EXISTS "Anonymous users can insert quotes" ON quote_requests;
DROP POLICY IF EXISTS "Authenticated users can insert quotes" ON quote_requests;
DROP POLICY IF EXISTS "Allow insert for all users" ON quote_requests;
DROP POLICY IF EXISTS "quote_requests_insert_anonymous" ON quote_requests;
DROP POLICY IF EXISTS "quote_requests_insert_authenticated" ON quote_requests;

-- ============================================================================
-- STEP 2: Verify RLS is Enabled
-- ============================================================================

ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 3: Create Missing INSERT Policies
-- ============================================================================

-- Policy for anonymous (unauthenticated) users to INSERT quote requests
-- This is the PRIMARY policy that enables public quote form submissions
CREATE POLICY "anon_insert_quotes"
  ON quote_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy for authenticated (logged-in) users to INSERT quote requests
-- This ensures logged-in users can also submit quotes without issues
CREATE POLICY "authenticated_insert_quotes"
  ON quote_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- STEP 4: Verify Column Defaults (Safety Check)
-- ============================================================================

-- Ensure is_deleted has proper default to prevent null constraint violations
DO $$
BEGIN
  ALTER TABLE quote_requests 
    ALTER COLUMN is_deleted SET DEFAULT false,
    ALTER COLUMN is_deleted SET NOT NULL;
EXCEPTION
  WHEN OTHERS THEN
    -- Column might already have these constraints, ignore errors
    NULL;
END $$;

-- Ensure is_tax_exempt has proper default
DO $$
BEGIN
  ALTER TABLE quote_requests 
    ALTER COLUMN is_tax_exempt SET DEFAULT false;
EXCEPTION
  WHEN OTHERS THEN
    -- Column might already have this default, ignore errors
    NULL;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES (for manual testing in Supabase SQL Editor)
-- ============================================================================

-- To verify policies are created correctly, run these queries in Supabase:
--
-- 1. List all policies on quote_requests table:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename = 'quote_requests';
--
-- 2. Verify RLS is enabled:
-- SELECT relname, relrowsecurity 
-- FROM pg_class 
-- WHERE relname = 'quote_requests';
--
-- Expected policies after this migration:
-- - anon_insert_quotes (FOR INSERT TO anon)
-- - authenticated_insert_quotes (FOR INSERT TO authenticated)
-- - admin_select_all_quotes (FOR SELECT TO authenticated, checks admin role)
-- - admin_update_all_quotes (FOR UPDATE TO authenticated, checks admin role)
-- - admin_delete_all_quotes (FOR DELETE TO authenticated, checks admin role)
-- - users_read_own_quotes (FOR SELECT TO authenticated, checks email match)
