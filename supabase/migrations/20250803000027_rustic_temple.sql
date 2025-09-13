/*
  # Fix RLS Policy for Quote Requests

  1. Security Changes
    - Drop existing INSERT policy that may be conflicting
    - Create new policy to allow anyone (including anonymous users) to insert quote requests
    - Ensure proper permissions for public quote submission
*/

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Anyone can insert quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Users can read own quote requests" ON quote_requests;
DROP POLICY IF EXISTS "Admins can manage all quote requests" ON quote_requests;

-- Allow anyone (including anonymous users) to insert quote requests
CREATE POLICY "Enable insert for anonymous users"
  ON quote_requests
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow authenticated users to read their own quote requests by email
CREATE POLICY "Users can read own quote requests by email"
  ON quote_requests
  FOR SELECT
  TO authenticated
  USING (customer_email = auth.email());

-- Allow admins to manage all quote requests
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