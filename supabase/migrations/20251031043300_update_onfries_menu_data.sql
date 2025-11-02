-- Only update the menu data without creating tables
-- This migration assumes the menu_items table already exists

-- Create store_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS store_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default store status (open)
INSERT INTO store_settings (key, value) VALUES ('store_open', 'true')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS on store_settings table
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read/write store settings
CREATE POLICY "Allow authenticated users to manage store settings" ON store_settings
FOR ALL USING (auth.role() = 'authenticated');

-- Clear existing menu items and insert new OnFries menu items
TRUNCATE menu_items RESTART IDENTITY CASCADE;

-- Insert Main Courses
INSERT INTO menu_items (name, description, price, category, is_available, preparation_time) VALUES
('Premium Steak & Fries', 'Premium steak served with crispy fries and signature seasoning', 12.00, 'Main Courses', true, 20),
('Fries', 'Crispy fries with signature seasoning', 5.00, 'Main Courses', true, 10);

-- Insert Add-ons
INSERT INTO menu_items (name, description, price, category, is_available, preparation_time) VALUES
('Steak', 'Add an extra steak to your meal', 10.00, 'Add-ons', true, 0),
('Short Ribs x2', 'Two tender short ribs - perfect with your steak and fries', 6.00, 'Add-ons', true, 0),
('Lamb Chops x2', 'Two premium lamb chops - premium add-on for your steak and fries', 11.00, 'Add-ons', true, 0),
('Green Sauce', 'Extra green sauce add-on', 2.00, 'Add-ons', true, 0),
('Red Sauce', 'Extra red sauce add-on', 2.00, 'Add-ons', true, 0),
('Can of Drink', 'Assorted soft drinks', 1.50, 'Add-ons', true, 0);