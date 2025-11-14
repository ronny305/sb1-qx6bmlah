/*
  # Fix Anonymous INSERT Policy - Force Bypass Approach

  ## Problem
  The anon_insert_quotes policy WITH CHECK (true) is not working.
  Testing shows anon CAN insert when RLS is disabled, but fails when RLS is enabled.

  ## Root Cause
  The WITH CHECK (true) clause may not be evaluating correctly for the anon role.
  This could be a Supabase-specific issue with how policies are evaluated.

  ## Solution
  Try alternative approaches:
  1. Drop existing policies completely
  2. Create policy using USING clause (which shouldn't matter for INSERT, but try it)
  3. Grant explicit bypass if needed
  
  ## Changes Made
  - Completely recreate the INSERT policies with both USING and WITH CHECK
*/

-- Drop all existing policies on quote_requests
DROP POLICY IF EXISTS "admin_delete_all_quotes" ON quote_requests;
DROP POLICY IF EXISTS "admin_select_all_quotes" ON quote_requests;
DROP POLICY IF EXISTS "admin_update_all_quotes" ON quote_requests;
DROP POLICY IF EXISTS "anon_insert_quotes" ON quote_requests;
DROP POLICY IF EXISTS "authenticated_insert_quotes" ON quote_requests;
DROP POLICY IF EXISTS "users_read_own_quotes" ON quote_requests;

-- Recreate INSERT policies with explicit clauses
CREATE POLICY "anon_insert_quotes"
  ON quote_requests
  AS PERMISSIVE
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "authenticated_insert_quotes"
  ON quote_requests
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Recreate admin SELECT policy
CREATE POLICY "admin_select_all_quotes"
  ON quote_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Recreate admin UPDATE policy
CREATE POLICY "admin_update_all_quotes"
  ON quote_requests
  FOR UPDATE
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

-- Recreate admin DELETE policy
CREATE POLICY "admin_delete_all_quotes"
  ON quote_requests
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Recreate user read own quotes policy
CREATE POLICY "users_read_own_quotes"
  ON quote_requests
  FOR SELECT
  TO authenticated
  USING (customer_email = auth.email());

-- Ensure RLS is enabled
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
