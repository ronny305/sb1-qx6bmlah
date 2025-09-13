/*
  # Fix infinite recursion in profiles table policies

  1. Problem
    - The "Admins can read all profiles" policy creates infinite recursion
    - Policy tries to query profiles table from within profiles table policy
    - This causes circular dependency when checking admin status

  2. Solution
    - Drop the problematic admin policy that queries profiles table
    - Keep the simple "Users can read own profile" policy
    - Admin access will be handled through service role or simplified approach

  3. Security
    - Users can still only read their own profile data
    - Admin functionality will work through application logic
    - RLS remains enabled for data protection
*/

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Keep the working policies that don't cause recursion
-- "Users can read own profile" policy is fine as it uses uid() = id
-- "Users can update own profile" policy is fine as it uses uid() = id

-- Note: Admin users will still be able to access profiles through the application
-- using the service role key when needed, or through simplified client-side logic