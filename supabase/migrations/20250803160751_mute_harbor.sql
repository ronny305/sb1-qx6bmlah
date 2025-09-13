/*
  # Fix Quote Requests RLS Policy

  This migration fixes the RLS policy issue preventing quote request submissions.
  
  1. Temporarily disable RLS
  2. Drop all existing policies
  3. Create a simple INSERT policy allowing all users
  4. Re-enable RLS
*/

-- Temporarily disable RLS to clear any conflicts
ALTER TABLE quote_requests DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies on quote_requests
DROP POLICY IF EXISTS "quote_requests_admin_access" ON quote_requests;
DROP POLICY IF EXISTS "quote_requests_insert_anonymous" ON quote_requests;
DROP POLICY IF EXISTS "quote_requests_insert_authenticated" ON quote_requests;
DROP POLICY IF EXISTS "quote_requests_insert_public" ON quote_requests;
DROP POLICY IF EXISTS "quote_requests_select_own" ON quote_requests;

-- Re-enable RLS
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Create a simple INSERT policy that allows anyone to create quote requests
CREATE POLICY "Allow insert for all users" ON quote_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create a policy for admins to manage all quote requests
CREATE POLICY "Admin full access" ON quote_requests
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

-- Create a policy for users to read their own quote requests
CREATE POLICY "Users can read own quotes" ON quote_requests
  FOR SELECT
  TO authenticated
  USING (customer_email = auth.email());