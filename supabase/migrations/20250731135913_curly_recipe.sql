/*
  # Create quote requests management

  1. New Tables
    - `quote_requests`
      - `id` (uuid, primary key)
      - `customer_name` (text)
      - `customer_email` (text)
      - `customer_phone` (text)  
      - `company` (text, nullable)
      - `job_name` (text)
      - `job_number` (text, nullable)
      - `purchase_order_number` (text, nullable)
      - `start_date` (date)
      - `end_date` (date)
      - `shooting_locations` (text)
      - `special_requests` (text, nullable)
      - `items` (jsonb) - stores cart items
      - `status` (text, default 'pending')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `quote_requests` table
    - Add policies for users and admins
*/

-- Create quote_requests table
CREATE TABLE IF NOT EXISTS quote_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  company text,
  job_name text NOT NULL,
  job_number text,
  purchase_order_number text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  shooting_locations text NOT NULL,
  special_requests text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Add status constraint
ALTER TABLE quote_requests ADD CONSTRAINT quote_requests_status_check 
CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress', 'completed'));

-- Policies for admins to manage all quote requests
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

-- Policy for users to read their own quote requests (optional)
CREATE POLICY "Users can read own quote requests"
  ON quote_requests
  FOR SELECT
  TO authenticated
  USING (customer_email = auth.email());

-- Add index for performance
CREATE INDEX IF NOT EXISTS quote_requests_status_idx ON quote_requests (status);
CREATE INDEX IF NOT EXISTS quote_requests_created_at_idx ON quote_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS quote_requests_customer_email_idx ON quote_requests (customer_email);