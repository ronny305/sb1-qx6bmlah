/*
  # Final RLS Policies for Quote Requests - Enable Anonymous Inserts

  ## Problem
  Anonymous users cannot submit quote requests due to RLS policies blocking inserts.
  Testing with SET ROLE anon fails, but this may be because SET ROLE doesn't properly
  simulate the Supabase REST API authentication context.

  ## Solution
  Create comprehensive RLS policies that explicitly allow:
  1. Anonymous users (anon role) to INSERT quote requests
  2. Authenticated users to INSERT quote requests
  3. Authenticated users to SELECT their own quotes
  4. Admin users to SELECT, UPDATE, and DELETE all quotes

  ## Security Model
  - Public quote submission (no auth required) ✓
  - Users can view only their own quotes ✓
  - Only admins can manage all quotes ✓
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "allow_anon_insert" ON quote_requests;
DROP POLICY IF EXISTS "anon_insert_quotes" ON quote_requests;
DROP POLICY IF EXISTS "authenticated_insert_quotes" ON quote_requests;
DROP POLICY IF EXISTS "admin_select_all_quotes" ON quote_requests;
DROP POLICY IF EXISTS "admin_update_all_quotes" ON quote_requests;
DROP POLICY IF EXISTS "admin_delete_all_quotes" ON quote_requests;
DROP POLICY IF EXISTS "users_read_own_quotes" ON quote_requests;

-- Enable RLS
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow anonymous users to insert quote requests
CREATE POLICY "Enable insert for anon users"
ON quote_requests
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy 2: Allow authenticated users to insert quote requests
CREATE POLICY "Enable insert for authenticated users"
ON quote_requests
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 3: Allow authenticated users to read their own quotes
CREATE POLICY "Enable read for own quotes"
ON quote_requests
FOR SELECT
TO authenticated
USING (customer_email = auth.email());

-- Policy 4: Allow admins to read all quotes
CREATE POLICY "Enable read for admins"
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

-- Policy 5: Allow admins to update all quotes
CREATE POLICY "Enable update for admins"
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

-- Policy 6: Allow admins to delete quotes
CREATE POLICY "Enable delete for admins"
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
