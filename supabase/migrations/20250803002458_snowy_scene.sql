/*
  # Fix Quote Requests RLS Policy - Definitive Solution

  1. Problem
    - Anonymous users cannot insert quote requests due to RLS policy violations
    - Status 401 errors when submitting quote forms
    - "new row violates row-level security policy" error

  2. Solution
    - Temporarily disable RLS to clear all policies
    - Create simple, permissive INSERT policy for anonymous users
    - Maintain admin access and user read access
    - Re-enable RLS with working policies

  3. Security
    - Anonymous users can create quote requests (business requirement)
    - Authenticated users can read their own requests
    - Admins can manage all requests
*/

-- Step 1: Temporarily disable RLS to clean slate
ALTER TABLE quote_requests DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies to avoid conflicts
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'quote_requests' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON quote_requests', policy_record.policyname);
    END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Step 4: Create new, working policies

-- Allow anonymous quote request creation (this is the key fix)
CREATE POLICY "allow_anonymous_quote_creation"
ON quote_requests
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow public access for insert (covers both anon and authenticated)
CREATE POLICY "allow_public_quote_creation"
ON quote_requests
FOR INSERT
TO public
WITH CHECK (true);

-- Allow authenticated users to read their own quote requests
CREATE POLICY "users_read_own_requests"
ON quote_requests
FOR SELECT
TO authenticated
USING (customer_email = auth.email());

-- Allow admins to manage all quote requests
CREATE POLICY "admins_manage_all_requests"
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