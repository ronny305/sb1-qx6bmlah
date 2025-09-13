/*
  # Fix Complete RLS Policies for Profiles and Quote Requests

  1. Profiles Table
    - Ensure proper RLS policies for profile access
    - Allow authenticated users to read their own profiles
    - Allow service role full access

  2. Quote Requests Table  
    - Clear any conflicting policies
    - Allow anonymous users to insert quote requests
    - Allow authenticated users to read their own requests
    - Allow admins to manage all requests
*/

-- Fix profiles table policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Service role full access" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Ensure RLS is enabled on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Recreate profiles policies
CREATE POLICY "profiles_select_own"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_service_role_access"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Fix quote_requests table policies
DROP POLICY IF EXISTS "allow_anonymous_quote_creation" ON quote_requests;
DROP POLICY IF EXISTS "allow_public_quote_creation" ON quote_requests;
DROP POLICY IF EXISTS "admins_manage_all_requests" ON quote_requests;
DROP POLICY IF EXISTS "users_read_own_requests" ON quote_requests;

-- Ensure RLS is enabled on quote_requests
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Recreate quote_requests policies
CREATE POLICY "quote_requests_insert_anonymous"
  ON quote_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "quote_requests_insert_public"
  ON quote_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "quote_requests_insert_authenticated"
  ON quote_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "quote_requests_select_own"
  ON quote_requests
  FOR SELECT
  TO authenticated
  USING (customer_email = auth.email());

CREATE POLICY "quote_requests_admin_access"
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