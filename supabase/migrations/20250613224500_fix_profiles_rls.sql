
-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete non-admin profiles" ON profiles;

-- Create a security definer function to check admin status without causing recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND raw_user_meta_data->>'role' = 'admin'
  )
$$;

-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

-- Allow admins to view all profiles using the security definer function
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

-- Allow admins to delete non-admin profiles
CREATE POLICY "Admins can delete non-admin profiles" ON profiles
FOR DELETE TO authenticated
USING (
  public.is_admin(auth.uid()) AND 
  role != 'admin'
);

-- Allow new user registration (for the handle_new_user trigger)
CREATE POLICY "Allow user registration" ON profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);
