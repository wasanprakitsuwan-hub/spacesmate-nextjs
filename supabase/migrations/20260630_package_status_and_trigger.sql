-- Migration: 20260630_package_status_and_trigger
-- 1. Add package tracking columns to user_profiles
-- 2. Add DB trigger to auto-create user_profiles on auth signup

-- ── 1. Package columns ────────────────────────────────────────────────────────
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS active_package TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS package_expires_at TIMESTAMPTZ DEFAULT NULL;

-- ── 2. Auto-create profile function ──────────────────────────────────────────
-- Fires when a new user is inserted into auth.users (even before email confirmation)
-- Uses SECURITY DEFINER so it runs with elevated privileges, bypassing RLS

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'landlord'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 3. Attach trigger to auth.users ──────────────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
