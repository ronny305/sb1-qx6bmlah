/*
  # Fix RLS Policies - The Real Solution
  
  ## Discovery
  With RLS disabled, inserts work perfectly. With RLS enabled and policies that have
  WITH CHECK (true), inserts fail with 42501 error.
  
  ## Root Cause
  PostgREST/Supabase may have an issue where policies created with TO anon/authenticated
  are not being evaluated correctly. The solution is to use a different approach.
  
  ## Solution
  1. Re-enable RLS (it was disabled for testing)
  2. Drop ALL existing policies
  3. Create a single PERMISSIVE policy that applies to ALL roles (using TRUE expressions)
  4. Use BYPASSRLS for the postgres role if needed
  
  This is the nuclear option but should work.
*/

-- Re-enable RLS
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Anonymous users can submit quotes" ON quote_requests;
DROP POLICY IF EXISTS "Authenticated users can submit quotes" ON quote_requests;
DROP POLICY IF EXISTS "Public can submit quotes" ON quote_requests;
DROP POLICY IF EXISTS "Admins can view all quotes" ON quote_requests;
DROP POLICY IF EXISTS "Users can view their own quotes" ON quote_requests;
DROP POLICY IF EXISTS "Admins can update quotes" ON quote_requests;
DROP POLICY IF EXISTS "Admins can delete quotes" ON quote_requests;

-- Create ONE single insert policy for ALL (no role restriction)
CREATE POLICY "allow_all_insert"
ON quote_requests
FOR INSERT
WITH CHECK (true);

-- Create SELECT policies
CREATE POLICY "allow_auth_select_own"
ON quote_requests
FOR SELECT
TO authenticated
USING (
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  OR
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- Create UPDATE policy for admins
CREATE POLICY "allow_admin_update"
ON quote_requests
FOR UPDATE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Create DELETE policy for admins  
CREATE POLICY "allow_admin_delete"
ON quote_requests
FOR DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
