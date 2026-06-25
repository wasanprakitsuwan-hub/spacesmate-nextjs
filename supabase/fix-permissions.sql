-- ============================================================
-- SpacesMate — Supabase SQL Fixes
-- Run this once in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── 1. FIX "permission denied for table properties" ──────────
-- If service_role was created without explicit GRANTs on the table,
-- writes will fail even when using the service role key.

GRANT ALL PRIVILEGES ON TABLE public.properties    TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.properties    TO authenticated;
GRANT SELECT         ON TABLE public.properties    TO anon;

-- ── 2. FIX user_profiles table (needed for landlord_id FK) ──
GRANT ALL PRIVILEGES ON TABLE public.user_profiles TO service_role;
GRANT ALL PRIVILEGES ON TABLE public.user_profiles TO authenticated;

-- Grant usage on sequences (needed for auto-increment IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ── 3. ADD MISSING COLUMNS TO properties TABLE ───────────────
-- Run each ALTER safely — uses IF NOT EXISTS (Postgres 9.6+)

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS room_types  jsonb     DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS images      text[]    DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS video_url   text      DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS updated_at  timestamptz DEFAULT now();

-- ── 4. RLS POLICIES (if RLS is enabled on properties) ────────
-- service_role bypasses RLS by default in Supabase, but
-- these policies are added as a safety net.

DO $$
BEGIN
  -- Only enable RLS if not already enabled
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename  = 'properties'
      AND rowsecurity = true
  ) THEN
    EXECUTE 'ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY';
  END IF;
END $$;

-- Allow anyone to read active listings
DROP POLICY IF EXISTS "public_read_active" ON public.properties;
CREATE POLICY "public_read_active"
  ON public.properties FOR SELECT
  TO anon, authenticated
  USING (listing_status = 'active');

-- Allow authenticated users to read all listings
DROP POLICY IF EXISTS "auth_read_all" ON public.properties;
CREATE POLICY "auth_read_all"
  ON public.properties FOR SELECT
  TO authenticated
  USING (true);

-- Allow service_role full access (bypasses RLS anyway, but explicit is safer)
DROP POLICY IF EXISTS "service_role_all" ON public.properties;
CREATE POLICY "service_role_all"
  ON public.properties FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── 5. SUPABASE STORAGE BUCKETS ──────────────────────────────
-- Create storage buckets for property media.
-- If the bucket already exists, this will error — that's fine, just skip.
--
-- Alternatively, go to: Storage → New bucket
--   Name: property-images   Public: YES
--   Name: property-videos   Public: YES

-- (Bucket creation via SQL is not directly supported in all Supabase versions.
--  Use the Storage UI or the upload API route will auto-create them.)

-- ── DONE ─────────────────────────────────────────────────────
-- After running, redeploy your Vercel project (or wait for auto-deploy)
-- and test creating a listing in the dashboard.
-- ============================================================
