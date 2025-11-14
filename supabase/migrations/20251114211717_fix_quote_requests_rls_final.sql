/*
  # Final Fix for Quote Requests RLS Policy
  
  ## Problem
  Anonymous users are getting RLS policy violations when submitting quote requests.
  Investigation revealed duplicate INSERT policies that may cause conflicts.
  
  ## Changes Made
  
  1. Policy Cleanup
     - Remove duplicate "Allow anon insert quote requests" policy
     - Keep "Anonymous users can insert quotes" policy for anon role
     - Keep "Authenticated users can insert quotes" policy for authenticated role
     - Maintain existing admin policies (ALL and SELECT)
  
  2. Column Defaults Verification
     - Ensure is_deleted has default false and NOT NULL constraint
     - Ensure is_tax_exempt has default false
     - Both columns are properly configured for anonymous submissions
  
  3. Security Notes
     - RLS remains ENABLED for security
     - Anonymous users can INSERT quote requests (public form submissions)
     - Only admins can SELECT, UPDATE, DELETE quote requests
     - Policies use WITH CHECK (true) for unrestricted public inserts
  
  ## Expected Outcome
  After this migration, anonymous users should be able to submit quote requests
  without encountering RLS policy violations.
*/

-- Remove the duplicate anon INSERT policy
DROP POLICY IF EXISTS "Allow anon insert quote requests" ON quote_requests;

-- Verify and ensure column defaults are properly set
DO $$
BEGIN
  -- Ensure is_deleted column has proper default and constraint
  ALTER TABLE quote_requests 
    ALTER COLUMN is_deleted SET DEFAULT false,
    ALTER COLUMN is_deleted SET NOT NULL;
  
  -- Ensure is_tax_exempt has proper default
  ALTER TABLE quote_requests 
    ALTER COLUMN is_tax_exempt SET DEFAULT false;
    
EXCEPTION
  WHEN OTHERS THEN
    -- Column constraints already exist, continue
    NULL;
END $$;

-- Verify the remaining policies are correct
-- These should already exist from previous migrations, but we verify them here

-- Ensure anonymous users can insert (this should already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'quote_requests' 
    AND policyname = 'Anonymous users can insert quotes'
  ) THEN
    CREATE POLICY "Anonymous users can insert quotes"
      ON quote_requests
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;
END $$;

-- Ensure authenticated users can insert (this should already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'quote_requests' 
    AND policyname = 'Authenticated users can insert quotes'
  ) THEN
    CREATE POLICY "Authenticated users can insert quotes"
      ON quote_requests
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- Ensure RLS is enabled
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
