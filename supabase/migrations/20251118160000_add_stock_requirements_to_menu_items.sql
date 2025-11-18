-- Add stock_requirements column to menu_items table
ALTER TABLE menu_items ADD COLUMN stock_requirements JSONB;

-- Update menu items with their stock requirements
UPDATE menu_items SET stock_requirements = '[{"stockItem": "Steaks", "quantity": 1}, {"stockItem": "Fries", "quantity": 1}]' WHERE id = '567b6a07-f08a-48dc-8401-350900404a5a'; -- Deluxe Steak & Fries
UPDATE menu_items SET stock_requirements = '[{"stockItem": "Steaks", "quantity": 1}, {"stockItem": "Fries", "quantity": 1}]' WHERE id = 'bafb0ca1-7a7d-477c-95db-8340750d5073'; -- Steak & Fries
UPDATE menu_items SET stock_requirements = '[{"stockItem": "Steaks", "quantity": 1}]' WHERE id = 'dcdedc23-359a-4120-9c3c-488386410364'; -- Steak Only
UPDATE menu_items SET stock_requirements = '[{"stockItem": "Fries", "quantity": 1}]' WHERE id = '135dda9e-ce09-480a-b7cc-fa48a202fa0b'; -- Signature Fries

-- Add-ons
UPDATE menu_items SET stock_requirements = '[{"stockItem": "Green Sauce", "quantity": 1}]' WHERE id = 'f119d64e-3340-4552-a207-58171cf328f0'; -- Green Sauce
UPDATE menu_items SET stock_requirements = '[{"stockItem": "Red Sauce", "quantity": 1}]' WHERE id = 'f9d7308a-399c-4abe-a125-237fc4722824'; -- Red Sauce
UPDATE menu_items SET stock_requirements = '[{"stockItem": "Steaks", "quantity": 1}]' WHERE id = '4d26334c-0d1e-4c3e-8b87-1075c66b678b'; -- Steak
UPDATE menu_items SET stock_requirements = '[{"stockItem": "Short Rib", "quantity": 1}]' WHERE id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; -- Short Rib
UPDATE menu_items SET stock_requirements = '[{"stockItem": "Lamb", "quantity": 1}]' WHERE id = 'b2c3d4e5-f6a7-8901-bcde-f23456789012'; -- Lamb Chop

-- Kids Menu
UPDATE menu_items SET stock_requirements = '[{"stockItem": "Steaks", "quantity": 1}, {"stockItem": "Fries", "quantity": 1}]' WHERE id = '2836bb5e-3d5e-4a8a-8b63-64b55786b5d4'; -- Kids Meal
UPDATE menu_items SET stock_requirements = '[{"stockItem": "Fries", "quantity": 1}]' WHERE id = '40902b4c-4e1e-46b3-8d91-e44b0bb800cf'; -- Kids Fries
UPDATE menu_items SET stock_requirements = '[{"stockItem": "Steaks", "quantity": 1}]' WHERE id = '73919a44-13f5-4976-9cd5-9ab2ec6a9aef'; -- £1 Steak Cone

-- Drinks
UPDATE menu_items SET stock_requirements = '[{"stockItem": "Coke / Pepsi", "quantity": 1}]' WHERE id = '4495999f-0737-43c2-a961-9601a2677a66'; -- Coke
UPDATE menu_items SET stock_requirements = '[{"stockItem": "Coke Zero", "quantity": 1}]' WHERE id = '4664385c-0601-4496-94c9-57fbb007a34d'; -- Coke Zero
UPDATE menu_items SET stock_requirements = '[{"stockItem": "Tango Mango", "quantity": 1}]' WHERE id = '992f34f6-6bda-475d-8273-4ba06e115fca'; -- Tango Mango