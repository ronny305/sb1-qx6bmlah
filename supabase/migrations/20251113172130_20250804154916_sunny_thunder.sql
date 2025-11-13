/*
  # Create projects table for managing project portfolio

  1. New Tables
    - `projects`
      - `id` (bigint, primary key, auto-increment)
      - `title` (text)
      - `category` (text)
      - `date` (text)
      - `description` (text)
      - `full_description` (text)
      - `image` (text, URL)
      - `client` (text)
      - `duration` (text)
      - `gallery` (jsonb, array of image URLs)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `projects` table
    - Add policy for public read access
    - Add policy for admin users to manage projects

  3. Indexes
    - Add index on category for filtering
    - Add index on created_at for ordering
*/

CREATE TABLE IF NOT EXISTS projects (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title text NOT NULL,
  category text NOT NULL,
  date text NOT NULL,
  description text NOT NULL,
  full_description text NOT NULL,
  image text NOT NULL,
  client text NOT NULL,
  duration text NOT NULL,
  gallery jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Projects are publicly readable"
  ON projects
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage all projects"
  ON projects
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

-- Create indexes
CREATE INDEX IF NOT EXISTS projects_category_idx ON projects (category);
CREATE INDEX IF NOT EXISTS projects_created_at_idx ON projects (created_at DESC);