-- Update menu item IDs to match the local data IDs
-- This ensures order creation works with the correct UUIDs

-- Update main courses
UPDATE menu_items SET id = '567b6a07-f08a-48dc-8401-350900404a5a' WHERE name = 'Deluxe Steak & Fries';
UPDATE menu_items SET id = 'bafb0ca1-7a7d-477c-95db-8340750d5073' WHERE name = 'Steak & Fries';
UPDATE menu_items SET id = 'dcdedc23-359a-4120-9c3c-488386410364' WHERE name = 'Steak Only';
UPDATE menu_items SET id = '135dda9e-ce09-480a-b7cc-fa48a202fa0b' WHERE name = 'Signature Fries';

-- Update add-ons
UPDATE menu_items SET id = 'f119d64e-3340-4552-a207-58171cf328f0' WHERE name = 'Green Sauce';
UPDATE menu_items SET id = 'f9d7308a-399c-4abe-a125-237fc4722824' WHERE name = 'Red Sauce';
UPDATE menu_items SET id = '4d26334c-0d1e-4c3e-8b87-1075c66b678b' WHERE name = 'Steak';
UPDATE menu_items SET id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' WHERE name = 'Short Rib';
UPDATE menu_items SET id = 'b2c3d4e5-f6a7-8901-bcde-f23456789012' WHERE name = 'Lamb Chop';

-- Update kids menu
UPDATE menu_items SET id = '2836bb5e-3d5e-4a8a-8b63-64b55786b5d4' WHERE name = 'Kids Meal';
UPDATE menu_items SET id = '40902b4c-4e1e-46b3-8d91-e44b0bb800cf' WHERE name = 'Kids Fries';
UPDATE menu_items SET id = '73919a44-13f5-4976-9cd5-9ab2ec6a9aef' WHERE name = '£1 Steak Cone';

-- Update drinks
UPDATE menu_items SET id = '4495999f-0737-43c2-a961-9601a2677a66' WHERE name = 'Coke';
UPDATE menu_items SET id = '4664385c-0601-4496-94c9-57fbb007a34d' WHERE name = 'Coke Zero';
UPDATE menu_items SET id = '992f34f6-6bda-475d-8273-4ba06e115fca' WHERE name = 'Tango Mango';