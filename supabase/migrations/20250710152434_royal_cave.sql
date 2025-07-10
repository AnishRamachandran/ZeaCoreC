/*
  # Ticket Module Schema

  1. New Tables
    - `tickets`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `status` (text: open, in_progress, resolved, closed)
      - `priority` (text: low, medium, high, urgent)
      - `customer_id` (uuid, foreign key to customers)
      - `assigned_to` (uuid, foreign key to user_profiles)
      - `app_id` (uuid, foreign key to apps, nullable)
      - `external_id` (text, for integration with PixelDesk)
      - `due_date` (date, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `ticket_comments`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, foreign key to tickets)
      - `user_id` (uuid, foreign key to user_profiles)
      - `content` (text)
      - `is_internal` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `ticket_attachments`
      - `id` (uuid, primary key)
      - `ticket_id` (uuid, foreign key to tickets)
      - `user_id` (uuid, foreign key to user_profiles)
      - `file_name` (text)
      - `file_url` (text)
      - `file_type` (text)
      - `file_size` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage tickets

  3. Indexes
    - Add indexes for better query performance
*/

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'medium',
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  app_id uuid REFERENCES apps(id) ON DELETE SET NULL,
  external_id text,
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ticket_comments table
CREATE TABLE IF NOT EXISTS ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  is_internal boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ticket_attachments table
CREATE TABLE IF NOT EXISTS ticket_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  file_size integer,
  created_at timestamptz DEFAULT now()
);

-- Add constraints
ALTER TABLE tickets ADD CONSTRAINT check_ticket_status 
  CHECK (status IN ('open', 'in_progress', 'resolved', 'closed'));

ALTER TABLE tickets ADD CONSTRAINT check_ticket_priority 
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Enable Row Level Security
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can read tickets"
  ON tickets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage tickets"
  ON tickets FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read ticket comments"
  ON ticket_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage ticket comments"
  ON ticket_comments FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read ticket attachments"
  ON ticket_attachments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage ticket attachments"
  ON ticket_attachments FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_app_id ON tickets(app_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_external_id ON tickets(external_id);
CREATE INDEX IF NOT EXISTS idx_tickets_due_date ON tickets(due_date);

CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_user_id ON ticket_comments(user_id);

CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket_id ON ticket_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_user_id ON ticket_attachments(user_id);

-- Create function to update ticket updated_at timestamp
CREATE OR REPLACE FUNCTION update_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update ticket updated_at timestamp
CREATE TRIGGER before_ticket_update
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_updated_at();

-- Create function to update ticket_comment updated_at timestamp
CREATE OR REPLACE FUNCTION update_ticket_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update ticket_comment updated_at timestamp
CREATE TRIGGER before_ticket_comment_update
  BEFORE UPDATE ON ticket_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_comment_updated_at();

-- Create function to update parent ticket updated_at when comment is added
CREATE OR REPLACE FUNCTION update_parent_ticket_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tickets
  SET updated_at = NOW()
  WHERE id = NEW.ticket_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update parent ticket when comment is added
CREATE TRIGGER after_ticket_comment_insert_or_update
  AFTER INSERT OR UPDATE ON ticket_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_parent_ticket_on_comment();

-- Create function to update parent ticket updated_at when attachment is added
CREATE OR REPLACE FUNCTION update_parent_ticket_on_attachment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tickets
  SET updated_at = NOW()
  WHERE id = NEW.ticket_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update parent ticket when attachment is added
CREATE TRIGGER after_ticket_attachment_insert
  AFTER INSERT ON ticket_attachments
  FOR EACH ROW
  EXECUTE FUNCTION update_parent_ticket_on_attachment();

-- Insert sample data
INSERT INTO tickets (id, title, description, status, priority, customer_id, assigned_to, app_id, external_id, due_date)
VALUES
  ('aa1e8400-e29b-41d4-a716-446655440001', 'Login issue with ProjectFlow', 'User cannot log in to the application after password reset', 'open', 'high', '770e8400-e29b-41d4-a716-446655440001', NULL, '550e8400-e29b-41d4-a716-446655440001', 'PD-1001', '2023-12-25'),
  ('aa1e8400-e29b-41d4-a716-446655440002', 'Feature request: Export to PDF', 'Customer requests ability to export reports to PDF format', 'in_progress', 'medium', '770e8400-e29b-41d4-a716-446655440002', NULL, '550e8400-e29b-41d4-a716-446655440001', 'PD-1002', '2023-12-30'),
  ('aa1e8400-e29b-41d4-a716-446655440003', 'DataVault sync failing', 'Automatic sync between local and cloud storage is failing intermittently', 'open', 'urgent', '770e8400-e29b-41d4-a716-446655440001', NULL, '550e8400-e29b-41d4-a716-446655440002', 'PD-1003', '2023-12-20'),
  ('aa1e8400-e29b-41d4-a716-446655440004', 'Dashboard loading slowly', 'Analytics dashboard takes over 30 seconds to load', 'in_progress', 'medium', '770e8400-e29b-41d4-a716-446655440003', NULL, '550e8400-e29b-41d4-a716-446655440003', 'PD-1004', '2023-12-28'),
  ('aa1e8400-e29b-41d4-a716-446655440005', 'Add user permission issue', 'Admin cannot add new users to the system', 'resolved', 'high', '770e8400-e29b-41d4-a716-446655440004', NULL, '550e8400-e29b-41d4-a716-446655440001', 'PD-1005', '2023-12-15'),
  ('aa1e8400-e29b-41d4-a716-446655440006', 'Billing discrepancy', 'Customer charged incorrect amount for subscription', 'open', 'high', '770e8400-e29b-41d4-a716-446655440002', NULL, NULL, 'PD-1006', '2023-12-22'),
  ('aa1e8400-e29b-41d4-a716-446655440007', 'API rate limit exceeded', 'Customer hitting API rate limits consistently', 'open', 'medium', '770e8400-e29b-41d4-a716-446655440001', NULL, '550e8400-e29b-41d4-a716-446655440001', 'PD-1007', '2023-12-26'),
  ('aa1e8400-e29b-41d4-a716-446655440008', 'Mobile app crashes on startup', 'iOS app crashes immediately after splash screen', 'in_progress', 'high', '770e8400-e29b-41d4-a716-446655440003', NULL, '550e8400-e29b-41d4-a716-446655440004', 'PD-1008', '2023-12-21'),
  ('aa1e8400-e29b-41d4-a716-446655440009', 'Password reset email not received', 'Customer not receiving password reset emails', 'resolved', 'medium', '770e8400-e29b-41d4-a716-446655440004', NULL, '550e8400-e29b-41d4-a716-446655440001', 'PD-1009', '2023-12-18'),
  ('aa1e8400-e29b-41d4-a716-446655440010', 'Data migration request', 'Customer needs help migrating data from legacy system', 'closed', 'low', '770e8400-e29b-41d4-a716-446655440002', NULL, '550e8400-e29b-41d4-a716-446655440002', 'PD-1010', '2023-12-10');

-- Insert sample ticket comments
INSERT INTO ticket_comments (ticket_id, user_id, content, is_internal)
VALUES
  ('aa1e8400-e29b-41d4-a716-446655440001', (SELECT id FROM user_profiles LIMIT 1), 'Investigating the login issue. Will update soon.', true),
  ('aa1e8400-e29b-41d4-a716-446655440001', (SELECT id FROM user_profiles LIMIT 1), 'Found the issue with the authentication service. Working on a fix.', true),
  ('aa1e8400-e29b-41d4-a716-446655440002', (SELECT id FROM user_profiles LIMIT 1), 'This feature is already on our roadmap for Q1 2024.', false),
  ('aa1e8400-e29b-41d4-a716-446655440003', (SELECT id FROM user_profiles LIMIT 1), 'Checking server logs for sync failures.', true),
  ('aa1e8400-e29b-41d4-a716-446655440005', (SELECT id FROM user_profiles LIMIT 1), 'Fixed the permission issue. It was related to a recent security update.', false),
  ('aa1e8400-e29b-41d4-a716-446655440005', (SELECT id FROM user_profiles LIMIT 1), 'Closing this ticket as resolved. Please reopen if the issue persists.', false);