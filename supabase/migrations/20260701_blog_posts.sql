-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: blog_posts
-- Run in: Supabase Dashboard → SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT        NOT NULL,
  slug          TEXT        NOT NULL UNIQUE,
  category      TEXT        NOT NULL DEFAULT 'คู่มือผู้เช่า',
  status        TEXT        NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('published', 'draft', 'review')),
  content       TEXT,
  thumbnail     TEXT,            -- base64 WebP data URL or CDN URL
  thumbnail_alt TEXT,
  meta_title    TEXT,
  meta_desc     TEXT,
  seo_score     INT         NOT NULL DEFAULT 0,
  views         INT         NOT NULL DEFAULT 0,
  author        TEXT        NOT NULL DEFAULT 'SpacesMate',
  published_at  TIMESTAMPTZ,     -- set automatically when status → published
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read published posts (for public blog page)
CREATE POLICY "public_read_published_blog_posts"
  ON public.blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- Admin writes are handled by service-role API routes (bypasses RLS)
-- No additional policies needed for INSERT / UPDATE / DELETE
