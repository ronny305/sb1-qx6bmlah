/*
  # Fix Anonymous INSERT Policy for Quote Requests

  ## Problem
  The anon_insert_quotes policy exists but is not allowing anonymous users to insert records.
  Testing with SET ROLE anon shows "new row violates row-level security policy".

  ## Root Cause
  The policy may have been created incorrectly or there may be a conflict with other policies.
  We need to drop and recreate it with explicit WITH CHECK clause.

  ## Solution
  1. Drop the existing anon_insert_quotes policy
  2. Recreate it with explicit WITH CHECK (true) clause
  3. Also recreate authenticated_insert_quotes for consistency
  
  ## Changes Made
  - Drop and recreate both INSERT policies with explicit syntax
  - Ensure WITH CHECK clauses are properly set
*/

-- Drop existing INSERT policies
DROP POLICY IF EXISTS "anon_insert_quotes" ON quote_requests;
DROP POLICY IF EXISTS "authenticated_insert_quotes" ON quote_requests;

-- Recreate anonymous INSERT policy with explicit WITH CHECK
CREATE POLICY "anon_insert_quotes"
  ON quote_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Recreate authenticated INSERT policy with explicit WITH CHECK
CREATE POLICY "authenticated_insert_quotes"
  ON quote_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Verify RLS is enabled
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
