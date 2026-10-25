-- ═══════════════════════════════════════════════════════════════════════════
-- Rent-near-a-place pages — area write-ups
--
-- WEBSITE database (spacesmate.com — jrykbzdzcplhrhauvlvk).
--
-- Adds the "why people rent here" points and the longer write-up to the
-- per-page override row in seo_pages (see 20261025a). Highlights are one per
-- line; the write-up is paragraphs separated by a blank line. Empty means the
-- page uses the drafted text in lib/rent-content.ts, or none.
--
-- Safe to run more than once.
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE public.seo_pages
  ADD COLUMN IF NOT EXISTS highlights_th TEXT,
  ADD COLUMN IF NOT EXISTS highlights_en TEXT,
  ADD COLUMN IF NOT EXISTS body_th       TEXT,
  ADD COLUMN IF NOT EXISTS body_en       TEXT;
