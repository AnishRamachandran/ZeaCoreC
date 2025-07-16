-- Create customer_users table
-- This SQL should be executed in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS customer_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, customer_id)
);

-- Enable RLS
ALTER TABLE customer_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own customer associations"
  ON customer_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own customer associations"
  ON customer_users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own customer associations"
  ON customer_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_users_user_id ON customer_users(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_users_customer_id ON customer_users(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_users_user_customer ON customer_users(user_id, customer_id);