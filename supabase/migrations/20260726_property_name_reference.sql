-- ─────────────────────────────────────────────────────────────────────────────
-- Link listings to a building, instead of storing its name as free text
--
-- PROBLEM
--   For condo and house listings the building name lives inside the room_types
--   JSONB blob:  { "_type": "rental_detail", "property_name": "ลุมพินี วิลล์ อ่อนนุช" }
--
--   Consequences:
--     • listings in the same building cannot be grouped — no building pages,
--       which is how most renters actually search
--     • "ลุมพินี วิลล์" and "ลุมพินีวิลล์" are different buildings
--     • property_names already exists as a table with an admin screen and a
--       public autocomplete endpoint, and nothing references it
--
-- WHAT THIS DOES
--   Adds a nullable FK from properties to property_names, and backfills it by
--   matching the free text already stored in room_types.
--
--   Nullable and non-breaking: existing code keeps reading the JSONB, so nothing
--   breaks between running this and shipping the code that uses it.
--
-- SAFE TO RE-RUN.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1 ── the reference ─────────────────────────────────────────────────────────
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS property_name_id UUID REFERENCES property_names(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_properties_property_name_id
  ON properties (property_name_id)
  WHERE property_name_id IS NOT NULL;

-- Building pages list active listings for one building.
CREATE INDEX IF NOT EXISTS idx_properties_building_active
  ON properties (property_name_id, listing_status)
  WHERE property_name_id IS NOT NULL;


-- 2 ── a slug to address each building by ────────────────────────────────────
ALTER TABLE property_names
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- Thai is kept: these become /building/ลุมพินีวิลล์-อ่อนนุช style URLs, matching
-- how people search and consistent with the listing slugs.
UPDATE property_names
SET slug = regexp_replace(
             regexp_replace(
               lower(trim(coalesce(name_th, name_en, ''))),
               '[^ก-๙a-z0-9\s-]', '', 'g'          -- keep Thai, latin, digits
             ),
             '\s+', '-', 'g'
           )
WHERE slug IS NULL AND coalesce(name_th, name_en, '') <> '';

-- Disambiguate any collisions rather than failing the unique index.
WITH dupes AS (
  SELECT id, slug,
         row_number() OVER (PARTITION BY slug ORDER BY created_at) AS rn
  FROM property_names
  WHERE slug IS NOT NULL
)
UPDATE property_names p
SET slug = d.slug || '-' || d.rn
FROM dupes d
WHERE p.id = d.id AND d.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS idx_property_names_slug
  ON property_names (slug)
  WHERE slug IS NOT NULL;


-- 3 ── backfill from the JSONB ───────────────────────────────────────────────
-- Exact, case- and space-insensitive match only. Anything ambiguous is left
-- null for a human to resolve — a wrong building link is worse than none.
WITH extracted AS (
  SELECT
    p.id AS property_id,
    trim(elem ->> 'property_name') AS raw_name
  FROM properties p
  CROSS JOIN LATERAL jsonb_array_elements(
    CASE WHEN jsonb_typeof(p.room_types) = 'array' THEN p.room_types ELSE '[]'::jsonb END
  ) AS elem
  WHERE elem ->> '_type' = 'rental_detail'
    AND coalesce(trim(elem ->> 'property_name'), '') <> ''
    AND p.property_name_id IS NULL
),
matched AS (
  SELECT e.property_id, n.id AS name_id
  FROM extracted e
  JOIN property_names n
    ON regexp_replace(lower(trim(n.name_th)), '\s+', '', 'g')
     = regexp_replace(lower(e.raw_name),      '\s+', '', 'g')
)
UPDATE properties p
SET property_name_id = m.name_id
FROM matched m
WHERE p.id = m.property_id;


-- 4 ── what did not match ────────────────────────────────────────────────────
-- Run this after, to see which buildings need adding to property_names.
--
--   SELECT DISTINCT trim(elem ->> 'property_name') AS unmatched_building
--   FROM properties p
--   CROSS JOIN LATERAL jsonb_array_elements(
--     CASE WHEN jsonb_typeof(p.room_types) = 'array' THEN p.room_types ELSE '[]'::jsonb END
--   ) AS elem
--   WHERE elem ->> '_type' = 'rental_detail'
--     AND coalesce(trim(elem ->> 'property_name'), '') <> ''
--     AND p.property_name_id IS NULL
--   ORDER BY 1;
