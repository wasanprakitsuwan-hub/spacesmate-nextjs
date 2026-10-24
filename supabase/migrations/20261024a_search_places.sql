-- ═══════════════════════════════════════════════════════════════════════════
-- Search places — one admin list behind /dashboard/places
--
-- WEBSITE database (spacesmate.com — jrykbzdzcplhrhauvlvk).
--
-- The search box knows three kinds of place, each now editable from one
-- dashboard menu with three tabs:
--
--   1. Property names (property_names) — gains coordinates, so searching a
--      condo name pins the map on it, and a show/hide switch.
--   2. Places — malls, universities, hospitals, areas.   ┐ built-in lists live
--   3. Stations — BTS, MRT, ARL, SRT.                     ┘ in lib/landmarks.ts
--                                                          and lib/stations.ts
--
-- Places and stations are NOT copied into the database. The code lists stay
-- the default, and search_places holds only what an admin changed: an edited
-- row replaces the built-in one with the same id, a new id adds a place, and
-- hidden = true removes one from search. Deleting a row resets it to the
-- built-in version. If this table is empty or unreachable, search behaves
-- exactly as it does today.
--
-- seo_pages gains place_key ('station:E4', 'landmark:chula', 'name:<uuid>') so
-- each place shows its landing-page status, and the SEO Tracker menu folds into
-- the same screen. Pages that are not about one place keep place_key NULL and
-- appear under "Other pages".
--
-- Safe to run more than once.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.search_places (
  kind          TEXT        NOT NULL CHECK (kind IN ('station', 'landmark')),
  id            TEXT        NOT NULL,
  th            TEXT        NOT NULL,
  en            TEXT        NOT NULL,
  lat           DOUBLE PRECISION NOT NULL CHECK (lat BETWEEN 5 AND 21),
  lng           DOUBLE PRECISION NOT NULL CHECK (lng BETWEEN 97 AND 106),
  -- Stations only: which systems stop here, e.g. {BTS,MRT}.
  systems       TEXT[],
  -- Landmarks only: university | mall | hospital | transport | place.
  landmark_kind TEXT,
  -- Short names people type (จุฬา, T21).
  aliases       TEXT[],
  hidden        BOOLEAN     NOT NULL DEFAULT false,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (kind, id)
);

-- Read by the public search page through the service role; nothing writes
-- through RLS. Reading is harmless — these are public place names.
ALTER TABLE public.search_places ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "search_places_select_all" ON public.search_places;
CREATE POLICY "search_places_select_all" ON public.search_places FOR SELECT USING (true);

ALTER TABLE public.property_names
  ADD COLUMN IF NOT EXISTS lat     DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS lng     DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS aliases TEXT[],
  ADD COLUMN IF NOT EXISTS hidden  BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.seo_pages
  ADD COLUMN IF NOT EXISTS place_key TEXT;
CREATE INDEX IF NOT EXISTS seo_pages_place_key_idx ON public.seo_pages (place_key);

-- area_type grows to cover every kind of place a landing page can be about.
ALTER TABLE public.seo_pages DROP CONSTRAINT IF EXISTS seo_pages_area_type_check;
ALTER TABLE public.seo_pages ADD CONSTRAINT seo_pages_area_type_check
  CHECK (area_type IN ('bts', 'mrt', 'arl', 'srt', 'district', 'university', 'zone',
                       'mall', 'hospital', 'transport', 'place', 'condo'));
