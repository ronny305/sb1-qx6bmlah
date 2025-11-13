/*
  # Fix Admin RLS Policies

  This migration resolves loading issues on admin dashboard pages by:
  
  1. Quote Requests Table
     - Re-enables RLS for proper security
     - Allows anonymous users to insert quote requests (for public submissions)
     - Allows admin users to manage all quote requests (select, insert, update, delete)
  
  2. Equipment Table  
     - Allows public users to read equipment (for browsing catalog)
     - Allows admin users to manage all equipment (select, insert, update, delete)
  
  3. Security
     - Drops conflicting existing policies to start fresh
     - Uses proper admin role checking via profiles table
*/

-- Re-enable RLS for quote_requests if it was disabled
ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies on quote_requests to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users to insert quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Allow public to insert quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Admins can manage quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Users can view their own quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Allow anon insert" ON public.quote_requests;
DROP POLICY IF EXISTS "Allow anon insert quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Admins can view all quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Admins can manage all quote requests" ON public.quote_requests;
DROP POLICY IF EXISTS "Users can read own quote requests" ON public.quote_requests;

-- Policy for quote_requests: Allow anonymous users to insert (for public quote submission)
CREATE POLICY "Allow anon insert quote requests"
ON public.quote_requests
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy for quote_requests: Admins can manage all quote requests (select, insert, update, delete)
CREATE POLICY "Admins can manage all quote requests"
ON public.quote_requests
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Drop existing policies on equipment to avoid conflicts
DROP POLICY IF EXISTS "Admins can manage equipment" ON public.equipment;
DROP POLICY IF EXISTS "Equipment is publicly readable" ON public.equipment;
DROP POLICY IF EXISTS "Admins can manage all equipment" ON public.equipment;
DROP POLICY IF EXISTS "Authenticated users can manage equipment" ON public.equipment;

-- Policy for equipment: Equipment is publicly readable
CREATE POLICY "Equipment is publicly readable"
ON public.equipment
FOR SELECT
TO public
USING (true);

-- Policy for equipment: Admins can manage all equipment (select, insert, update, delete)
CREATE POLICY "Admins can manage all equipment"
ON public.equipment
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));