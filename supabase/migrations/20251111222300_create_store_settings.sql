-- Create store_settings table for admin-controlled store settings
CREATE TABLE store_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_store_settings_key ON store_settings(key);

-- Insert default store open status (true by default)
INSERT INTO store_settings (key, value) VALUES ('store_open', 'true');