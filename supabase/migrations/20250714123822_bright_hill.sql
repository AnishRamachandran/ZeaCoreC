/*
  # Create Ticket Module Tables

  1. New Tables
    - `tickets`: Stores ticket information including title, description, status, priority, etc.
    - `ticket_comments`: Stores comments on tickets with support for internal-only comments
    - `ticket_attachments`: Stores file attachments for tickets

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users

  3. Triggers
    - Add trigger to update ticket updated_at timestamp
    - Add trigger to update ticket comment updated_at timestamp
    - Add trigger to update parent ticket when comment is added
    - Add trigger to update parent ticket when attachment is added
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
  external_id text, -- For PixelDesk integration
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
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_app_id ON tickets(app_id);
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
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update ticket updated_at timestamp
CREATE TRIGGER before_ticket_update
  BEFORE UPDATE ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_updated_at();

-- Create function to update ticket comment updated_at timestamp
CREATE OR REPLACE FUNCTION update_ticket_comment_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update ticket comment updated_at timestamp
CREATE TRIGGER before_ticket_comment_update
  BEFORE UPDATE ON ticket_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_comment_updated_at();

-- Create function to update parent ticket when comment is added
CREATE OR REPLACE FUNCTION update_parent_ticket_on_comment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tickets
  SET updated_at = now()
  WHERE id = NEW.ticket_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update parent ticket when comment is added or updated
CREATE TRIGGER after_ticket_comment_insert_or_update
  AFTER INSERT OR UPDATE ON ticket_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_parent_ticket_on_comment();

-- Create function to update parent ticket when attachment is added
CREATE OR REPLACE FUNCTION update_parent_ticket_on_attachment()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tickets
  SET updated_at = now()
  WHERE id = NEW.ticket_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update parent ticket when attachment is added
CREATE TRIGGER after_ticket_attachment_insert
  AFTER INSERT ON ticket_attachments
  FOR EACH ROW
  EXECUTE FUNCTION update_parent_ticket_on_attachment();

-- Insert sample tickets for testing
INSERT INTO tickets (
  id, title, description, status, priority, customer_id, assigned_to, app_id, external_id, due_date
)
VALUES
  ('990e8400-e29b-41d4-a716-446655440001', 'Login issue with ProjectFlow', 
   'Users are unable to log in to the ProjectFlow app. They receive a "Server Error" message after entering credentials.', 
   'open', 'high', '770e8400-e29b-41d4-a716-446655440001', NULL, '550e8400-e29b-41d4-a716-446655440001', 
   'PD-1001', CURRENT_DATE + INTERVAL '2 days'),
   
  ('990e8400-e29b-41d4-a716-446655440002', 'Feature request: Export to PDF', 
   'Customer has requested the ability to export reports to PDF format in the DataVault app.', 
   'in_progress', 'medium', '770e8400-e29b-41d4-a716-446655440002', NULL, '550e8400-e29b-41d4-a716-446655440002', 
   'PD-1002', CURRENT_DATE + INTERVAL '5 days'),
   
  ('990e8400-e29b-41d4-a716-446655440003', 'DataVault sync failing', 
   'Synchronization between DataVault and external CRM system is failing with timeout errors.', 
   'open', 'urgent', '770e8400-e29b-41d4-a716-446655440003', NULL, '550e8400-e29b-41d4-a716-446655440002', 
   'PD-1003', CURRENT_DATE + INTERVAL '1 day'),
   
  ('990e8400-e29b-41d4-a716-446655440004', 'Dashboard loading slowly', 
   'The main dashboard in ProjectFlow takes over 10 seconds to load for users with large datasets.', 
   'in_progress', 'medium', '770e8400-e29b-41d4-a716-446655440001', NULL, '550e8400-e29b-41d4-a716-446655440001', 
   'PD-1004', CURRENT_DATE + INTERVAL '4 days'),
   
  ('990e8400-e29b-41d4-a716-446655440005', 'Add user permission issue', 
   'Admin users are unable to add new user permissions in the SecurityShield app.', 
   'resolved', 'high', '770e8400-e29b-41d4-a716-446655440002', NULL, '550e8400-e29b-41d4-a716-446655440003', 
   'PD-1005', CURRENT_DATE - INTERVAL '1 day'),
   
  ('990e8400-e29b-41d4-a716-446655440006', 'Mobile app crashes on startup', 
   'The mobile app for ProjectFlow crashes immediately after the splash screen on iOS devices.', 
   'open', 'high', '770e8400-e29b-41d4-a716-446655440001', NULL, '550e8400-e29b-41d4-a716-446655440001', 
   'PD-1006', CURRENT_DATE + INTERVAL '3 days'),
   
  ('990e8400-e29b-41d4-a716-446655440007', 'Billing information not updating', 
   'Customer reports that their billing information is not updating in the account settings.', 
   'open', 'medium', '770e8400-e29b-41d4-a716-446655440003', NULL, NULL, 
   'PD-1007', CURRENT_DATE + INTERVAL '6 days'),
   
  ('990e8400-e29b-41d4-a716-446655440008', 'API rate limiting too restrictive', 
   'Customer is hitting API rate limits too frequently and requests an increase for their enterprise plan.', 
   'closed', 'low', '770e8400-e29b-41d4-a716-446655440002', NULL, NULL, 
   'PD-1008', CURRENT_DATE - INTERVAL '5 days'),
   
  ('990e8400-e29b-41d4-a716-446655440009', 'Data import failing for large files', 
   'When importing CSV files larger than 10MB, the import process fails with a timeout error.', 
   'in_progress', 'high', '770e8400-e29b-41d4-a716-446655440001', NULL, '550e8400-e29b-41d4-a716-446655440002', 
   'PD-1009', CURRENT_DATE + INTERVAL '2 days'),
   
  ('990e8400-e29b-41d4-a716-446655440010', 'Custom report builder error', 
   'When using the custom report builder, selecting certain date ranges causes an error message.', 
   'open', 'medium', '770e8400-e29b-41d4-a716-446655440002', NULL, '550e8400-e29b-41d4-a716-446655440001', 
   'PD-1010', CURRENT_DATE + INTERVAL '7 days'),
   
  ('990e8400-e29b-41d4-a716-446655440011', 'Password reset emails not being received', 
   'Multiple users report that they are not receiving password reset emails when requested.', 
   'resolved', 'high', '770e8400-e29b-41d4-a716-446655440001', NULL, NULL, 
   'PD-1011', CURRENT_DATE - INTERVAL '2 days'),
   
  ('990e8400-e29b-41d4-a716-446655440012', 'Feature request: Dark mode', 
   'Several customers have requested a dark mode option for the user interface.', 
   'open', 'low', '770e8400-e29b-41d4-a716-446655440003', NULL, '550e8400-e29b-41d4-a716-446655440001', 
   'PD-1012', CURRENT_DATE + INTERVAL '14 days');

-- Insert sample ticket comments
INSERT INTO ticket_comments (
  ticket_id, user_id, content, is_internal, created_at
)
VALUES
  ('990e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', 
   'I''ve started investigating this issue. Initial logs show a potential database connection problem.', 
   true, now() - INTERVAL '2 hours'),
   
  ('990e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', 
   'Hello, we''re looking into this issue and will update you shortly.', 
   false, now() - INTERVAL '1 hour 30 minutes'),
   
  ('990e8400-e29b-41d4-a716-446655440002', '11111111-1111-1111-1111-111111111111', 
   'I''ve created a task for our development team to implement this feature. We''ll prioritize it for the next sprint.', 
   false, now() - INTERVAL '5 hours'),
   
  ('990e8400-e29b-41d4-a716-446655440003', '11111111-1111-1111-1111-111111111111', 
   'This appears to be a critical issue affecting multiple customers. I''ve escalated to the engineering team.', 
   true, now() - INTERVAL '30 minutes'),
   
  ('990e8400-e29b-41d4-a716-446655440005', '11111111-1111-1111-1111-111111111111', 
   'The issue has been identified as a permissions conflict. A fix has been deployed.', 
   false, now() - INTERVAL '1 day'),
   
  ('990e8400-e29b-41d4-a716-446655440005', '11111111-1111-1111-1111-111111111111', 
   'Please confirm if you''re still experiencing this issue after our latest update.', 
   false, now() - INTERVAL '12 hours');

-- Insert sample ticket attachments
INSERT INTO ticket_attachments (
  ticket_id, user_id, file_name, file_url, file_type, file_size
)
VALUES
  ('990e8400-e29b-41d4-a716-446655440001', '11111111-1111-1111-1111-111111111111', 
   'error_screenshot.png', 'https://example.com/files/error_screenshot.png', 'image/png', 256000),
   
  ('990e8400-e29b-41d4-a716-446655440003', '11111111-1111-1111-1111-111111111111', 
   'error_logs.txt', 'https://example.com/files/error_logs.txt', 'text/plain', 15000),
   
  ('990e8400-e29b-41d4-a716-446655440005', '11111111-1111-1111-1111-111111111111', 
   'fix_documentation.pdf', 'https://example.com/files/fix_documentation.pdf', 'application/pdf', 1250000);