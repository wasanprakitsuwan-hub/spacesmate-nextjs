-- Migration: extend user_profiles for super_admin role + name/phone fields
-- Run this in: Supabase Dashboard → SQL Editor
-- Date: 2026-06-29

-- 1. Add first_name, last_name, phone columns (safe — does nothing if already exist)
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name  TEXT,
  ADD COLUMN IF NOT EXISTS phone      TEXT;

-- 2. Update the role CHECK constraint to include 'super_admin'
--    Drop the old constraint first, then re-add with the new value.
--    (Constraint name may differ — check yours with: \d user_profiles)
DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  -- Find existing CHECK constraint on the role column
  SELECT conname INTO constraint_name
  FROM pg_constraint c
  JOIN pg_class t ON t.oid = c.conrelid
  WHERE t.relname = 'user_profiles'
    AND c.contype = 'c'
    AND c.consrc ILIKE '%role%'
  LIMIT 1;

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE user_profiles DROP CONSTRAINT %I', constraint_name);
    RAISE NOTICE 'Dropped old constraint: %', constraint_name;
  END IF;
END $$;

-- Add updated CHECK constraint with super_admin included
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_role_check
  CHECK (role IN ('landlord', 'admin', 'super_admin'));

-- 3. Backfill full_name from first_name + last_name where possible
UPDATE user_profiles
SET full_name = TRIM(CONCAT_WS(' ', first_name, last_name))
WHERE first_name IS NOT NULL OR last_name IS NOT NULL
  AND (full_name IS NULL OR full_name = '');

-- 4. Verify
SELECT
  COUNT(*)                                                      AS total_users,
  COUNT(*) FILTER (WHERE role = 'super_admin')                  AS super_admins,
  COUNT(*) FILTER (WHERE role = 'admin')                        AS admins,
  COUNT(*) FILTER (WHERE role = 'landlord')                     AS landlords,
  COUNT(*) FILTER (WHERE first_name IS NOT NULL)                AS has_first_name,
  COUNT(*) FILTER (WHERE phone IS NOT NULL)                     AS has_phone
FROM user_profiles;
