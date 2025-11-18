-- Create coupons table for admin-managed loyalty coupons
CREATE TABLE coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('free_item', 'percent_off', 'bogo', 'min_order_discount')),
  value TEXT NOT NULL, -- For free_item: menu_item_id, for percent_off: percentage, for others: discount amount
  points_cost INTEGER NOT NULL CHECK (points_cost > 0),
  duration_hours INTEGER NOT NULL DEFAULT 24, -- How long coupon is available after claiming
  max_per_account INTEGER NOT NULL DEFAULT 1, -- How many can be claimed per account
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create customer_coupons table for tracking claimed coupons
CREATE TABLE customer_coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  coupon_id UUID NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT false,
  used_at TIMESTAMP WITH TIME ZONE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id, coupon_id, claimed_at::date) -- One coupon per customer per day
);

-- Create indexes for performance
CREATE INDEX idx_coupons_is_active ON coupons(is_active);
CREATE INDEX idx_customer_coupons_customer_id ON customer_coupons(customer_id);
CREATE INDEX idx_customer_coupons_expires_at ON customer_coupons(expires_at);
CREATE INDEX idx_customer_coupons_is_used ON customer_coupons(is_used);

-- Create function to automatically refund points for expired unused coupons
CREATE OR REPLACE FUNCTION refund_expired_coupon_points()
RETURNS void AS $$
BEGIN
  -- Mark expired coupons as refunded (we'll handle point refund in application logic)
  UPDATE customer_coupons
  SET is_used = true, used_at = NOW()
  WHERE expires_at < NOW() AND is_used = false;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the refund function periodically
-- Note: In production, this should be called by a cron job or scheduled task