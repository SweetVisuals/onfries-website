-- Add display_id column to orders table for sequential order numbering
ALTER TABLE orders ADD COLUMN display_id TEXT;

-- Create an index on display_id for faster queries
CREATE INDEX idx_orders_display_id ON orders(display_id);

-- Update existing orders with sequential display_ids based on creation order
-- This will assign display_ids starting from 001 for the oldest orders
WITH numbered_orders AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
  FROM orders
)
UPDATE orders
SET display_id = LPAD(numbered_orders.row_num::TEXT, 3, '0')
FROM numbered_orders
WHERE orders.id = numbered_orders.id;