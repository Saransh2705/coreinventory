-- Fix: Add explicit search_path to SECURITY DEFINER functions
-- and make handle_new_user more defensive with casting

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role public.user_role;
  _warehouse_id UUID;
BEGIN
  -- Safely cast role, default to Viewer if invalid or missing
  BEGIN
    _role := (NEW.raw_user_meta_data->>'role')::public.user_role;
  EXCEPTION WHEN OTHERS THEN
    _role := 'Viewer'::public.user_role;
  END;

  -- Safely cast warehouse_id, default to NULL if invalid or missing
  BEGIN
    _warehouse_id := (NEW.raw_user_meta_data->>'warehouse_id')::UUID;
  EXCEPTION WHEN OTHERS THEN
    _warehouse_id := NULL;
  END;

  INSERT INTO public.profiles (id, email, full_name, role, warehouse_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(_role, 'Viewer'::public.user_role),
    _warehouse_id
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
    role = EXCLUDED.role,
    warehouse_id = COALESCE(EXCLUDED.warehouse_id, public.profiles.warehouse_id),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_profile_deleted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$;

-- Ensure triggers exist (re-create idempotently)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_profile_deleted ON public.profiles;
CREATE TRIGGER on_profile_deleted
  AFTER DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_profile_deleted();

-- Backfill: create profile for any auth.users that don't have one yet
INSERT INTO public.profiles (id, email, full_name, role)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  COALESCE((u.raw_user_meta_data->>'role')::public.user_role, 'Viewer'::public.user_role)
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
