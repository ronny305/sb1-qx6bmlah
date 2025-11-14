/*
  # Fix Quote Requests RLS and Profiles Check Constraint
  
  1. Security Fixes
    - Enable RLS on quote_requests table (was disabled)
    - Fix profiles table check constraint to allow both 'user' and 'admin' roles
    
  2. Changes
    - ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY
    - Drop incorrect check constraint on profiles.role
    - Add correct check constraint for profiles.role
*/

-- Enable RLS on quote_requests table
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Fix the profiles table role constraint
-- First, drop the incorrect constraint if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_role_check' 
    AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;
  END IF;
END $$;

-- Add the correct constraint that allows both 'user' and 'admin'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_role_valid' 
    AND conrelid = 'profiles'::regclass
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_role_valid 
    CHECK (role IN ('user', 'admin'));
  END IF;
END $$;
