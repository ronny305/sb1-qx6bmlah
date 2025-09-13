/*
  # Add is_tax_exempt column to quote_requests table

  1. Changes
    - Add `is_tax_exempt` column to `quote_requests` table
      - Type: boolean
      - Default: false
      - Nullable: true for backward compatibility

  2. Notes
    - This column tracks whether a customer has Florida State Tax Exemption
    - Default value of false ensures existing records are not affected
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_requests' AND column_name = 'is_tax_exempt'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN is_tax_exempt boolean DEFAULT false;
  END IF;
END $$;