-- ============================================================
-- SpacesMate — ONE-TIME SUPABASE FIX
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New Query
-- Covers: missing columns + permissions + RLS + schema reload
-- ============================================================

-- ── 1. ADD MISSING COLUMNS ────────────────────────────────────
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS room_types  jsonb        DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS images      text[]       DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS video_url   text         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS updated_at  timestamptz  DEFAULT now(),
  ADD COLUMN IF NOT EXISTS rental_term text         DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS package_type text        DEFAULT 'basic',
  ADD COLUMN IF NOT EXISTS expires_at  timestamptz  DEFAULT NULL;

-- ── 2. GRANT PERMISSIONS ──────────────────────────────────────
GRANT ALL PRIVILEGES ON TABLE public.properties    TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.properties    TO authenticated;
GRANT SELECT         ON TABLE public.properties    TO anon;

GRANT ALL PRIVILEGES ON TABLE public.user_profiles TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.user_profiles TO authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ── 3. RLS POLICIES ───────────────────────────────────────────
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_active"    ON public.properties;
DROP POLICY IF EXISTS "auth_read_all"         ON public.properties;
DROP POLICY IF EXISTS "service_role_all"      ON public.properties;
DROP POLICY IF EXISTS "Public can read active listings"     ON public.properties;
DROP POLICY IF EXISTS "Landlords can manage own properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can manage all properties"    ON public.properties;

CREATE POLICY "public_read_active" ON public.properties
  FOR SELECT TO anon, authenticated USING (listing_status = 'active');

CREATE POLICY "auth_read_all" ON public.properties
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "service_role_all" ON public.properties
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── 4. RELOAD SCHEMA CACHE ────────────────────────────────────
NOTIFY pgrst, 'reload schema';

-- ── DONE ──────────────────────────────────────────────────────
-- All errors should be gone after running this.
-- ============================================================
