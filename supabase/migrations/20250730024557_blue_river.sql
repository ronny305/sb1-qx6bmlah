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

-- Insert mock data
INSERT INTO equipment (name, main_category, category, subcategory, description, image, specifications) VALUES
-- Video Production Equipment
('Sony FX6 Cinema Camera', 'production', 'video', 'cameras', 'Professional full-frame cinema camera with dual base ISO', 'https://images.pexels.com/photos/274973/pexels-photo-274973.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Full Frame Sensor", "10-bit 4:2:2", "Dual Base ISO", "S-Cinetone"]'),
('Canon C70 Cinema Camera', 'production', 'video', 'cameras', 'Compact RF-mount cinema camera with Super 35mm sensor', 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Super 35mm Sensor", "4K DCI", "Canon Log", "RF Mount"]'),
('RED Komodo 6K', 'production', 'video', 'cameras', 'Ultra-compact 6K global shutter cinema camera', 'https://images.pexels.com/photos/1983032/pexels-photo-1983032.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["6K Global Shutter", "R3D RAW", "Canon RF Mount", "120fps"]'),
('Canon 24-70mm f/2.8L IS', 'production', 'video', 'lenses', 'Professional zoom lens with image stabilization', 'https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["24-70mm", "f/2.8", "Image Stabilization", "Weather Sealed"]'),
('Sony 85mm f/1.4 GM', 'production', 'video', 'lenses', 'Premium portrait lens with beautiful bokeh', 'https://images.pexels.com/photos/606541/pexels-photo-606541.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["85mm", "f/1.4", "G Master", "Fast AF"]'),
('Sachtler FSB 8 Tripod', 'production', 'video', 'support', 'Professional fluid head tripod system', 'https://images.pexels.com/photos/66134/pexels-photo-66134.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["8kg Payload", "Fluid Head", "Carbon Fiber Legs", "Touch & Go Plate"]'),
('DJI Ronin 4D', 'production', 'video', 'stabilizers', '4-axis cinema camera with integrated gimbal', 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["4-axis Gimbal", "6K Full Frame", "ActiveTrack", "LiDAR Focus"]'),
('Atomos Ninja V', 'production', 'video', 'monitors', '5-inch HDR monitor/recorder with SSD recording', 'https://images.pexels.com/photos/3945316/pexels-photo-3945316.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["5-inch HDR", "4K Recording", "SSD Compatible", "1000 nits"]'),
('SmallRig Camera Cage', 'production', 'video', 'accessories', 'Modular camera cage system for rigging', 'https://images.pexels.com/photos/3945314/pexels-photo-3945314.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Modular Design", "1/4-20 Threads", "Cold Shoe Mounts", "Lightweight"]'),
('V-Mount Battery Kit', 'production', 'video', 'power', 'Professional battery system with charger', 'https://images.pexels.com/photos/163117/battery-charging-recharging-charge-163117.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["150Wh Capacity", "D-Tap Output", "USB-C", "LCD Display"]'),

-- Audio Equipment
('Rode PodMic', 'production', 'audio', 'microphones', 'Broadcast-quality dynamic microphone for podcasting', 'https://images.pexels.com/photos/3756766/pexels-photo-3756766.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Dynamic", "XLR", "Internal Pop Shield", "Rich Tone"]'),
('Shure SM7B', 'production', 'audio', 'microphones', 'Professional broadcast dynamic microphone', 'https://images.pexels.com/photos/3783471/pexels-photo-3783471.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Dynamic", "Flat Response", "Pop Filter", "Shock Mount"]'),
('Audio-Technica AT2020', 'production', 'audio', 'microphones', 'Studio condenser microphone with cardioid pattern', 'https://images.pexels.com/photos/3834750/pexels-photo-3834750.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Condenser", "Cardioid", "Phantom Power", "Low Noise"]'),
('Zoom H6 Handy Recorder', 'production', 'audio', 'recorders', '6-track portable recorder with interchangeable capsules', 'https://images.pexels.com/photos/164938/pexels-photo-164938.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["6-Track", "Interchangeable Mics", "Phantom Power", "Backup Recording"]'),
('Behringer X32 Digital Mixer', 'production', 'audio', 'mixers', '32-channel digital mixing console', 'https://images.pexels.com/photos/164745/pexels-photo-164745.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["32 Channels", "Digital", "Built-in Effects", "WiFi Control"]'),

-- Lighting Equipment
('ARRI SkyPanel S60-C', 'production', 'lighting', 'led-panels', 'Color-tunable LED softlight panel', 'https://images.pexels.com/photos/66134/pexels-photo-66134.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["RGB+W", "60W", "Color Tunable", "DMX Control"]'),
('Aputure 300D Mark II', 'production', 'lighting', 'led-lights', '300W COB LED light with bowens mount', 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["300W COB", "Bowens Mount", "Wireless Control", "5600K"]'),
('Godox SL-60W', 'production', 'lighting', 'led-lights', '60W LED video light with Bowens mount', 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["60W LED", "Bowens Mount", "5600K", "Remote Control"]'),
('Softbox 90cm', 'production', 'lighting', 'modifiers', 'Octagonal softbox for soft lighting', 'https://images.pexels.com/photos/2608517/pexels-photo-2608517.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["90cm Octagon", "Bowens Mount", "Diffusion Fabric", "Quick Setup"]'),
('Beauty Dish 70cm', 'production', 'lighting', 'modifiers', 'Professional beauty dish with honeycomb grid', 'https://images.pexels.com/photos/442150/pexels-photo-442150.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["70cm", "Silver Interior", "Honeycomb Grid", "Bowens Mount"]'),

-- Home Economics Equipment
('KitchenAid Stand Mixer', 'home-ec-set', 'home-ec', 'mixers', 'Professional 6-quart stand mixer with accessories', 'https://images.pexels.com/photos/6231975/pexels-photo-6231975.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["6-quart Bowl", "10 Speeds", "Tilt-Head", "Multiple Attachments"]'),
('Convection Oven', 'home-ec-set', 'home-ec', 'ovens', 'Commercial convection oven for baking', 'https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Convection", "Digital Controls", "Multiple Racks", "Timer"]'),
('Commercial Refrigerator', 'home-ec-set', 'home-ec', 'refrigeration', 'Stainless steel commercial refrigerator', 'https://images.pexels.com/photos/2696064/pexels-photo-2696064.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Stainless Steel", "Digital Temperature", "Glass Doors", "Energy Efficient"]'),
('Food Processor', 'home-ec-set', 'home-ec', 'processors', 'Heavy-duty food processor with multiple blades', 'https://images.pexels.com/photos/6231975/pexels-photo-6231975.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["14-cup Capacity", "Multiple Blades", "Variable Speed", "Safety Lock"]'),
('Commercial Blender', 'home-ec-set', 'home-ec', 'blenders', 'High-performance blender for smoothies and soups', 'https://images.pexels.com/photos/6231975/pexels-photo-6231975.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["2HP Motor", "Variable Speed", "Sound Enclosure", "Timer"]'),

-- Production Set Rentals
('Living Room Set - Modern', 'home-ec-set', 'production-set', 'furniture', 'Complete modern living room furniture set', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["3-piece Sofa Set", "Coffee Table", "Side Tables", "Modern Design"]'),
('Bedroom Set - Victorian', 'home-ec-set', 'production-set', 'furniture', 'Period Victorian bedroom furniture collection', 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Ornate Bed Frame", "Matching Nightstands", "Dresser", "Period Accurate"]'),
('Office Desk Set', 'home-ec-set', 'production-set', 'furniture', 'Executive office furniture with desk and bookshelf', 'https://images.pexels.com/photos/667838/pexels-photo-667838.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Executive Desk", "Leather Chair", "Bookshelf", "Professional Look"]'),
('Vintage TV Collection', 'home-ec-set', 'production-set', 'electronics', 'Period television sets from different decades', 'https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["50s-90s TVs", "Working Displays", "Period Accurate", "Multiple Sizes"]'),
('Wall Art Collection', 'home-ec-set', 'production-set', 'decor', 'Curated artwork and framed pieces for set decoration', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Various Styles", "Framed Pieces", "Multiple Sizes", "Period Options"]');