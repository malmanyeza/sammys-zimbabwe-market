
-- First create the app_role enum type if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE app_role AS ENUM ('customer', 'seller', 'admin');
        
        -- Add the column with the new type
        ALTER TABLE profiles ADD COLUMN role_new app_role;
        
        -- Convert existing text values to enum values
        UPDATE profiles SET role_new = 
          CASE 
            WHEN role = 'customer' THEN 'customer'::app_role
            WHEN role = 'seller' THEN 'seller'::app_role
            WHEN role = 'admin' THEN 'admin'::app_role
            ELSE 'customer'::app_role
          END;
        
        -- Drop the old column and rename the new one
        ALTER TABLE profiles DROP COLUMN role;
        ALTER TABLE profiles RENAME COLUMN role_new TO role;
        
        -- Set default value
        ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'customer'::app_role;
    END IF;
END $$;

-- Create analytics views for better performance
CREATE OR REPLACE VIEW user_analytics AS
SELECT 
  p.role,
  COUNT(*) as count
FROM profiles p
GROUP BY p.role;

-- View for seller rankings by total sales
CREATE OR REPLACE VIEW seller_rankings AS
SELECT 
  p.id as seller_id,
  p.name as seller_name,
  COUNT(DISTINCT oi.order_id) as total_orders,
  SUM(oi.quantity * oi.price) as total_revenue,
  SUM(oi.quantity) as total_items_sold
FROM profiles p
JOIN products pr ON p.id = pr.seller_id
JOIN order_items oi ON pr.id = oi.product_id
WHERE p.role = 'seller'
GROUP BY p.id, p.name
ORDER BY total_revenue DESC;

-- View for buyer rankings by spending
CREATE OR REPLACE VIEW buyer_rankings AS
SELECT 
  p.id as buyer_id,
  p.name as buyer_name,
  COUNT(DISTINCT o.id) as total_orders,
  SUM(o.total) as total_spent,
  COUNT(oi.id) as total_items_bought
FROM profiles p
JOIN orders o ON p.id = o.user_id
JOIN order_items oi ON o.id = oi.order_id
WHERE p.role = 'customer'
GROUP BY p.id, p.name
ORDER BY total_spent DESC;

-- View for product rankings by sales
CREATE OR REPLACE VIEW product_rankings AS
SELECT 
  pr.id as product_id,
  pr.name as product_name,
  pr.category_id,
  c.name as category_name,
  COUNT(oi.id) as times_sold,
  SUM(oi.quantity) as total_quantity_sold,
  SUM(oi.quantity * oi.price) as total_revenue
FROM products pr
LEFT JOIN order_items oi ON pr.id = oi.product_id
LEFT JOIN categories c ON pr.category_id = c.id
GROUP BY pr.id, pr.name, pr.category_id, c.name
ORDER BY total_revenue DESC;

-- View for category rankings by sales
CREATE OR REPLACE VIEW category_rankings AS
SELECT 
  c.id as category_id,
  c.name as category_name,
  COUNT(DISTINCT pr.id) as total_products,
  COUNT(oi.id) as times_sold,
  SUM(oi.quantity) as total_quantity_sold,
  SUM(oi.quantity * oi.price) as total_revenue
FROM categories c
LEFT JOIN products pr ON c.id = pr.category_id
LEFT JOIN order_items oi ON pr.id = oi.product_id
GROUP BY c.id, c.name
ORDER BY total_revenue DESC;

-- Function to safely delete users (admin only)
CREATE OR REPLACE FUNCTION delete_user_account(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the calling user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can delete user accounts';
  END IF;
  
  -- Prevent deletion of admin accounts
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = target_user_id AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Cannot delete admin accounts';
  END IF;
  
  -- Delete the user profile (cascading will handle related data)
  DELETE FROM profiles WHERE id = target_user_id;
  
  -- Delete from auth.users (this should be done last)
  DELETE FROM auth.users WHERE id = target_user_id;
  
  RETURN true;
END;
$$;

-- RLS policies for admin access
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete non-admin profiles" ON profiles
FOR DELETE TO authenticated
USING (
  role != 'admin' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
