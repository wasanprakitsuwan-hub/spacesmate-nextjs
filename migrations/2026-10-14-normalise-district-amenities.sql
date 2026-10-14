-- TARGET SYSTEM: WEBSITE  (Supabase project jrykbzdzcplhrhauvlvk)
-- NOT the intranet project (ecjsdvylsuchsjxnhgxf). Check the project selector
-- before running — it remembers whichever was open last.
--
-- One-off cleanup of legacy listing data, 14 October 2026.
--
-- WHY
--   The listing form and the admin editor both capture district and amenities
--   through constrained pickers, so new listings arrive clean. These values came
--   in before that, most likely from the WordPress/Houzez migration, and the
--   pickers cannot produce them.
--
--   The visible symptom was cosmetic and is already fixed in the app: English
--   pages render district through a lookup. The real damage is in the editor.
--   app/dashboard/listings/page.tsx does:
--
--       const a = amphures.find(a => a.name === form.district)
--       if (!a) return
--
--   "เขตประเวศ" never matches the picker's "ประเวศ", so the district dropdown
--   renders empty and the sub-district list never loads. Open such a listing,
--   save it, and a blank district can be written back. The same applies to the
--   amenity checkboxes: a listing holding "เครื่องปรับอากาศ" does not tick the
--   "แอร์" box, so the amenity looks unset when it is set.
--
-- SCOPE
--   12 of 16 listings have a prefixed district. 8 amenity values are variants of
--   a canonical name. 5 listings hold BOTH spellings of the same amenity, so the
--   mapping must deduplicate or those listings would show the amenity twice —
--   pasuk-palace-nvo1o held five such pairs and went from 18 entries to 13.
--
-- NOT INCLUDED, DELIBERATELY
--   "เครื่องทำน้ำอุ่น" (water heater, on 4 listings) is not a variant of
--   anything — it is a real amenity missing from the canonical list. Remapping it
--   would delete information. It should be ADDED to the amenity list in Settings
--   (or lib/amenities.ts) instead, which is an app change, not a data one.
--
-- RUN ORDER: section 1 to inspect, 2 to back up, 3 to migrate, 4 to verify.
-- Nothing in sections 1 and 2 modifies listing data.


-- ─────────────────────────────────────────────────────────────────────────────
-- 1 · INSPECT FIRST
-- ─────────────────────────────────────────────────────────────────────────────

-- 1a. Column types. Confirmed 14 Oct 2026: district and province are text,
--     amenities is ARRAY / _text (a Postgres text[]), NOT jsonb. The statements
--     below use unnest/array_agg accordingly — an earlier draft assumed jsonb
--     and would have errored.
select column_name, data_type, udt_name
from information_schema.columns
where table_name = 'properties' and column_name in ('amenities', 'district', 'province');

-- 1b. The 12 district rows that will change.
select slug, district as before,
       regexp_replace(district, '^(เขต|อำเภอ|อ\.)\s*', '') as after,
       province
from properties
where listing_status = 'active'
  and district ~ '^(เขต|อำเภอ|อ\.)'
order by district, slug;

-- 1c. Every amenity value not in the canonical list, with its listing count.
select value as amenity, count(*) as listings
from properties p, unnest(p.amenities) as value
where p.listing_status = 'active'
  and value not in (
    'เฟอร์นิเจอร์พร้อมอยู่','เฟอร์นิเจอร์บางส่วน','แอร์','โทรทัศน์','ตู้เย็น','โซฟา',
    'โต๊ะกินข้าว','ไมโครเวฟ','เตาแม่เหล็กไฟฟ้า','เครื่องซักผ้า','ระเบียง','ห้องครัว',
    'WiFi','ที่จอดรถ','สระว่ายน้ำ','ห้องออกกำลังกาย (GYM)','กล้องวงจรปิด (CCTV)','ลิฟท์',
    'สวนสาธารณะ','สนามบาสเกตบอล','ห้องเกม','ตู้หยอดเหรียญ','ห้องซักรีด','รปภ 24 ชม',
    'ระบบ Keycard','ร้านสะดวกซื้อ','ร้านอาหาร','ร้านซักรีด'
  )
group by value
order by listings desc, value;


-- ─────────────────────────────────────────────────────────────────────────────
-- 2 · BACK UP  (run this before section 3, not after)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists properties_backup_20261014 as
select id, slug, district, province, amenities, now() as backed_up_at
from properties;

-- Sanity: should match the number of rows in properties.
select count(*) as backed_up from properties_backup_20261014;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3 · MIGRATE
-- ─────────────────────────────────────────────────────────────────────────────

begin;

-- 3a. District — strip the administrative prefix so the value matches what the
--     picker produces. Province is left alone; it already matches.
update properties
set district = regexp_replace(district, '^(เขต|อำเภอ|อ\.)\s*', '')
where district ~ '^(เขต|อำเภอ|อ\.)';

-- 3b. Amenities — map variants onto their canonical name, then deduplicate.
--
--     Order is preserved by the first appearance of each resulting value, so a
--     listing's amenity order does not get shuffled. The dedupe is what matters:
--     5 listings hold both spellings, and pasuk-palace-nvo1o holds five such
--     pairs (18 entries collapsing to 13).
with alias(variant, canonical) as (
  values
    ('เครื่องปรับอากาศ',          'แอร์'),
    ('เแอร์',                      'แอร์'),              -- typo in the source data
    ('เฟอร์นิเจอร์ครบ',            'เฟอร์นิเจอร์พร้อมอยู่'),
    ('ฟิตเนส',                     'ห้องออกกำลังกาย (GYM)'),
    ('รักษาความปลอดภัย 24 ชม.',    'รปภ 24 ชม'),
    ('กล้องวงจรปิด',               'กล้องวงจรปิด (CCTV)'),
    ('ลิฟต์',                      'ลิฟท์'),
    ('อินเทอร์เน็ต',               'WiFi')
),
fixed as (
  select p.id,
         (
           select array_agg(t.v order by t.first_at)
           from (
             select coalesce(a.canonical, e.value) as v, min(e.ord) as first_at
             from unnest(p.amenities) with ordinality as e(value, ord)
             left join alias a on a.variant = e.value
             group by 1
           ) t
         ) as amenities
  from properties p
  where p.amenities is not null
)
update properties p
set amenities = f.amenities
from fixed f
where p.id = f.id
  and p.amenities is distinct from f.amenities;

-- Review the counts printed by the two statements above before committing.
-- Expected: 12 rows for 3a, 8 rows for 3b (5 with collisions, 3 without).
commit;
-- If anything looks wrong instead: rollback;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4 · VERIFY
-- ─────────────────────────────────────────────────────────────────────────────

-- 4a. No prefixed districts remain.
select count(*) as should_be_zero
from properties
where district ~ '^(เขต|อำเภอ|อ\.)';

-- 4b. No variant amenities remain. Only เครื่องทำน้ำอุ่น should appear, because
--     it is a genuine amenity missing from the list rather than a variant.
select value as amenity, count(*) as listings
from properties p, unnest(p.amenities) as value
where value in (
  'เครื่องปรับอากาศ','เแอร์','เฟอร์นิเจอร์ครบ','ฟิตเนส',
  'รักษาความปลอดภัย 24 ชม.','กล้องวงจรปิด','ลิฟต์','อินเทอร์เน็ต'
)
group by value;

-- 4c. No listing has a duplicated amenity.
select slug,
       array_length(amenities, 1) as stored,
       (select count(distinct value) from unnest(amenities) as value) as distinct_values
from properties
where amenities is not null
  and array_length(amenities, 1)
      <> (select count(distinct value) from unnest(amenities) as value);

-- 4d. The two Prawet listings now agree.
select slug, district, province
from properties
where district = 'ประเวศ';


-- ─────────────────────────────────────────────────────────────────────────────
-- ROLLBACK, if needed after committing
-- ─────────────────────────────────────────────────────────────────────────────
-- update properties p
-- set district = b.district, amenities = b.amenities
-- from properties_backup_20261014 b
-- where p.id = b.id;
