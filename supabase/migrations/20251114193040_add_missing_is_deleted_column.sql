/*
  # Add Missing is_deleted Column to Quote Requests
  
  1. Changes
    - Add `is_deleted` (boolean, not null, default false) to quote_requests table
    - Add index for efficient filtering
    - Add deleted_at, deleted_by, deletion_reason columns if missing
  
  2. Purpose
    - Required by the application code for filtering deleted quote requests
    - Allows efficient WHERE is_deleted = false queries
*/

-- Add is_deleted column
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS is_deleted boolean NOT NULL DEFAULT false;

-- Add other deletion tracking columns if they don't exist
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS deleted_by uuid;
ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS deletion_reason text;

-- Create index for performance
CREATE INDEX IF NOT EXISTS quote_requests_is_deleted_idx ON quote_requests (is_deleted);

-- Set all existing records to not deleted
UPDATE quote_requests SET is_deleted = false WHERE is_deleted IS NULL;
