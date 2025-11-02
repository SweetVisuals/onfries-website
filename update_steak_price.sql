-- ADD THE STEAK ADD-ON TO THE DATABASE
-- The Steak add-on is missing from the database, so we need to insert it

INSERT INTO menu_items (name, description, price, category, is_available, preparation_time) 
VALUES ('Steak', 'Add an extra steak to your meal', 10.00, 'Add-ons', true, 0);