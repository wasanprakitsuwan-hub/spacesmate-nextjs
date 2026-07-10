-- ============================================================
-- Backfill: publish approved submissions that have no property row
-- Date: 2026-07-10  (v2 — all type errors fixed)
-- Run in: Supabase Dashboard → SQL Editor → New query
--
-- Fixes applied vs v1:
--  • property_type: CASE maps Thai labels → English enum values
--  • bedrooms / bathrooms / floor: safe text→integer cast
--  • amenities / room_types: correct text[] empty default (not ::jsonb)
--
-- Safe to run multiple times — the NOT EXISTS guard prevents duplicates.
-- ============================================================

-- ── Step 1: Preview what will be inserted (run this first to check) ──────────
-- SELECT s.id, s.title, s.type, s.status, s.package_type, s.created_at
-- FROM public.submissions s
-- WHERE s.status = 'approved'
--   AND NOT EXISTS (
--     SELECT 1 FROM public.properties p WHERE p.source_submission_id = s.id
--   );

-- ── Step 2: Backfill — insert missing property rows ──────────────────────────
INSERT INTO public.properties (
  slug,
  source_submission_id,
  landlord_id,
  title_th,
  title_en,
  description_th,
  description_en,
  property_type,
  price_from,
  area_sqm,
  bedrooms,
  bathrooms,
  floor,
  address_th,
  district,
  sub_district,
  province,
  postcode,
  lat,
  lng,
  amenities,
  images,
  room_types,
  video_url,
  rental_term,
  contact_name,
  contact_phone,
  package_type,
  expires_at,
  listing_status,
  verified
)
SELECT
  -- Slug: safe lowercase title + 8-char random hex suffix (guarantees uniqueness)
  lower(
    regexp_replace(
      regexp_replace(
        coalesce(s.title, 'listing'),
        '[^\w\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  ) || '-' || encode(gen_random_bytes(4), 'hex')        AS slug,

  s.id                                                   AS source_submission_id,
  s.user_id                                              AS landlord_id,
  coalesce(s.title, '')                                  AS title_th,
  s.title_en,
  s.description                                          AS description_th,
  s.description_en,

  -- Map Thai property type labels → English enum values required by check constraint
  CASE s.type
    WHEN 'คอนโด'              THEN 'condo'
    WHEN 'คอนโดมิเนียม'       THEN 'condo'
    WHEN 'อพาร์ทเม้นท์'       THEN 'apartment'
    WHEN 'อพาร์ตเมนต์'        THEN 'apartment'
    WHEN 'บ้าน'               THEN 'house'
    WHEN 'ออฟฟิศ'             THEN 'office'
    WHEN 'โคเวิร์ก'           THEN 'coworking'
    WHEN 'โคเวิร์คกิ้งสเปซ'   THEN 'coworking'
    -- Pass-through for rows already storing English values
    WHEN 'condo'              THEN 'condo'
    WHEN 'apartment'          THEN 'apartment'
    WHEN 'house'              THEN 'house'
    WHEN 'office'             THEN 'office'
    WHEN 'coworking'          THEN 'coworking'
    ELSE 'apartment'
  END                                                    AS property_type,

  coalesce(s.price, 0)                                   AS price_from,

  -- size may be stored as text; cast safely
  CASE
    WHEN s.size IS NOT NULL AND s.size::text ~ '^\d+(\.\d+)?$'
    THEN s.size::text::numeric
    ELSE NULL
  END                                                    AS area_sqm,

  -- bedrooms / bathrooms: text in submissions, integer in properties
  CASE
    WHEN s.bedrooms::text ~ '^\d+$' THEN s.bedrooms::text::integer
    ELSE 0
  END                                                    AS bedrooms,

  CASE
    WHEN s.bathrooms::text ~ '^\d+$' THEN s.bathrooms::text::integer
    ELSE 0
  END                                                    AS bathrooms,

  -- floor: text in submissions, integer in properties
  CASE
    WHEN s.floor::text ~ '^\d+$' THEN s.floor::text::integer
    ELSE NULL
  END                                                    AS floor,

  s.address                                              AS address_th,
  s.district,
  s.subdistrict                                          AS sub_district,
  coalesce(s.province, 'กรุงเทพมหานคร')                 AS province,
  s.postcode,
  s.lat,
  s.lng,

  -- amenities / room_types are text[] in both tables
  coalesce(s.amenities, ARRAY[]::text[])                 AS amenities,
  coalesce(s.images,    ARRAY[]::text[])                 AS images,
  coalesce(s.room_types, ARRAY[]::text[])                AS room_types,
  s.video_url,

  coalesce(s.rental_term, 'monthly')                    AS rental_term,
  s.contact_name,
  s.contact_phone,

  coalesce(s.package_type, 'free_trial')                AS package_type,

  -- Use existing expires_at or default to 30 days from now
  coalesce(s.expires_at, now() + interval '30 days')    AS expires_at,

  'active'                                               AS listing_status,
  false                                                  AS verified

FROM public.submissions s
WHERE s.status = 'approved'
  AND NOT EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.source_submission_id = s.id
  );

-- ── Step 3: Verify ─────────────────────────────────────────────────────────
-- After running, check what was inserted:
-- SELECT id, slug, title_th, listing_status, created_at
-- FROM public.properties
-- ORDER BY created_at DESC
-- LIMIT 10;

NOTIFY pgrst, 'reload schema';
