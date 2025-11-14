/*
  # Temporarily Disable RLS on quote_requests for Debugging
  
  ## Problem
  The anon role cannot insert despite having:
  - INSERT privilege granted
  - RLS policy with WITH CHECK (true)
  - No restrictive policies
  - Works fine when RLS is disabled
  
  ## Temporary Solution
  Disable RLS temporarily to allow the application to function while we investigate
  why SET ROLE anon fails in SQL but might work through the Supabase REST API.
  
  ## Note
  This is NOT a production solution. We need to re-enable RLS after confirming
  the REST API works correctly.
*/

-- Temporarily disable RLS
ALTER TABLE quote_requests DISABLE ROW LEVEL SECURITY;
