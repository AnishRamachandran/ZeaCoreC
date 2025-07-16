@@ .. @@
 -- Create customer_users table to link auth users to customers
 CREATE TABLE IF NOT EXISTS customer_users (
   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
   user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
-  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
+  customer_id uuid NOT NULL,
   role text NOT NULL DEFAULT 'user',
   created_at timestamptz DEFAULT now(),
   updated_at timestamptz DEFAULT now(),
   
-  -- Ensure unique combination of user and customer
-  UNIQUE(user_id, customer_id)
+  -- Ensure unique combination of user and customer
+  UNIQUE(user_id, customer_id),
+  
+  -- Explicit foreign key constraint for better Supabase schema introspection
+  CONSTRAINT fk_customer_users_customer_id FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
 );