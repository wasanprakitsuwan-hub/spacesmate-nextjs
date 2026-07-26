-- ─────────────────────────────────────────────────────────────────────────────
-- Register the four buildings currently referenced only as free text, then
-- re-run the backfill matching BOTH name_th and name_en.
--
-- WHY A SECOND FILE
--   The first migration matched on name_th only. Two of the four listings had
--   their building typed in English, so they could never have matched even once
--   registered. Fixed here.
--
-- ⚠️  CHECK THE THAI SPELLINGS BEFORE RUNNING.
--   The Thai names below are my transliterations for three of the four. You know
--   these buildings; correct anything wrong rather than trusting me — this is the
--   name renters will search for, and it will end up in the building page URL.
--
-- SAFE TO RE-RUN.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1 ── register the buildings ────────────────────────────────────────────────
-- Thai and English are stored separately. The listing form currently lets people
-- type both into one box — "Aguston Sukhumvit 22 (ออกัสตัน สุขุมวิท 22)" — which
-- is exactly why the autocomplete matters.

INSERT INTO property_names (name_th, name_en)
SELECT v.name_th, v.name_en
FROM (VALUES
  ('ออกัสตัน สุขุมวิท 22',      'Aguston Sukhumvit 22'),
  ('ลุมพินี เพลส ปิ่นเกล้า 2',  'Lumpini Place Pinklao 2'),   -- ⚠️ verify Thai
  ('เดอะ สกาย สุขุมวิท',        'The Sky Sukhumvit'),          -- ⚠️ verify Thai
  ('ลุมพินี สวนพลู สาทร',       'Lumpini Suanplu Sathorn')     -- ⚠️ verify English
) AS v(name_th, name_en)
WHERE NOT EXISTS (
  SELECT 1 FROM property_names n
  WHERE regexp_replace(lower(trim(n.name_th)), '\s+', '', 'g')
      = regexp_replace(lower(trim(v.name_th)), '\s+', '', 'g')
);


-- 2 ── give any new rows a slug ──────────────────────────────────────────────
UPDATE property_names
SET slug = regexp_replace(
             regexp_replace(lower(trim(coalesce(name_th, name_en, ''))),
                            '[^ก-๙a-z0-9\s-]', '', 'g'),
             '\s+', '-', 'g')
WHERE slug IS NULL AND coalesce(name_th, name_en, '') <> '';

WITH dupes AS (
  SELECT id, slug, row_number() OVER (PARTITION BY slug ORDER BY created_at) AS rn
  FROM property_names WHERE slug IS NOT NULL
)
UPDATE property_names p SET slug = d.slug || '-' || d.rn
FROM dupes d WHERE p.id = d.id AND d.rn > 1;


-- 3 ── backfill again, this time matching Thai OR English ────────────────────
-- Also handles the "English (ไทย)" pattern by testing the part before the
-- bracket as well as the whole string.
WITH extracted AS (
  SELECT
    p.id AS property_id,
    trim(elem ->> 'property_name')                                   AS raw_name,
    trim(split_part(elem ->> 'property_name', '(', 1))               AS raw_before_bracket
  FROM properties p
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(p.room_types) = 'array' THEN p.room_types ELSE '[]'::jsonb END
  ) AS elem
  WHERE elem ->> '_type' = 'rental_detail'
    AND coalesce(trim(elem ->> 'property_name'), '') <> ''
    AND p.property_name_id IS NULL
),
norm AS (
  SELECT property_id,
         regexp_replace(lower(raw_name),            '\s+', '', 'g') AS k_full,
         regexp_replace(lower(raw_before_bracket),  '\s+', '', 'g') AS k_short
  FROM extracted
),
matched AS (
  SELECT DISTINCT ON (n.property_id) n.property_id, pn.id AS name_id
  FROM norm n
  JOIN property_names pn
    ON  regexp_replace(lower(trim(coalesce(pn.name_th,''))), '\s+', '', 'g') IN (n.k_full, n.k_short)
     OR regexp_replace(lower(trim(coalesce(pn.name_en,''))), '\s+', '', 'g') IN (n.k_full, n.k_short)
  ORDER BY n.property_id, pn.created_at
)
UPDATE properties p
SET property_name_id = m.name_id
FROM matched m
WHERE p.id = m.property_id;


-- 4 ── check the result ──────────────────────────────────────────────────────
--   SELECT
--     count(*) FILTER (WHERE property_name_id IS NOT NULL) AS linked,
--     count(*) FILTER (WHERE property_name_id IS NULL)     AS unlinked
--   FROM properties
--   WHERE property_type IN ('condo','house') AND listing_status = 'active';
