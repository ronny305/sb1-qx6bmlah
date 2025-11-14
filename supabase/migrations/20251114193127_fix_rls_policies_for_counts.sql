/*
  # Fix RLS Policies for Admin Dashboard Queries
  
  1. Problem
    - The SELECT policies on equipment, projects, and quote_requests require checking profiles table
    - This can cause issues when admin users try to load counts using COUNT(*) with head: true
    - The "head: true" option only returns count, not rows, but RLS still evaluates on the query
  
  2. Solution
    - Add separate SELECT policies that allow authenticated admins to SELECT
    - Keep the public read policies for unauthenticated users
    - Ensure COUNT queries work properly for admins
*/

-- For equipment: Already has public read, so authenticated users (including admins) can read
-- No changes needed for equipment

-- For projects: Already has public read, so authenticated users (including admins) can read  
-- No changes needed for projects

-- For quote_requests: Add a SELECT policy for admins (separate from the ALL policy)
DROP POLICY IF EXISTS "Admins can read quote requests" ON quote_requests;
CREATE POLICY "Admins can read quote requests"
  ON quote_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );
