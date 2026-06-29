-- ============================================================
-- Migration 002 — Add room_types, images, video_url columns
-- Run in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ── properties table ──────────────────────────────────────────
ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS room_types  JSONB    DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS images      TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS video_url   TEXT;

-- ── Refresh PostgREST schema cache ────────────────────────────
-- This tells Supabase to reload the schema so the new columns
-- are visible to the API without needing a full restart.
NOTIFY pgrst, 'reload schema';
