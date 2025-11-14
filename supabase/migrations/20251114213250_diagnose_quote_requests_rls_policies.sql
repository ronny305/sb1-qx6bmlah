/*
  # Diagnostic Check for Quote Requests RLS Policies
  
  This migration diagnoses the current state of RLS policies on the quote_requests table.
  It creates a temporary function to output diagnostic information about:
  - All existing policies on quote_requests
  - Column defaults for is_deleted and is_tax_exempt
  - RLS enablement status
  
  This migration is safe to run and makes no changes to the database.
  The diagnostic information will be available via SELECT statements.
*/

-- Create a temporary table to store diagnostic results
CREATE TEMP TABLE IF NOT EXISTS rls_diagnostic_results (
  check_name text,
  result text
);

-- Check if RLS is enabled on quote_requests
DO $$
DECLARE
  rls_enabled boolean;
BEGIN
  SELECT relrowsecurity INTO rls_enabled
  FROM pg_class
  WHERE relname = 'quote_requests';
  
  INSERT INTO rls_diagnostic_results VALUES 
    ('RLS Enabled on quote_requests', CASE WHEN rls_enabled THEN 'YES' ELSE 'NO' END);
END $$;

-- List all policies on quote_requests table
DO $$
DECLARE
  policy_record RECORD;
  policy_list text := '';
BEGIN
  FOR policy_record IN 
    SELECT policyname, cmd, roles::text, qual::text as using_clause, with_check::text
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'quote_requests'
    ORDER BY policyname
  LOOP
    policy_list := policy_list || E'\n' || 
      'Policy: ' || policy_record.policyname || 
      ', Command: ' || policy_record.cmd || 
      ', Roles: ' || policy_record.roles ||
      ', USING: ' || COALESCE(policy_record.using_clause, 'none') ||
      ', WITH CHECK: ' || COALESCE(policy_record.with_check, 'none');
  END LOOP;
  
  IF policy_list = '' THEN
    policy_list := 'NO POLICIES FOUND';
  END IF;
  
  INSERT INTO rls_diagnostic_results VALUES ('All Policies', policy_list);
END $$;

-- Check INSERT policies specifically
DO $$
DECLARE
  insert_policy_count int;
  insert_policies text := '';
  policy_record RECORD;
BEGIN
  SELECT COUNT(*) INTO insert_policy_count
  FROM pg_policies 
  WHERE schemaname = 'public' 
  AND tablename = 'quote_requests'
  AND cmd = 'INSERT';
  
  INSERT INTO rls_diagnostic_results VALUES 
    ('INSERT Policy Count', insert_policy_count::text);
  
  FOR policy_record IN 
    SELECT policyname, roles::text
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'quote_requests'
    AND cmd = 'INSERT'
    ORDER BY policyname
  LOOP
    insert_policies := insert_policies || E'\n' || policy_record.policyname || ' (Roles: ' || policy_record.roles || ')';
  END LOOP;
  
  IF insert_policies != '' THEN
    INSERT INTO rls_diagnostic_results VALUES ('INSERT Policies', insert_policies);
  END IF;
END $$;

-- Check column defaults
DO $$
DECLARE
  is_deleted_default text;
  is_deleted_not_null boolean;
  is_tax_exempt_default text;
BEGIN
  SELECT column_default, is_nullable INTO is_deleted_default, is_deleted_not_null
  FROM information_schema.columns
  WHERE table_name = 'quote_requests' AND column_name = 'is_deleted';
  
  SELECT column_default INTO is_tax_exempt_default
  FROM information_schema.columns
  WHERE table_name = 'quote_requests' AND column_name = 'is_tax_exempt';
  
  INSERT INTO rls_diagnostic_results VALUES 
    ('is_deleted column', 
     'Default: ' || COALESCE(is_deleted_default, 'NONE') || 
     ', NOT NULL: ' || CASE WHEN is_deleted_not_null THEN 'NO' ELSE 'YES' END);
  
  INSERT INTO rls_diagnostic_results VALUES 
    ('is_tax_exempt column', 
     'Default: ' || COALESCE(is_tax_exempt_default, 'NONE'));
END $$;

-- Output diagnostic results
-- Note: These results are stored in a temp table and can be queried
-- Run: SELECT * FROM rls_diagnostic_results; to see the results
