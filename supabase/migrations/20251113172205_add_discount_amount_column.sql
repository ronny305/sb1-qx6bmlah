/*
  # Add discount_amount column to quote_requests table

  1. Changes
    - Add `discount_amount` column to `quote_requests` table
      - Type: numeric
      - Default: 0
      - Nullable: true for backward compatibility

  2. Notes
    - This column tracks manual discount amounts applied to quotes
    - Default value of 0 ensures existing records are not affected
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quote_requests' AND column_name = 'discount_amount'
  ) THEN
    ALTER TABLE quote_requests ADD COLUMN discount_amount numeric DEFAULT 0;
  END IF;
END $$;