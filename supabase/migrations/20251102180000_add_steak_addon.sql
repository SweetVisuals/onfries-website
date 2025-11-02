-- Migration to add Steak add-on that was missing from database
-- This migration adds the Steak add-on to the menu_items table

-- Add the missing Steak add-on to the database
INSERT INTO menu_items (name, description, price, category, is_available, preparation_time) 
VALUES ('Steak', 'Add an extra steak to your meal', 10.00, 'Add-ons', true, 0);

-- Verify the insertion
SELECT name, price, category, is_available FROM menu_items WHERE name = 'Steak';