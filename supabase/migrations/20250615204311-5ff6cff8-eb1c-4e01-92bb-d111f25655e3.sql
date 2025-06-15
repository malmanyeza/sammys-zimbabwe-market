
-- First, let's drop ALL existing policies on profiles to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete non-admin profiles" ON profiles;
DROP POLICY IF EXISTS "Allow user registration" ON profiles;

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS public.is_admin(uuid);

-- Create a better security definer function that uses auth.users directly
CREATE OR REPLACE FUNCTION public.check_user_role(user_id uuid, target_role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND raw_user_meta_data->>'role' = target_role
  )
$$;

-- Create a function to get current user role from auth.users
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(raw_user_meta_data->>'role', 'customer')
  FROM auth.users 
  WHERE id = auth.uid()
$$;

-- Now create the RLS policies using these functions
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile  
CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

-- Allow admins to view all profiles (using the security definer function)
CREATE POLICY "Admins can view all profiles" ON profiles
FOR SELECT TO authenticated
USING (public.check_user_role(auth.uid(), 'admin'));

-- Allow admins to delete non-admin profiles
CREATE POLICY "Admins can delete non-admin profiles" ON profiles
FOR DELETE TO authenticated
USING (
  public.check_user_role(auth.uid(), 'admin') AND 
  NOT public.check_user_role(id, 'admin')
);

-- Allow new user registration (for the handle_new_user trigger)
CREATE POLICY "Allow user registration" ON profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = id);
