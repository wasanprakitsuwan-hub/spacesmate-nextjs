-- ═══════════════════════════════════════════════════════════════════════════
-- English title and description for /dashboard/pages
--
-- WEBSITE database (spacesmate.com — jrykbzdzcplhrhauvlvk).
--
-- site_pages.meta_title / meta_desc were saved by the dashboard but never read
-- by any page. lib/page-seo.ts now applies them to the Thai page, and these
-- two columns to the /en page. Empty means "keep the page's built-in text".
--
-- Safe to run more than once.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.site_pages
  ADD COLUMN IF NOT EXISTS meta_title_en TEXT,
  ADD COLUMN IF NOT EXISTS meta_desc_en  TEXT;
