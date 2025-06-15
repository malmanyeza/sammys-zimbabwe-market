
-- Create a function to promote a user to admin role
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(target_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
BEGIN
  -- Check if the calling user is an admin
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can promote users to admin';
  END IF;
  
  -- Find the target user by email
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = target_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', target_email;
  END IF;
  
  -- Update the user's role in auth.users metadata
  UPDATE auth.users 
  SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
  WHERE id = target_user_id;
  
  -- Also update the profiles table to keep it in sync
  UPDATE profiles 
  SET role = 'admin'
  WHERE id = target_user_id;
  
  RETURN true;
END;
$$;
