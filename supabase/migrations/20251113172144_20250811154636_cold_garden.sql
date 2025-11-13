/*
  # Add units per item and update pricing system

  1. Schema Changes
    - Rename `price` column to `price_per_unit` for clarity
    - Add `units_per_item` column to track bundle sizes (e.g., 50 chairs per item)
    - Set default values to maintain backward compatibility

  2. Data Migration
    - Set default `units_per_item` to 1 for existing equipment
    - Existing `price` values become `price_per_unit` values

  This allows equipment like "Chairs (qty 50)" to be properly tracked:
  - price_per_unit: $2.50 (per individual chair)
  - units_per_item: 50 (50 chairs in one rental bundle)
  - Customer selects 2 bundles = 100 total chairs at $5.00 per day per chair
*/

-- Rename price column to price_per_unit for clarity
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'equipment' AND column_name = 'price'
  ) THEN
    ALTER TABLE equipment RENAME COLUMN price TO price_per_unit;
  END IF;
END $$;

-- Add units_per_item column to track bundle sizes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'equipment' AND column_name = 'units_per_item'
  ) THEN
    ALTER TABLE equipment ADD COLUMN units_per_item integer DEFAULT 1;
  END IF;
END $$;

-- Update existing equipment to have units_per_item = 1 if not set
UPDATE equipment 
SET units_per_item = 1 
WHERE units_per_item IS NULL;

-- Add constraint to ensure units_per_item is always positive
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'equipment_units_per_item_positive'
  ) THEN
    ALTER TABLE equipment ADD CONSTRAINT equipment_units_per_item_positive CHECK (units_per_item > 0);
  END IF;
END $$;