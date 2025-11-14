/*
  # Fix RLS Policies for Anonymous Quote Submissions
  
  ## Problem
  Users submitting quote requests from the website are getting RLS policy violations.
  The issue is that anonymous (unauthenticated) users need explicit permission to 
  insert quote requests, but the current policies may have conflicts or insufficient permissions.
  
  ## Changes
  
  1. Drop Conflicting Policies
     - Remove all existing INSERT policies on quote_requests that might conflict
     - This ensures a clean slate for new policies
  
  2. Create Explicit Anonymous Insert Policy
     - Add a policy specifically for the `anon` role (Supabase's anonymous users)
     - Use `FOR INSERT TO anon` with `WITH CHECK (true)` to allow all anonymous inserts
     - This is the primary policy for public quote submissions
  
  3. Create Authenticated User Insert Policy
     - Add a policy for authenticated users to also insert quotes
     - This ensures logged-in users can also submit quotes
  
  4. Verify Column Defaults
     - Ensure is_deleted defaults to false
     - Ensure is_tax_exempt defaults to false
     - These defaults prevent null constraint violations
  
  ## Security Notes
  - Quote submission is intentionally public (no authentication required)
  - Admin management policies (SELECT, UPDATE, DELETE) remain unchanged
  - All quote data is visible only to admins via separate SELECT policies
  - This follows the business requirement that anyone can request a quote
*/

-- First, drop any conflicting INSERT policies
DROP POLICY IF EXISTS "Allow insert for all users" ON quote_requests;
DROP POLICY IF EXISTS "quote_requests_insert_anonymous" ON quote_requests;
DROP POLICY IF EXISTS "quote_requests_insert_public" ON quote_requests;
DROP POLICY IF EXISTS "quote_requests_insert_authenticated" ON quote_requests;
DROP POLICY IF EXISTS "Anonymous users can insert quotes" ON quote_requests;
DROP POLICY IF EXISTS "Authenticated users can insert quotes" ON quote_requests;

-- Ensure column defaults are set properly
DO $$
BEGIN
  -- Ensure is_deleted has a default value
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_requests' AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE quote_requests ALTER COLUMN is_deleted SET DEFAULT false;
    ALTER TABLE quote_requests ALTER COLUMN is_deleted SET NOT NULL;
  END IF;
  
  -- Ensure is_tax_exempt has a default value
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_requests' AND column_name = 'is_tax_exempt'
  ) THEN
    ALTER TABLE quote_requests ALTER COLUMN is_tax_exempt SET DEFAULT false;
  END IF;
END $$;

-- Create INSERT policy for anonymous users (primary policy for public quote submissions)
CREATE POLICY "Anonymous users can insert quotes"
  ON quote_requests
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create INSERT policy for authenticated users (so logged-in users can also submit quotes)
CREATE POLICY "Authenticated users can insert quotes"
  ON quote_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Note: The existing SELECT, UPDATE, and DELETE policies for admins remain unchanged
-- The "Admin full access" and "Admins can read quote requests" policies handle admin operations
-- The "Users can read own quotes" policy allows authenticated users to view their own quotes
