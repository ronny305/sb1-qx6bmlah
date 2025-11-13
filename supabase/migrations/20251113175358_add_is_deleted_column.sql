/*
  # Add is_deleted Boolean Column to Quote Requests

  1. Changes to `quote_requests` table
    - Add `is_deleted` (boolean, not null, default false) - Quick boolean flag for filtering deleted quotes
  
  2. Important Notes
    - This complements the existing `deleted_at` column for more efficient filtering
    - When a quote is soft-deleted, both `is_deleted` should be true and `deleted_at` should be set
    - This allows for simple WHERE is_deleted = false queries without null checks
*/

-- Add is_deleted column to quote_requests table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_requests' AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN is_deleted boolean NOT NULL DEFAULT false;
  END IF;
END $$;

-- Create index for performance on is_deleted queries
CREATE INDEX IF NOT EXISTS quote_requests_is_deleted_idx ON quote_requests (is_deleted);
