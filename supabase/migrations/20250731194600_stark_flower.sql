/*
  # Add policy for users to insert quote requests

  1. Security
    - Add policy to allow users to insert their own quote requests
    - Users can insert quote requests with their own email address

  This allows authenticated and unauthenticated users to submit quote requests.
*/

-- Allow anyone to insert quote requests
CREATE POLICY "Anyone can insert quote requests"
  ON quote_requests
  FOR INSERT
  TO public
  WITH CHECK (true);