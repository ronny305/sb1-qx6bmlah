/*
  # Add Quote Request Deletion Tracking System

  1. Changes to `quote_requests` table
    - Add `deleted_at` (timestamptz, nullable) - Timestamp when quote was soft-deleted
    - Add `deleted_by` (uuid, nullable) - Foreign key to profiles.id of admin who deleted the quote
    - Add `deletion_reason` (text, nullable) - Optional reason for deletion
    - Add indexes on deleted_at and deleted_by for query performance

  2. New Tables
    - `quote_request_audit_log`
      - `id` (uuid, primary key) - Unique identifier for audit record
      - `quote_request_id` (uuid) - Reference to quote_requests.id
      - `action_type` (text) - Type of action: 'deleted', 'restored', 'permanently_deleted'
      - `performed_by` (uuid) - Foreign key to profiles.id of admin who performed the action
      - `performed_at` (timestamptz) - Timestamp of the action
      - `details` (jsonb) - Additional details like deletion reason
      - `customer_snapshot` (jsonb) - Snapshot of customer and job info at time of action
      - `created_at` (timestamptz) - Record creation timestamp

  3. Security
    - Enable RLS on `quote_request_audit_log` table
    - Add policy for admin-only access to audit logs
    - Add foreign key constraints for data integrity

  4. Important Notes
    - This implements soft deletes - data is never permanently removed unless explicitly using permanent delete
    - All deletion actions are logged in the audit table for compliance
    - Deleted quotes can be restored by clearing the deletion fields
    - The system maintains full accountability of who deleted what and when
*/

-- Add soft delete columns to quote_requests table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_requests' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN deleted_at timestamptz DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_requests' AND column_name = 'deleted_by'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN deleted_by uuid REFERENCES profiles(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_requests' AND column_name = 'deletion_reason'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN deletion_reason text DEFAULT NULL;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS quote_requests_deleted_at_idx ON quote_requests (deleted_at);
CREATE INDEX IF NOT EXISTS quote_requests_deleted_by_idx ON quote_requests (deleted_by);

-- Create quote_request_audit_log table
CREATE TABLE IF NOT EXISTS quote_request_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id uuid NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('deleted', 'restored', 'permanently_deleted')),
  performed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  performed_at timestamptz NOT NULL DEFAULT now(),
  details jsonb DEFAULT '{}'::jsonb,
  customer_snapshot jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit log table
ALTER TABLE quote_request_audit_log ENABLE ROW LEVEL SECURITY;

-- Create indexes for audit log
CREATE INDEX IF NOT EXISTS quote_request_audit_log_quote_id_idx ON quote_request_audit_log (quote_request_id);
CREATE INDEX IF NOT EXISTS quote_request_audit_log_performed_by_idx ON quote_request_audit_log (performed_by);
CREATE INDEX IF NOT EXISTS quote_request_audit_log_performed_at_idx ON quote_request_audit_log (performed_at DESC);
CREATE INDEX IF NOT EXISTS quote_request_audit_log_action_type_idx ON quote_request_audit_log (action_type);

-- Policy for admins to read all audit logs
CREATE POLICY "Admins can read all audit logs"
  ON quote_request_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Policy for admins to insert audit logs
CREATE POLICY "Admins can insert audit logs"
  ON quote_request_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );