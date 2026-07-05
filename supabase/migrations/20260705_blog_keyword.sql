-- #261 — add keyword column to blog_posts
-- Stores the primary SEO keyphrase for each post.

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS keyword text;
