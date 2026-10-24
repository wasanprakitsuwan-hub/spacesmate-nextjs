-- ═══════════════════════════════════════════════════════════════════════════
-- Listing statistics — views and contact clicks per listing per day
--
-- WEBSITE database (spacesmate.com — jrykbzdzcplhrhauvlvk).
--
-- One row per listing per Bangkok day, three counters. Daily rows keep it
-- small (a listing seen every day for a year is 365 rows) while still giving
-- owners a 30-day chart. No visitor data is stored: no IP, no user id, no
-- cookie value — only counts.
--
-- Written only through bump_listing_stat(), called by /api/listings/stat with
-- the service role. The function increments atomically, so two visitors at
-- the same moment both count.
--
-- Safe to run more than once.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.listing_stats_daily (
  property_id  UUID    NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  day          DATE    NOT NULL,
  views        INTEGER NOT NULL DEFAULT 0,
  line_clicks  INTEGER NOT NULL DEFAULT 0,
  phone_clicks INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (property_id, day)
);

-- Service role only: owners read their own numbers through /api/owner/listings/stats.
ALTER TABLE public.listing_stats_daily ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.bump_listing_stat(p_property UUID, p_kind TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  d DATE := (now() AT TIME ZONE 'Asia/Bangkok')::date;
BEGIN
  IF p_kind NOT IN ('view', 'line', 'phone') THEN
    RAISE EXCEPTION 'unknown stat kind %', p_kind;
  END IF;

  INSERT INTO listing_stats_daily (property_id, day, views, line_clicks, phone_clicks)
  VALUES (p_property, d,
          CASE WHEN p_kind = 'view'  THEN 1 ELSE 0 END,
          CASE WHEN p_kind = 'line'  THEN 1 ELSE 0 END,
          CASE WHEN p_kind = 'phone' THEN 1 ELSE 0 END)
  ON CONFLICT (property_id, day) DO UPDATE SET
    views        = listing_stats_daily.views        + EXCLUDED.views,
    line_clicks  = listing_stats_daily.line_clicks  + EXCLUDED.line_clicks,
    phone_clicks = listing_stats_daily.phone_clicks + EXCLUDED.phone_clicks;
END;
$$;

REVOKE ALL ON FUNCTION public.bump_listing_stat(UUID, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bump_listing_stat(UUID, TEXT) TO service_role;
