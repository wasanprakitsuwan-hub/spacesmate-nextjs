-- ═══════════════════════════════════════════════════════════════════════════
-- Rent-near-a-place pages — per-page overrides
--
-- WEBSITE database (spacesmate.com — jrykbzdzcplhrhauvlvk).
--
-- /rent/<slug> pages are generated from the place list and a template
-- (site_settings key 'rent_page_template', which needs no migration). An
-- admin can override one page's wording from /dashboard/rent-pages; that
-- override is the seo_pages row whose slug is the page slug, with place_key
-- set. These columns hold what seo_pages lacked: an English description,
-- intro paragraphs in both languages, and a switch to keep a page out of
-- Google whatever its listing count.
--
-- Until this runs, the pages render on the template alone and the dashboard
-- reports that overrides cannot be saved. Safe to run more than once.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.seo_pages
  ADD COLUMN IF NOT EXISTS meta_description_en TEXT,
  ADD COLUMN IF NOT EXISTS intro_th            TEXT,
  ADD COLUMN IF NOT EXISTS intro_en            TEXT,
  ADD COLUMN IF NOT EXISTS noindex             BOOLEAN NOT NULL DEFAULT false;
