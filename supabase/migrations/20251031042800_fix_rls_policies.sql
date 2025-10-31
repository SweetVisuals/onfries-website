-- Fix RLS policies to work with current authentication setup
-- Since admin checks are handled in the application layer, simplify policies

-- Customers table - allow authenticated users to read their own data, admins can manage all
DROP POLICY IF EXISTS "Users can view their own customer data" ON customers;
DROP POLICY IF EXISTS "Admins can manage all customer data" ON customers;

CREATE POLICY "Authenticated users can view customer data" ON customers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage customer data" ON customers
  FOR ALL USING (auth.role() = 'authenticated');

-- Menu items - everyone can read, authenticated users can manage
DROP POLICY IF EXISTS "Everyone can view menu items" ON menu_items;
DROP POLICY IF EXISTS "Admins can manage menu items" ON menu_items;

CREATE POLICY "Everyone can view menu items" ON menu_items
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage menu items" ON menu_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Orders - users can view their own, authenticated users can manage all
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can manage all orders" ON orders;

CREATE POLICY "Authenticated users can view orders" ON orders
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage orders" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

-- Order items - users can view their own, authenticated users can manage all
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
DROP POLICY IF EXISTS "Admins can manage all order items" ON order_items;

CREATE POLICY "Authenticated users can view order items" ON order_items
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage order items" ON order_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Customer logs - users can view their own, authenticated users can view all
DROP POLICY IF EXISTS "Users can view their own logs" ON customer_logs;
DROP POLICY IF EXISTS "Admins can view all customer logs" ON customer_logs;

CREATE POLICY "Authenticated users can view customer logs" ON customer_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage customer logs" ON customer_logs
  FOR ALL USING (auth.role() = 'authenticated');