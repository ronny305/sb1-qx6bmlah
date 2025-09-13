/*
  # Fix Quote Requests RLS Policy

  This migration fixes the RLS policy violation error when creating quote requests.
  It ensures anonymous users can insert quote requests while maintaining proper security.

  1. Security Changes
    - Drop all existing conflicting policies
    - Create simple, clear policies for anonymous inserts
    - Maintain admin and user read access
    - Ensure no policy conflicts
*/

-- Drop all existing policies on quote_requests to start fresh
DROP POLICY IF EXISTS "Admins can manage all quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON quote_requests;
DROP POLICY IF EXISTS "Users can read own quote requests by email" ON quote_requests;

-- Create policy to allow anyone (including anonymous users) to insert quote requests
CREATE POLICY "Allow anonymous quote request creation"
  ON quote_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policy to allow admins to manage all quote requests
CREATE POLICY "Admins can manage all quote requests"
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

-- Create policy to allow authenticated users to read their own quote requests
CREATE POLICY "Users can read own quote requests"
  ON quote_requests
  FOR SELECT
  TO authenticated
  USING (customer_email = auth.email());

-- Ensure RLS is enabled on the table
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;