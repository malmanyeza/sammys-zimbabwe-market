
-- Update the role in auth.users metadata (this is what the system actually checks)
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'malmanyeza@gmail.com';

-- Also make sure the profiles table matches
UPDATE profiles 
SET role = 'admin'
WHERE email = 'malmanyeza@gmail.com';
