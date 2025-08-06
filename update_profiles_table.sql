-- Add email column to profiles table if it doesn't exist
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS email text;

-- Update existing rows with user email if available
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- Make email column required
ALTER TABLE public.profiles 
ALTER COLUMN email SET NOT NULL;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles (email);

-- Update RLS policies to include email
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- Refresh database schema cache
NOTIFY pgrst, 'reload schema';
