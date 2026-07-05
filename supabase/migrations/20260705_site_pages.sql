-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: site_pages — editable page registry for /dashboard/pages
-- Run in: Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists site_pages (
  id           uuid primary key default gen_random_uuid(),
  path         text not null unique,
  label_th     text not null,
  label_en     text not null,
  group_name   text not null default 'หน้าหลัก',
  icon         text not null default 'web',
  page_type    text not null default 'live',   -- live | dynamic | form | redirect
  status       text not null default 'published', -- published | unpublished | deleted
  is_indexable boolean not null default true,
  meta_title   text,
  meta_desc    text,
  notes        text,
  sort_order   int not null default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- RLS: service role only (all access via API routes with service key)
alter table site_pages enable row level security;
create policy "service_role_all" on site_pages
  for all using (true) with check (true);

-- ─── Seed — all 26 pages ─────────────────────────────────────────────────────
insert into site_pages (path, label_th, label_en, group_name, icon, page_type, status, is_indexable, sort_order) values
  -- หน้าหลัก
  ('/',                      'หน้าแรก',                     'Home',                      'หน้าหลัก',       'home',           'live',     'published', true,  1),
  ('/about',                 'เกี่ยวกับเรา',                 'About Us',                  'หน้าหลัก',       'info',           'live',     'published', true,  2),
  ('/services',              'บริการของเรา',                 'Services',                  'หน้าหลัก',       'workspaces',     'live',     'published', true,  3),
  ('/pricing',               'แพ็กเกจราคา',                 'Pricing',                   'หน้าหลัก',       'sell',           'live',     'published', true,  4),
  ('/contact',               'ติดต่อเรา',                   'Contact',                   'หน้าหลัก',       'contact_mail',   'live',     'published', true,  5),
  ('/faq',                   'คำถามที่พบบ่อย',               'FAQ',                       'หน้าหลัก',       'quiz',           'live',     'published', true,  6),
  -- ค้นหาและประกาศ
  ('/search',                'ค้นหาที่พัก',                  'Search Rentals',            'ค้นหาและประกาศ', 'search',         'live',     'published', true,  10),
  ('/property/[slug]',       'รายละเอียดประกาศ',             'Property Detail',           'ค้นหาและประกาศ', 'apartment',      'dynamic',  'published', true,  11),
  ('/submit',                'ลงประกาศ',                    'Submit Listing',             'ค้นหาและประกาศ', 'add_circle',     'live',     'published', true,  12),
  ('/submit/new',            'ฟอร์มลงประกาศ',               'Listing Form',              'ค้นหาและประกาศ', 'edit_note',      'form',     'published', false, 13),
  ('/submit/success',        'ลงประกาศสำเร็จ',              'Submit Success',            'ค้นหาและประกาศ', 'check_circle',   'redirect', 'published', false, 14),
  -- ฝากบริหาร
  ('/manage',                'ฝากบริหารทรัพย์สิน',          'Property Management Inquiry','ฝากบริหาร',      'handshake',      'form',     'published', true,  20),
  -- บทความ
  ('/blog',                  'บทความทั้งหมด',               'Blog',                      'บทความ',         'article',        'live',     'published', true,  30),
  ('/blog/[slug]',           'บทความ (ละเอียด)',            'Blog Post',                 'บทความ',         'description',    'dynamic',  'published', true,  31),
  -- SEO
  ('/area/[slug]',           'หน้า SEO ทำเล (TH)',          'Area SEO Pages — Thai',     'SEO พื้นที่',    'location_on',    'dynamic',  'published', true,  40),
  ('/en/area/[slug]',        'หน้า SEO ทำเล (EN)',          'Area SEO Pages — English',  'SEO พื้นที่',    'language',       'dynamic',  'published', true,  41),
  -- นโยบาย
  ('/privacy',               'นโยบายความเป็นส่วนตัว',       'Privacy Policy',            'นโยบายและกฎหมาย','policy',         'live',     'published', true,  50),
  ('/terms',                 'เงื่อนไขการใช้งาน',           'Terms of Service',          'นโยบายและกฎหมาย','gavel',          'live',     'published', true,  51),
  -- เจ้าของ & ระบบ
  ('/login',                 'เข้าสู่ระบบ',                 'Login / Register',          'เจ้าของ & ระบบ', 'login',          'form',     'published', false, 60),
  ('/owner-dashboard',       'แดชบอร์ดเจ้าของ',             'Owner Dashboard',           'เจ้าของ & ระบบ', 'dashboard',      'live',     'published', false, 61),
  ('/owner-dashboard/profile','โปรไฟล์เจ้าของ',             'Owner Profile',             'เจ้าของ & ระบบ', 'person',         'form',     'published', false, 62)
on conflict (path) do nothing;
