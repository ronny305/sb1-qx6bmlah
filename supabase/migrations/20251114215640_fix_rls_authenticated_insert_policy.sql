/*
  # Fix RLS Policy for Authenticated User INSERT
  
  ## Problem
  The admin_full_access_quotes policy is blocking regular authenticated users from inserting
  because it checks for admin role but applies to ALL operations including INSERT.
  This conflicts with the authenticated_insert_quotes policy.
  
  ## Solution
  Split the admin_full_access_quotes policy into separate policies:
  1. Admin INSERT policy (allows all authenticated users to insert)
  2. Admin SELECT/UPDATE/DELETE policy (only admins can view/modify)
  
  This ensures:
  - Anonymous users can INSERT (via anon_insert_quotes policy)
  - Authenticated users can INSERT (via authenticated_insert_quotes policy) 
  - Only admins can SELECT/UPDATE/DELETE all records (via admin policies)
  - Regular authenticated users can only SELECT their own records
  
  ## Changes
  1. Drop the conflicting admin_full_access_quotes policy
  2. Recreate it only for SELECT, UPDATE, DELETE operations (not INSERT)
  3. Keep authenticated_insert_quotes for INSERT operations
*/

-- Drop the conflicting admin policy
DROP POLICY IF EXISTS "admin_full_access_quotes" ON quote_requests;

-- Recreate admin policy ONLY for SELECT, UPDATE, DELETE (not INSERT)
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

-- The existing policies already handle INSERT correctly:
-- - anon_insert_quotes: allows anonymous users to INSERT
-- - authenticated_insert_quotes: allows authenticated users to INSERT
