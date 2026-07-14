-- ============================================================
-- Migration: Add missing extended columns to submissions table
-- Date: 2026-07-10
-- Fixes: "บันทึกข้อมูลไม่สำเร็จ" error on /submit/new checkout
-- Root cause: room_types, video_url, title_en, description_en,
--             lat, lng, images were never added to submissions
-- ============================================================

ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS title_en        TEXT,
  ADD COLUMN IF NOT EXISTS description_en  TEXT,
  ADD COLUMN IF NOT EXISTS lat             NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS lng             NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS room_types      JSONB    DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS video_url       TEXT,
  ADD COLUMN IF NOT EXISTS images          TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS user_id         UUID     REFERENCES auth.users(id) ON DELETE SET NULL;

-- Refresh PostgREST schema cache so API sees the new columns immediately
NOTIFY pgrst, 'reload schema';
