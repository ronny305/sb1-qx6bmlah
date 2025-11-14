/*
  # Fix RLS with Explicit Role Check
  
  ## New Approach
  Maybe the issue is that Supabase requires checking the JWT role claim explicitly in the policy.
  Let's try using current_setting to check the role.
*/

-- Drop existing policy
DROP POLICY IF EXISTS "allow_all_insert" ON quote_requests;

-- Try with explicit current_user/current_role check
CREATE POLICY "allow_all_insert_v2"
ON quote_requests
FOR INSERT
WITH CHECK (
  current_setting('request.jwt.claims', true)::json->>'role' = 'anon'
  OR
  current_setting('request.jwt.claims', true)::json->>'role' = 'authenticated'
  OR
  true  -- fallback
);

-- Also try creating a super permissive one without any check
DROP POLICY IF EXISTS "allow_all_insert_no_check" ON quote_requests;

CREATE POLICY "allow_all_insert_no_check"
ON quote_requests
FOR INSERT
WITH CHECK (1=1);  -- Different way to say "true"
