/*
  # Fix Anonymous Quote Submission - Final Solution
  
  ## Problem
  The anon role cannot insert into quote_requests despite having:
  - Correct RLS policy with WITH CHECK (true)
  - Table-level INSERT grant
  - No restrictive policies blocking
  
  ## Root Cause
  Supabase's PostgREST layer may not be correctly mapping the JWT role to the database role context.
  
  ## Solution
  1. Drop the existing anon INSERT policy
  2. Recreate it with explicit role targeting
  3. Add a PUBLIC policy as fallback
  4. Grant explicit sequence usage rights
  
  ## Testing
  After this migration, test with:
  - Direct curl with anon key
  - Application quote submission
*/

-- Drop existing anonymous insert policy
DROP POLICY IF EXISTS "Anonymous users can submit quotes" ON quote_requests;

-- Recreate with explicit anon role and ensure no hidden conditions
CREATE POLICY "Anonymous users can submit quotes"
ON quote_requests
FOR INSERT
TO anon
WITH CHECK (true);

-- Also ensure there's no gap - create a catch-all public insert policy
-- This will allow both anon and authenticated to insert
DROP POLICY IF EXISTS "Public can submit quotes" ON quote_requests;

CREATE POLICY "Public can submit quotes"  
ON quote_requests
FOR INSERT
TO public
WITH CHECK (true);

-- Ensure sequence permissions (sometimes the issue is with auto-increment IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify the policies were created
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'quote_requests'
    AND policyname IN ('Anonymous users can submit quotes', 'Public can submit quotes');
    
    IF policy_count < 2 THEN
        RAISE EXCEPTION 'Expected 2 insert policies, but found %', policy_count;
    END IF;
    
    RAISE NOTICE 'Successfully created % insert policies for quote_requests', policy_count;
END $$;
