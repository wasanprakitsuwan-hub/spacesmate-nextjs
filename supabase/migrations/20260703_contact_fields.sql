-- Migration: add contact fields to properties table
-- Run in: Supabase Dashboard → SQL Editor → New query
-- Date: 2026-07-03

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS contact_name  TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS contact_line  TEXT;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
