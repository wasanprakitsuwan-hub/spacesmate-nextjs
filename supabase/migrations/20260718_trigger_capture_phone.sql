-- Migration: 20260718_trigger_capture_phone
-- Update the auth trigger to also capture phone from signup metadata.
--
-- Why this is needed:
--   After signUp() with email confirmation enabled, the user has no session yet.
--   Any client-side upsert to user_profiles runs as anon and fails RLS silently.
--   The SECURITY DEFINER trigger is the only reliable write path at signup time.
--   We now pass phone in options.data = { full_name, phone } and the trigger reads it.
--
-- Run in: Supabase Dashboard → SQL Editor → New Query

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'phone',   -- captured from signUp options.data.phone
    'landlord'
  )
  ON CONFLICT (id) DO UPDATE
    SET
      full_name  = COALESCE(EXCLUDED.full_name,  public.user_profiles.full_name),
      phone      = COALESCE(EXCLUDED.phone,       public.user_profiles.phone),
      updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify trigger is still attached
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass
  AND tgname = 'on_auth_user_created';
