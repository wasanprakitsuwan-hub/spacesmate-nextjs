-- Migration: 20260705 — user status, property_names, seo_pages
-- Run this in: Supabase Dashboard → SQL Editor

-- ── 1. Add status column to user_profiles (#203) ─────────────────────────────
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
  CHECK (status IN ('active', 'suspended'));

-- Update the CHECK constraint to allow the new value safely
UPDATE user_profiles SET status = 'active' WHERE status IS NULL;

-- ── 2. Property names table (#213) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS property_names (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  name_th     TEXT        NOT NULL,
  name_en     TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- RLS: only admin/super_admin can write; read is open (used for autocomplete)
ALTER TABLE property_names ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (autocomplete on public submit form)
CREATE POLICY IF NOT EXISTS "property_names_select_all"
  ON property_names FOR SELECT USING (true);

-- Only authenticated service-role writes (handled by API with service client)
-- No RLS insert policy needed — API uses service role key which bypasses RLS

-- ── 3. SEO pages tracker table (#202) ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS seo_pages (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  slug             TEXT        NOT NULL UNIQUE,
  title_th         TEXT,
  title_en         TEXT,
  meta_description TEXT,
  area_type        TEXT        DEFAULT 'bts' CHECK (area_type IN ('bts', 'mrt', 'district', 'university', 'zone')),
  status           TEXT        DEFAULT 'planned' CHECK (status IN ('planned', 'built', 'published', 'needs_update')),
  has_content      BOOLEAN     DEFAULT false,
  page_score       INTEGER     CHECK (page_score >= 0 AND page_score <= 100),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "seo_pages_select_all" ON seo_pages FOR SELECT USING (true);

-- ── 4. Seed seo_pages with Bangkok BTS/MRT area targets ──────────────────────
INSERT INTO seo_pages (slug, title_th, title_en, area_type, status) VALUES
  ('condo-for-rent-bts-asok',        'คอนโดให้เช่า BTS อโศก',          'Condo for Rent BTS Asok',          'bts', 'planned'),
  ('condo-for-rent-bts-ekkamai',     'คอนโดให้เช่า BTS เอกมัย',        'Condo for Rent BTS Ekkamai',       'bts', 'planned'),
  ('condo-for-rent-bts-phromphong',  'คอนโดให้เช่า BTS พร้อมพงษ์',    'Condo for Rent BTS Phrom Phong',   'bts', 'planned'),
  ('condo-for-rent-bts-onnut',       'คอนโดให้เช่า BTS อ่อนนุช',       'Condo for Rent BTS On Nut',        'bts', 'planned'),
  ('condo-for-rent-bts-bearing',     'คอนโดให้เช่า BTS แบริ่ง',        'Condo for Rent BTS Bearing',       'bts', 'planned'),
  ('condo-for-rent-bts-udomsuk',     'คอนโดให้เช่า BTS อุดมสุข',       'Condo for Rent BTS Udom Suk',      'bts', 'planned'),
  ('condo-for-rent-bts-thonglor',    'คอนโดให้เช่า BTS ทองหล่อ',       'Condo for Rent BTS Thong Lo',      'bts', 'planned'),
  ('condo-for-rent-bts-ari',         'คอนโดให้เช่า BTS อารีย์',         'Condo for Rent BTS Ari',           'bts', 'planned'),
  ('condo-for-rent-bts-saphan-kwai', 'คอนโดให้เช่า BTS สะพานควาย',    'Condo for Rent BTS Saphan Kwai',   'bts', 'planned'),
  ('condo-for-rent-bts-victory-monument', 'คอนโดให้เช่า BTS อนุสาวรีย์ชัย', 'Condo for Rent BTS Victory Monument', 'bts', 'planned'),
  ('condo-for-rent-mrt-sukhumvit',   'คอนโดให้เช่า MRT สุขุมวิท',       'Condo for Rent MRT Sukhumvit',     'mrt', 'planned'),
  ('condo-for-rent-mrt-silom',       'คอนโดให้เช่า MRT สีลม',           'Condo for Rent MRT Silom',         'mrt', 'planned'),
  ('condo-for-rent-mrt-phetchaburi', 'คอนโดให้เช่า MRT เพชรบุรี',      'Condo for Rent MRT Phetchaburi',   'mrt', 'planned'),
  ('condo-for-rent-mrt-rama9',       'คอนโดให้เช่า MRT พระราม 9',      'Condo for Rent MRT Rama 9',        'mrt', 'planned'),
  ('condo-for-rent-mrt-thailand-cultural-centre', 'คอนโดให้เช่า MRT ศูนย์วัฒนธรรม', 'Condo for Rent MRT Thailand Cultural Centre', 'mrt', 'planned'),
  ('condo-for-rent-sukhumvit',       'คอนโดให้เช่า สุขุมวิท',           'Condo for Rent Sukhumvit',         'district', 'planned'),
  ('condo-for-rent-silom',           'คอนโดให้เช่า สีลม',               'Condo for Rent Silom',             'district', 'planned'),
  ('condo-for-rent-sathorn',         'คอนโดให้เช่า สาทร',               'Condo for Rent Sathorn',           'district', 'planned'),
  ('condo-for-rent-ratchada',        'คอนโดให้เช่า รัชดา',              'Condo for Rent Ratchada',          'district', 'planned'),
  ('condo-for-rent-ladphrao',        'คอนโดให้เช่า ลาดพร้าว',           'Condo for Rent Lat Phrao',         'district', 'planned'),
  ('apartment-for-rent-sukhumvit',   'อพาร์ทเม้นท์ให้เช่า สุขุมวิท',   'Apartment for Rent Sukhumvit',     'district', 'planned'),
  ('apartment-for-rent-silom',       'อพาร์ทเม้นท์ให้เช่า สีลม',       'Apartment for Rent Silom',         'district', 'planned'),
  ('apartment-for-rent-ratchada',    'อพาร์ทเม้นท์ให้เช่า รัชดา',      'Apartment for Rent Ratchada',      'district', 'planned')
ON CONFLICT (slug) DO NOTHING;

-- ── 5. Verify ─────────────────────────────────────────────────────────────────
SELECT 'user_profiles status column' AS check_item,
       COUNT(*) FILTER (WHERE status = 'active') AS active_users,
       COUNT(*) FILTER (WHERE status = 'suspended') AS suspended_users
FROM user_profiles;

SELECT 'property_names table' AS check_item, COUNT(*) AS rows FROM property_names;
SELECT 'seo_pages seeded' AS check_item, COUNT(*) AS rows FROM seo_pages;
