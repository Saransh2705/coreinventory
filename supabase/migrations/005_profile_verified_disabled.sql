-- Add is_verified and disabled columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS disabled BOOLEAN NOT NULL DEFAULT false;

-- Set admin user as verified (they were seeded directly)
UPDATE public.profiles SET is_verified = true WHERE role = 'System Admin';

-- Function: mark profile as verified on sign-in
-- This fires on auth.users UPDATE (Supabase updates last_sign_in_at on login)
CREATE OR REPLACE FUNCTION public.handle_user_verified()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When last_sign_in_at changes from NULL to a value, user has logged in
  IF OLD.last_sign_in_at IS NULL AND NEW.last_sign_in_at IS NOT NULL THEN
    UPDATE public.profiles SET is_verified = true, updated_at = NOW() WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_user_sign_in ON auth.users;
CREATE TRIGGER on_user_sign_in
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_verified();
