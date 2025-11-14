/*
  # Comprehensive Fix for Quote Requests RLS Policies
  
  ## Problem
  Users (both anonymous and authenticated) are unable to submit quote requests due to 
  overly restrictive or conflicting RLS policies. The error "new row violates row-level 
  security policy for table quote_requests" indicates that INSERT operations are being blocked.
  
  ## Root Cause
  - Multiple conflicting policies from previous migration attempts
  - Authenticated users may not have proper INSERT permissions
  - Policies may have unintended USING or WITH CHECK constraints
  
  ## Solution
  This migration completely resets and rebuilds the RLS policies for quote_requests with:
  1. Clear, permissive INSERT policies for both anon and authenticated roles
  2. Proper SELECT policies for users to view their own quotes and admins to view all
  3. Admin-only UPDATE and DELETE policies
  4. No unnecessary validation constraints on INSERT operations
  
  ## Security Model
  - ✓ Anyone (anonymous or authenticated) can submit quote requests (INSERT)
  - ✓ Authenticated users can view quotes matching their email (SELECT)
  - ✓ Admin users can view all quotes (SELECT)
  - ✓ Admin users can update all quotes (UPDATE)
  - ✓ Admin users can delete quotes (DELETE)
*/

-- Step 1: Drop ALL existing policies to start fresh
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'quote_requests'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON quote_requests', policy_record.policyname);
    END LOOP;
END $$;

-- Step 2: Ensure RLS is enabled
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Step 3: Create INSERT policies (most permissive, no restrictions)

-- Policy for anonymous users to insert quote requests
CREATE POLICY "Anonymous users can submit quotes"
ON quote_requests
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy for authenticated users to insert quote requests
CREATE POLICY "Authenticated users can submit quotes"
ON quote_requests
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Step 4: Create SELECT policies

-- Authenticated users can view quotes where their email matches
CREATE POLICY "Users can view their own quotes"
ON quote_requests
FOR SELECT
TO authenticated
USING (
  customer_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Admin users can view all quotes
CREATE POLICY "Admins can view all quotes"
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

-- Step 5: Create UPDATE policies (admin only)

CREATE POLICY "Admins can update quotes"
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

-- Step 6: Create DELETE policies (admin only)

CREATE POLICY "Admins can delete quotes"
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

-- Step 7: Grant necessary table permissions
GRANT INSERT ON quote_requests TO anon;
GRANT INSERT ON quote_requests TO authenticated;
GRANT SELECT ON quote_requests TO authenticated;
GRANT UPDATE ON quote_requests TO authenticated;
GRANT DELETE ON quote_requests TO authenticated;

-- Step 8: Verify the policies are correctly applied
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'quote_requests';
    
    IF policy_count < 6 THEN
        RAISE EXCEPTION 'Expected at least 6 policies, but found %', policy_count;
    END IF;
    
    RAISE NOTICE 'Successfully created % RLS policies for quote_requests table', policy_count;
END $$;
