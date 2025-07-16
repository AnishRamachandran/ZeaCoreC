/*
  # Create customer_users table

  1. New Tables
    - `customer_users`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `customer_id` (uuid, foreign key to customers)
      - `role` (text: admin, user)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `customer_users` table
    - Add policy for authenticated users to read their own data
*/

-- Create customer_users table to link auth users to customers
CREATE TABLE IF NOT EXISTS customer_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure unique combination of user and customer
  UNIQUE(user_id, customer_id)
);

-- Add explicit foreign key constraint for better Supabase schema introspection
ALTER TABLE customer_users ADD CONSTRAINT fk_customer_users_customer_id 
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

-- Add constraint to ensure valid role values
ALTER TABLE customer_users ADD CONSTRAINT check_customer_user_role 
  CHECK (role IN ('admin', 'user'));

-- Enable Row Level Security
ALTER TABLE customer_users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read their own customer links"
  ON customer_users
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage customer users"
  ON customer_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.user_id = auth.uid() AND ur.level <= 2
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_users_user_id ON customer_users(user_id);
CREATE INDEX IF NOT EXISTS idx_customer_users_customer_id ON customer_users(customer_id);

-- Insert sample data (link existing users to customers)
INSERT INTO customer_users (user_id, customer_id, role)
SELECT 
  up.user_id,
  c.id,
  'admin'
FROM user_profiles up
CROSS JOIN customers c
WHERE c.id = '770e8400-e29b-41d4-a716-446655440001'
AND NOT EXISTS (
  SELECT 1 FROM customer_users cu 
  WHERE cu.user_id = up.user_id AND cu.customer_id = c.id
)
LIMIT 1;