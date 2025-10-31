-- Create customer_logs table for tracking customer activities
CREATE TABLE customer_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- e.g., 'login', 'order_placed', 'profile_updated', 'password_changed'
  details JSONB, -- additional details about the action
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE customer_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own logs
CREATE POLICY "Users can view their own logs" ON customer_logs
  FOR SELECT USING (auth.uid()::text = customer_id::text);

-- Create policy for admins to view all logs
CREATE POLICY "Admins can view all customer logs" ON customer_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_customer_logs_customer_id ON customer_logs(customer_id);
CREATE INDEX idx_customer_logs_action ON customer_logs(action);
CREATE INDEX idx_customer_logs_created_at ON customer_logs(created_at);