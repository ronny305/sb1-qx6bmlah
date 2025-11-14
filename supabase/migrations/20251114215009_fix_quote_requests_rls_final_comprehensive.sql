/*
  # Comprehensive RLS Policy Fix for Quote Requests Table
  
  ## Problem Statement
  Anonymous users submitting quote requests are getting RLS policy violations.
  Multiple previous migrations have created a conflicting mess of policies.
  
  ## Solution
  This migration provides a complete reset and clean slate for quote_requests RLS policies.
  It supersedes ALL previous quote_requests RLS migrations.
  
  ## Changes Made
  
  ### 1. Policy Cleanup
  - Drop ALL existing policies on quote_requests table (regardless of name)
  - Start with a completely clean slate to eliminate conflicts
  
  ### 2. Column Defaults
  - Ensure is_deleted has DEFAULT false and NOT NULL constraint
  - Ensure is_tax_exempt has DEFAULT false
  - These defaults prevent null constraint violations during INSERT
  
  ### 3. New Policy Structure (Simple and Clear)
  
  **Policy A: "anon_insert_quotes"**
  - Role: anon (anonymous/unauthenticated users)
  - Operation: INSERT only
  - Purpose: Allow public quote form submissions
  - Check: WITH CHECK (true) - no restrictions
  
  **Policy B: "authenticated_insert_quotes"**
  - Role: authenticated (logged-in users)
  - Operation: INSERT only
  - Purpose: Allow logged-in users to submit quotes
  - Check: WITH CHECK (true) - no restrictions
  
  **Policy C: "admin_full_access_quotes"**
  - Role: authenticated (but checks for admin role)
  - Operation: ALL (SELECT, INSERT, UPDATE, DELETE)
  - Purpose: Allow admins to manage all quote requests
  - Check: User must have role='admin' in profiles table
  
  **Policy D: "users_read_own_quotes"**
  - Role: authenticated
  - Operation: SELECT only
  - Purpose: Allow users to view their own submitted quotes
  - Check: customer_email matches auth.email()
  
  ## Security Notes
  - RLS is ENABLED (security is enforced)
  - Anonymous INSERT is intentional (business requirement for public quote form)
  - Only admins can view/manage quotes through admin policies
  - Regular authenticated users can only view their own quotes
  - The combination of policies creates a secure but functional system
  
  ## Testing Required
  1. Anonymous user submits quote → Should succeed
  2. Authenticated user submits quote → Should succeed
  3. Admin views all quotes → Should succeed
  4. Regular user tries to view other user's quotes → Should fail
  5. Anonymous user tries to view quotes → Should fail
*/

-- ============================================================================
-- STEP 1: Complete Policy Cleanup (Drop Everything)
-- ============================================================================

-- Drop all possible policy names from all previous migrations
DROP POLICY IF EXISTS "Admins can manage all quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON quote_requests;
DROP POLICY IF EXISTS "Users can read own quote requests by email" ON quote_requests;
DROP POLICY IF EXISTS "quote_requests_admin_access" ON quote_requests;
DROP POLICY IF EXISTS "quote_requests_insert_anonymous" ON quote_requests;
DROP POLICY IF EXISTS "quote_requests_insert_authenticated" ON quote_requests;
DROP POLICY IF EXISTS "quote_requests_insert_public" ON quote_requests;
DROP POLICY IF EXISTS "quote_requests_select_own" ON quote_requests;
DROP POLICY IF EXISTS "Allow insert for all users" ON quote_requests;
DROP POLICY IF EXISTS "Admin full access" ON quote_requests;
DROP POLICY IF EXISTS "Users can read own quotes" ON quote_requests;
DROP POLICY IF EXISTS "allow_anonymous_quote_creation" ON quote_requests;
DROP POLICY IF EXISTS "allow_public_quote_creation" ON quote_requests;
DROP POLICY IF EXISTS "admins_manage_all_requests" ON quote_requests;
DROP POLICY IF EXISTS "users_read_own_requests" ON quote_requests;
DROP POLICY IF EXISTS "Allow authenticated users to insert quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Allow public to insert quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Admins can manage quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Users can view their own quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Allow anon insert" ON quote_requests;
DROP POLICY IF EXISTS "Allow anon insert quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Admins can view all quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Admins can read quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Anonymous users can insert quotes" ON quote_requests;
DROP POLICY IF EXISTS "Authenticated users can insert quotes" ON quote_requests;
DROP POLICY IF EXISTS "Anyone can insert quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Users can read own quote requests" ON quote_requests;

-- Drop any remaining policies we might have missed (catch-all)
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

-- ============================================================================
-- STEP 2: Ensure Column Defaults Are Properly Set
-- ============================================================================

-- Set is_deleted column default and NOT NULL constraint
ALTER TABLE quote_requests 
  ALTER COLUMN is_deleted SET DEFAULT false,
  ALTER COLUMN is_deleted SET NOT NULL;

-- Set is_tax_exempt column default
ALTER TABLE quote_requests 
  ALTER COLUMN is_tax_exempt SET DEFAULT false;

-- ============================================================================
-- STEP 3: Ensure RLS is Enabled
-- ============================================================================

ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Create New Clean Policy Set
-- ============================================================================

-- Policy A: Allow anonymous users to INSERT quote requests
CREATE POLICY "anon_insert_quotes"
  ON quote_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy B: Allow authenticated users to INSERT quote requests
CREATE POLICY "authenticated_insert_quotes"
  ON quote_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy C: Allow admins to perform ALL operations on quote requests
CREATE POLICY "admin_full_access_quotes"
  ON quote_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy D: Allow authenticated users to view their own quote requests
CREATE POLICY "users_read_own_quotes"
  ON quote_requests
  FOR SELECT
  TO authenticated
  USING (customer_email = auth.email());
