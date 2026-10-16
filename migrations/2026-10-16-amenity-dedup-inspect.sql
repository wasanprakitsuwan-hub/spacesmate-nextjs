-- TARGET SYSTEM: WEBSITE  (Supabase project jrykbzdzcplhrhauvlvk)
-- NOT the intranet project (ecjsdvylsuchsjxnhgxf). Check the project ref in the
-- dashboard URL before running — the selector remembers whichever was open last.
--
-- INSPECT ONLY. Nothing here writes. Run it, paste the results back, and the
-- migration gets written against what is actually stored rather than a guess.
--
-- WHAT WE ALREADY KNOW, from /api/settings/public?key=amenities on production
--
--   1 · เครื่องทำน้ำอุ่น (Water Heater) is in the list twice — ids
--       1783608202476 and 1791993263976, identical name_th. The form keys
--       selection off name_th (`form.amenities.includes(a.name_th)`), so both
--       buttons light up when either is clicked. Two controls, one value.
--
--   2 · รับสัตว์เลี้ยง (Pet Friendly, id 11) and เลี้ยงสัตว์ได้ (pet allow,
--       id 1785083586085) are the same amenity under two names. These are two
--       *different* stored values, so a tenant filtering on one misses every
--       listing tagged with the other. This is the one that costs enquiries.
--
--   3 · name_en casing is inconsistent — "Air Conditioning" and "Water Heater"
--       in Title Case, "pet allow" and "electric stove" in lower case. Harmless
--       in Thai, visible side by side on the new English form.
--
--   4 · DEFAULT_AMENITIES in lib/amenities has 28 entries; the live list has 15
--       unique. Exactly three names appear in both: ที่จอดรถ, สระว่ายน้ำ,
--       เครื่องซักผ้า. The defaults exist as a fallback for when
--       /api/settings/public fails, and the comment there says they were seeded
--       "so nothing already selected on a live listing stops matching" — but
--       they no longer resemble the live list at all. A listing saved during a
--       fallback window would store names that match nothing afterwards.
--       Query 5 below checks whether that has already happened.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1 · Column type. Expected: text[] (ARRAY / _text), as it was for the
--     district clean-up. If this says jsonb, stop — the migration needs
--     rewriting with jsonb_array_elements instead of unnest.
-- ─────────────────────────────────────────────────────────────────────────────
select column_name, data_type, udt_name
from information_schema.columns
where table_name = 'properties' and column_name = 'amenities';


-- ─────────────────────────────────────────────────────────────────────────────
-- 2 · Every amenity value in use, with how many listings carry it and whether
--     those listings are live. This is the whole picture in one table.
-- ─────────────────────────────────────────────────────────────────────────────
select a.name,
       count(*) as listings,
       count(*) filter (where p.listing_status = 'active') as active,
       count(*) filter (where p.listing_status <> 'active') as not_active
from properties p, unnest(p.amenities) as a(name)
group by a.name
order by listings desc, a.name;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3 · The two pet amenities specifically. Which name is actually in use, and
--     is any listing tagged with both?
-- ─────────────────────────────────────────────────────────────────────────────
select
  count(*) filter (where 'รับสัตว์เลี้ยง' = any(amenities)) as pet_friendly,
  count(*) filter (where 'เลี้ยงสัตว์ได้'  = any(amenities)) as pet_allow,
  count(*) filter (where 'รับสัตว์เลี้ยง' = any(amenities)
                     and 'เลี้ยงสัตว์ได้'  = any(amenities)) as both
from properties;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4 · Any listing holding the same amenity twice. The duplicate Water Heater
--     entry makes this possible, and a duplicate would render twice on the
--     public page.
-- ─────────────────────────────────────────────────────────────────────────────
select p.slug, a.name, count(*) as times
from properties p, unnest(p.amenities) as a(name)
group by p.slug, a.name
having count(*) > 1
order by times desc;


-- ─────────────────────────────────────────────────────────────────────────────
-- 5 · Did anyone ever save a listing while the settings API was failing over to
--     DEFAULT_AMENITIES? These 25 names exist only in the fallback list. Any
--     row here is a listing tagged with an amenity the picker no longer offers.
-- ─────────────────────────────────────────────────────────────────────────────
select a.name, count(*) as listings
from properties p, unnest(p.amenities) as a(name)
where a.name in (
  'เฟอร์นิเจอร์พร้อมอยู่','เฟอร์นิเจอร์บางส่วน','แอร์','โทรทัศน์','ตู้เย็น','โซฟา',
  'โต๊ะกินข้าว','ไมโครเวฟ','เตาแม่เหล็กไฟฟ้า','ระเบียง','ห้องครัว','WiFi',
  'ห้องออกกำลังกาย (GYM)','กล้องวงจรปิด (CCTV)','ลิฟท์','สวนสาธารณะ',
  'สนามบาสเกตบอล','ห้องเกม','ตู้หยอดเหรียญ','ห้องซักรีด','รปภ 24 ชม',
  'ระบบ Keycard','ร้านสะดวกซื้อ','ร้านอาหาร','ร้านซักรีด'
)
group by a.name
order by listings desc;


-- ─────────────────────────────────────────────────────────────────────────────
-- 6 · Anything stored that neither list offers — typos, or amenities removed
--     from Settings after listings were already tagged with them.
-- ─────────────────────────────────────────────────────────────────────────────
select a.name, count(*) as listings
from properties p, unnest(p.amenities) as a(name)
where a.name not in (
  -- live list
  'เครื่องปรับอากาศ','เฟอร์นิเจอร์ครบ','อินเทอร์เน็ต','สระว่ายน้ำ','ฟิตเนส','ที่จอดรถ',
  'รักษาความปลอดภัย 24 ชม.','กล้องวงจรปิด','ใกล้ห้างสรรพสินค้า','รับสัตว์เลี้ยง','ลิฟต์',
  'เครื่องซักผ้า','เครื่องทำน้ำอุ่น','เลี้ยงสัตว์ได้','เตาไฟฟ้า',
  -- fallback defaults
  'เฟอร์นิเจอร์พร้อมอยู่','เฟอร์นิเจอร์บางส่วน','แอร์','โทรทัศน์','ตู้เย็น','โซฟา',
  'โต๊ะกินข้าว','ไมโครเวฟ','เตาแม่เหล็กไฟฟ้า','ระเบียง','ห้องครัว','WiFi',
  'ห้องออกกำลังกาย (GYM)','กล้องวงจรปิด (CCTV)','ลิฟท์','สวนสาธารณะ',
  'สนามบาสเกตบอล','ห้องเกม','ตู้หยอดเหรียญ','ห้องซักรีด','รปภ 24 ชม',
  'ระบบ Keycard','ร้านสะดวกซื้อ','ร้านอาหาร','ร้านซักรีด'
)
group by a.name
order by listings desc;
