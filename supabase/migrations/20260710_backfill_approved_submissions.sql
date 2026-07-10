-- ============================================================
-- Backfill: publish approved submissions that have no property row
-- Date: 2026-07-10
-- Run in: Supabase Dashboard → SQL Editor → New query
--
-- This fixes listings stuck in submissions.status = 'approved'
-- that never made it into the properties table (e.g. because
-- the old approval handler only updated status, never copied data).
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
  coalesce(s.type, 'คอนโดมิเนียม')                      AS property_type,
  coalesce(s.price, 0)                                   AS price_from,

  -- size may be stored as text; cast safely
  CASE
    WHEN s.size IS NOT NULL AND s.size::text ~ '^\d+(\.\d+)?$'
    THEN s.size::text::numeric
    ELSE NULL
  END                                                    AS area_sqm,

  s.bedrooms,
  s.bathrooms,
  s.floor,
  s.address                                              AS address_th,
  s.district,
  s.subdistrict                                          AS sub_district,
  coalesce(s.province, 'กรุงเทพมหานคร')                 AS province,
  s.postcode,
  s.lat,
  s.lng,

  coalesce(s.amenities, '[]'::jsonb)                    AS amenities,
  coalesce(s.images,    '{}'::text[])                   AS images,
  coalesce(s.room_types,'[]'::jsonb)                    AS room_types,
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
