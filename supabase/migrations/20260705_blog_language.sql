-- #259 — add language column to blog_posts
-- Existing posts default to 'th'. New posts must be explicitly set to 'th' or 'en'.

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'th'
  CHECK (language IN ('th', 'en'));

-- Index for filtering by language on the public blog page
CREATE INDEX IF NOT EXISTS idx_blog_posts_language ON blog_posts (language);
