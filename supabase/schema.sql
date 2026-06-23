-- ============================================================
-- SpacesMate Database Schema
-- Supabase (PostgreSQL)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ────────────────────────────────────────────────────────────
-- 1. USER PROFILES
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT,
  phone         TEXT,
  line_id       TEXT,
  role          TEXT NOT NULL DEFAULT 'landlord' CHECK (role IN ('landlord', 'admin')),
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ────────────────────────────────────────────────────────────
-- 2. PROPERTIES
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.properties (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug            TEXT UNIQUE NOT NULL,
  landlord_id     UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

  -- Content
  title_th        TEXT NOT NULL,
  title_en        TEXT,
  description_th  TEXT,
  description_en  TEXT,

  -- Classification
  property_type   TEXT NOT NULL CHECK (property_type IN ('apartment','condo','house','coworking','office')),
  status          TEXT NOT NULL DEFAULT 'for_rent' CHECK (status IN ('for_rent','for_sale')),

  -- Pricing
  price_from      INTEGER NOT NULL,
  price_to        INTEGER,

  -- Specs
  area_sqm        NUMERIC(8,2),
  bedrooms        INTEGER NOT NULL DEFAULT 1,
  bathrooms       INTEGER NOT NULL DEFAULT 1,
  floor           INTEGER,

  -- Location
  address_th      TEXT,
  district        TEXT,   -- แขวง
  sub_district    TEXT,   -- เขต
  province        TEXT DEFAULT 'กรุงเทพมหานคร',
  postcode        TEXT,
  lat             NUMERIC(10,7),
  lng             NUMERIC(10,7),

  -- Amenities (array of keys matching AMENITY_LABELS)
  amenities       TEXT[] DEFAULT '{}',

  -- Status & Verification
  listing_status  TEXT NOT NULL DEFAULT 'pending' CHECK (listing_status IN ('active','inactive','pending','expired')),
  featured        BOOLEAN DEFAULT FALSE,
  verified        BOOLEAN DEFAULT FALSE,
  verified_at     TIMESTAMPTZ,

  -- Metadata
  view_count      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Index for common queries
CREATE INDEX idx_properties_status    ON public.properties(listing_status);
CREATE INDEX idx_properties_type      ON public.properties(property_type);
CREATE INDEX idx_properties_district  ON public.properties(district);
CREATE INDEX idx_properties_price     ON public.properties(price_from);
CREATE INDEX idx_properties_verified  ON public.properties(verified, listing_status);
CREATE INDEX idx_properties_slug      ON public.properties(slug);


-- ────────────────────────────────────────────────────────────
-- 3. PROPERTY IMAGES
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.property_images (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id   UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  url           TEXT NOT NULL,
  alt_th        TEXT,
  alt_en        TEXT,
  is_featured   BOOLEAN DEFAULT FALSE,
  sort_order    INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_property_images_property ON public.property_images(property_id);


-- ────────────────────────────────────────────────────────────
-- 4. SUBSCRIPTION PACKAGES
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.subscription_packages (
  id              TEXT PRIMARY KEY,  -- 'trial', 'basic', 'standard', 'premium'
  name_th         TEXT NOT NULL,
  price_thb       INTEGER NOT NULL DEFAULT 0,
  duration_days   INTEGER NOT NULL,
  max_listings    INTEGER NOT NULL DEFAULT 1,
  features        TEXT[] DEFAULT '{}',
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed packages
INSERT INTO public.subscription_packages (id, name_th, price_thb, duration_days, max_listings, features) VALUES
  ('trial',    'ทดลองใช้ฟรี',      0,    30,  1,  ARRAY['ลงประกาศได้ 1 รายการ', 'แสดงผล 30 วัน', 'ไม่ต้องใช้บัตรเครดิต']),
  ('basic',    'แพ็กเกจ Basic',   299,  30,  1,  ARRAY['ลงประกาศได้ 1 รายการ', 'แสดงผล 30 วัน', 'อัปเดตไม่จำกัด']),
  ('standard', 'แพ็กเกจ Standard', 799,  90,  3,  ARRAY['ลงประกาศได้ 3 รายการ', 'แสดงผล 90 วัน', 'ส่วนลด 11%']),
  ('premium',  'แพ็กเกจ Premium', 2499, 365, 10, ARRAY['ลงประกาศได้ 10 รายการ', 'แสดงผล 365 วัน', 'ส่วนลด 30%', 'Priority support']);


-- ────────────────────────────────────────────────────────────
-- 5. SUBSCRIPTIONS
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.subscriptions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  landlord_id   UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  package_id    TEXT NOT NULL REFERENCES public.subscription_packages(id),
  property_id   UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  starts_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL,
  is_active     BOOLEAN DEFAULT TRUE,
  payment_ref   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_landlord ON public.subscriptions(landlord_id);
CREATE INDEX idx_subscriptions_expires  ON public.subscriptions(expires_at);


-- ────────────────────────────────────────────────────────────
-- 6. ROW LEVEL SECURITY (RLS)
-- ────────────────────────────────────────────────────────────

-- Properties: public can read active listings
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active listings"
  ON public.properties FOR SELECT
  USING (listing_status = 'active');

CREATE POLICY "Landlords can manage own properties"
  ON public.properties FOR ALL
  USING (auth.uid() = landlord_id)
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Admins can manage all properties"
  ON public.properties FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Property Images: public read
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read property images"
  ON public.property_images FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.properties
    WHERE id = property_id AND listing_status = 'active'
  ));

CREATE POLICY "Landlords can manage own property images"
  ON public.property_images FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.properties
    WHERE id = property_id AND landlord_id = auth.uid()
  ));

-- User profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Packages: public read
ALTER TABLE public.subscription_packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read packages"
  ON public.subscription_packages FOR SELECT
  USING (TRUE);

-- Subscriptions: own records only
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Landlords can read own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = landlord_id);


-- ────────────────────────────────────────────────────────────
-- 7. STORAGE BUCKET
-- ────────────────────────────────────────────────────────────
-- Run this in Supabase Dashboard → Storage → New bucket
-- Bucket name: property-images
-- Public: YES
-- Allowed MIME types: image/jpeg, image/png, image/webp
-- Max file size: 5MB
