
-- Let's first check what's happening in the trigger and fix potential issues
-- Drop the existing trigger and function to recreate them properly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function with better error handling and logging
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert into profiles with proper error handling
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name', 
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)  -- fallback to email username part
    ), 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')::app_role
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error details
    RAISE LOG 'Error in handle_new_user trigger: % %', SQLERRM, SQLSTATE;
    -- Re-raise the exception to prevent user creation if profile creation fails
    RAISE;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
