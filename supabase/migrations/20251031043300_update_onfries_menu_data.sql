-- Only update the menu data without creating tables
-- This migration assumes the menu_items table already exists

-- Clear existing menu items and insert new OnFries menu items
TRUNCATE menu_items RESTART IDENTITY CASCADE;

-- Insert Main Courses
INSERT INTO menu_items (name, description, price, category, is_available, preparation_time) VALUES
('Steak & Fries', 'Classic steak served with crispy fries', 12.00, 'Main Courses', true, 20),
('Deluxe Steak & Fries', 'Premium steak with crispy fries', 20.00, 'Main Courses', true, 25),
('Steak Only', 'Premium steak served alone', 10.00, 'Main Courses', true, 20),
('Signature Fries', 'Crispy fries with our signature seasoning', 4.00, 'Main Courses', true, 10),
('Premium Steak & Fries', 'Top-quality steak with premium fries', 30.00, 'Main Courses', true, 30);

-- Insert Add-ons
INSERT INTO menu_items (name, description, price, category, is_available, preparation_time) VALUES
('Lamb Chops x2', 'Two premium lamb chops', 11.00, 'Add-ons', true, 0),
('Short Ribs x2', 'Two tender short ribs', 6.00, 'Add-ons', true, 0),
('Green Sauce', 'Extra green sauce add-on', 2.00, 'Add-ons', true, 0),
('Red Sauce', 'Extra red sauce add-on', 2.00, 'Add-ons', true, 0),
('Can of Drink', 'Assorted soft drinks', 1.50, 'Add-ons', true, 0);