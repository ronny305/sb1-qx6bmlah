/*
  # Create Equipment Table

  1. New Tables
    - `equipment`
      - `id` (bigint, primary key, auto-increment)
      - `name` (text, not null)
      - `main_category` (text, not null) - 'production' or 'home-ec-set'
      - `category` (text, not null)
      - `subcategory` (text, not null)
      - `description` (text, not null)
      - `image` (text, not null)
      - `specifications` (jsonb) - array of specification strings
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `equipment` table
    - Add policy for public read access (equipment catalog is public)
    - Add policy for authenticated users to manage equipment (admin functionality)

  3. Indexes
    - Index on main_category for efficient filtering
    - Index on category for subcategory filtering
*/

CREATE TABLE IF NOT EXISTS equipment (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  main_category text NOT NULL CHECK (main_category IN ('production', 'home-ec-set')),
  category text NOT NULL,
  subcategory text NOT NULL,
  description text NOT NULL,
  image text NOT NULL,
  specifications jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- Policy for public read access (equipment catalog is public)
CREATE POLICY "Equipment is publicly readable"
  ON equipment
  FOR SELECT
  TO public
  USING (true);

-- Policy for authenticated users to manage equipment (for admin functionality)
CREATE POLICY "Authenticated users can manage equipment"
  ON equipment
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS equipment_main_category_idx ON equipment(main_category);
CREATE INDEX IF NOT EXISTS equipment_category_idx ON equipment(category);
CREATE INDEX IF NOT EXISTS equipment_subcategory_idx ON equipment(subcategory);