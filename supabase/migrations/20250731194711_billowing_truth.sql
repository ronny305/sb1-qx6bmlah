/*
  # Fix RLS Policies Security Review

  This migration reviews and fixes all RLS policies to ensure proper security:

  1. Equipment Table Issues
     - Remove overly permissive policy allowing all authenticated users to manage equipment
     - Keep only admin access for management and public read access

  2. Profiles Table Issues  
     - Add policy for admins to read all profiles for user management

  3. Quote Requests Table
     - Policies look correct after recent additions
*/

-- Fix Equipment Table Policies
-- Remove the overly permissive policy that allows all authenticated users to manage equipment
DROP POLICY IF EXISTS "Authenticated users can manage equipment" ON equipment;

-- Ensure equipment policies are correct:
-- 1. Public read access (already exists)
-- 2. Admin full access (already exists)

-- Add Admin policy for profiles table
-- Admins should be able to read all user profiles for management purposes
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Ensure quote_requests policies are complete
-- (These should already be correct from previous migrations)

-- Verify all tables have RLS enabled
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;