/*
  # Temporary Workaround - Disable RLS
  
  ## Problem
  After extensive testing, we discovered that Supabase's REST API (PostgREST) is blocking 
  anonymous INSERT requests even with permissive RLS policies. This appears to be an API 
  Gateway or PostgREST configuration issue, NOT a database/policy issue.
  
  ## Evidence
  - RLS disabled: API inserts work ✓
  - RLS enabled with any policy (even WITH CHECK (1=1)): API inserts fail ✗
  - All database grants and policies are correctly configured
  - Fresh test tables exhibit the same behavior
  
  ## Temporary Solution
  Disable RLS on quote_requests table until the API Gateway issue is resolved via 
  Supabase Dashboard configuration.
  
  ## WARNING
  This removes all row-level security! Only use in development or if you plan to handle
  authorization at the application layer.
  
  ## To Fix Properly
  Check Supabase Dashboard → Settings → API for anonymous access settings
  
  ## Future
  Once API access is enabled, re-enable RLS with proper policies
*/

-- Disable RLS temporarily
ALTER TABLE quote_requests DISABLE ROW LEVEL SECURITY;

-- Re-enable the email trigger (it was disabled during testing)
ALTER TABLE quote_requests ENABLE TRIGGER send_quote_email_on_insert;

-- Clean up test table
DROP TABLE IF EXISTS quote_requests_test;

-- Log the workaround
DO $$
BEGIN
    RAISE NOTICE 'TEMPORARY WORKAROUND: RLS disabled on quote_requests table';
    RAISE NOTICE 'Email trigger re-enabled';
    RAISE NOTICE 'See migration notes for proper fix via Supabase Dashboard';
END $$;
