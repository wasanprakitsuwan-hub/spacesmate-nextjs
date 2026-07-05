-- #262 — link properties back to the submission that created them
-- Allows auto-claiming orphaned listings when a user registers after paying.

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS source_submission_id uuid REFERENCES submissions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_properties_source_submission
  ON properties(source_submission_id)
  WHERE source_submission_id IS NOT NULL;
