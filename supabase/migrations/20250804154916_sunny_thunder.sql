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

-- Insert sample data from existing projectsData
INSERT INTO projects (title, category, date, description, full_description, image, client, duration, gallery) VALUES
(
  'Miami Film Festival Documentary Shoot',
  'FILM PRODUCTION',
  'December 2024',
  'Provided complete camera package including Sony FX6, lenses, and lighting for award-winning documentary production about Miami''s art scene.',
  'We partnered with acclaimed documentary filmmaker Maria Santos to provide a comprehensive equipment package for her latest film exploring Miami''s vibrant street art culture. The production required versatile gear that could handle both intimate interviews and dynamic street filming across various lighting conditions throughout the city.',
  'https://images.pexels.com/photos/274973/pexels-photo-274973.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
  'Santos Documentary Films',
  '3 weeks',
  '["https://images.pexels.com/photos/3062541/pexels-photo-3062541.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop", "https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop", "https://images.pexels.com/photos/1983032/pexels-photo-1983032.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop", "https://images.pexels.com/photos/66134/pexels-photo-66134.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"]'::jsonb
),
(
  'University of Miami Culinary Program Setup',
  'EDUCATION',
  'November 2024',
  'Complete kitchen equipment rental for semester-long culinary arts program including mixers, ovens, and prep stations for 200+ students.',
  'The University of Miami''s Hospitality & Tourism Management program needed to expand their culinary facilities to accommodate a record enrollment in their new certificate program. We provided a comprehensive kitchen setup that transformed their existing space into a professional-grade culinary education facility.',
  'https://images.pexels.com/photos/6231975/pexels-photo-6231975.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
  'University of Miami - School of Business',
  '4 months',
  '["https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop", "https://images.pexels.com/photos/4518659/pexels-photo-4518659.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop", "https://images.pexels.com/photos/6107/pexels-photo-6107.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop", "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"]'::jsonb
),
(
  'Tech Company Product Launch Event',
  'CORPORATE EVENT',
  'October 2024',
  'Full AV setup including cameras, lighting, and audio equipment for live-streamed product launch event in Brickell with 500+ attendees.',
  'TechFlow Miami needed to create a memorable product launch event for their new AI platform while simultaneously live-streaming to a global audience of thousands. The event required seamless integration of live presentation technology, professional broadcast equipment, and atmospheric lighting to create an engaging experience both in-person and online.',
  'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
  'TechFlow Miami',
  '2 weeks',
  '["https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop", "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop", "https://images.pexels.com/photos/3945316/pexels-photo-3945316.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop", "https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"]'::jsonb
),
(
  'Luxury Real Estate Commercial Shoot',
  'COMMERCIAL',
  'September 2024',
  'High-end furniture and decor rental for luxury real estate commercial featuring $50M penthouse in South Beach.',
  'Miami''s premier luxury real estate agency needed to showcase their most exclusive property - a $50 million penthouse overlooking Biscayne Bay. The existing furniture didn''t match the sophisticated aesthetic required for the commercial, so we provided a complete interior transformation with carefully curated furniture and decor pieces.',
  'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
  'Elite Properties Miami',
  '1 week',
  '["https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop", "https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop", "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop", "https://images.pexels.com/photos/1125137/pexels-photo-1125137.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"]'::jsonb
),
(
  'Music Video Production - Latin Grammy Winner',
  'MUSIC VIDEO',
  'August 2024',
  'Complete lighting and audio package for Latin Grammy winning artist''s music video shoot in Miami''s Design District.',
  'Grammy-winning Latin artist Carlos Rivera needed a sophisticated lighting and audio setup for his latest music video, filmed across multiple locations in Miami''s Design District. The production required equipment that could adapt to both indoor studio settings and outdoor urban environments while maintaining consistent audio and visual quality.',
  'https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
  'Rivera Music Productions',
  '5 days',
  '["https://images.pexels.com/photos/3783471/pexels-photo-3783471.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop", "https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop", "https://images.pexels.com/photos/3834750/pexels-photo-3834750.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop", "https://images.pexels.com/photos/3944091/pexels-photo-3944091.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"]'::jsonb
),
(
  'Wedding Reception Setup - Coral Gables',
  'WEDDING',
  'July 2024',
  'Elegant furniture and tableware rental for 300-guest wedding reception at historic Coral Gables venue.',
  'A luxury wedding at the historic Biltmore Hotel in Coral Gables required an extensive furniture and tableware setup to accommodate 300 guests across multiple reception areas. The couple wanted a timeless, elegant aesthetic that complemented the venue''s Mediterranean Revival architecture while providing modern comfort and functionality.',
  'https://images.pexels.com/photos/1125137/pexels-photo-1125137.jpeg?auto=compress&cs=tinysrgb&w=800&h=400&fit=crop',
  'Rodriguez-Martinez Wedding',
  '3 days',
  '["https://images.pexels.com/photos/6107/pexels-photo-6107.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop", "https://images.pexels.com/photos/1395967/pexels-photo-1395967.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop", "https://images.pexels.com/photos/210922/pexels-photo-210922.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop", "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop"]'::jsonb
);