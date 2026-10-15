-- TARGET SYSTEM: WEBSITE  (Supabase project jrykbzdzcplhrhauvlvk)
-- NOT the intranet project (ecjsdvylsuchsjxnhgxf). Check the project ref in the
-- dashboard URL before running — the selector remembers whichever was open last.
--
-- Convert room_types[].room_type from display strings to stable keys.
--
-- WHY
--   The listing form stored whichever label the owner picked:
--
--       {roomTypeOptions.map(o => <option key={o} value={o}>{o}</option>)}
--
--   and the public property page rendered that value raw to every visitor.
--   With a Thai-only form this was merely inconsistent — an English visitor saw
--   "2 ห้องนอน". Translating the form would have made it bidirectional: a Thai
--   visitor would then see "2 bedrooms" on any listing an English-speaking owner
--   created, and the column would hold two languages permanently.
--
--   This is the third instance of the same shape in this codebase, after
--   district names and amenity spellings. Both were fixed by storing something
--   stable and translating at the point of display. Same fix here, applied
--   before the English form exists rather than after.
--
-- SAFE TO RUN BEFORE OR AFTER DEPLOYING THE CODE
--   lib/room-types resolves old display strings as well as new keys, so the app
--   renders correctly either way. Running the migration simply makes the stored
--   data consistent. There is no window where the site is wrong.
--
-- RUN ORDER: 1 to inspect, 2 to back up, 3 to migrate, 4 to verify.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1 · INSPECT
-- ─────────────────────────────────────────────────────────────────────────────

-- 1a. Column type. room_types is expected to be jsonb (an array of objects),
--     unlike amenities which is text[]. Confirm before running section 3.
select column_name, data_type, udt_name
from information_schema.columns
where table_name = 'properties' and column_name = 'room_types';

-- 1b. Every distinct room_type value in use, with a count.
select value ->> 'room_type' as room_type, count(*) as rows
from properties p, jsonb_array_elements(p.room_types) as value
where jsonb_typeof(p.room_types) = 'array'
  and value ->> 'room_type' is not null
group by 1
order by 2 desc, 1;

-- 1c. Anything that will NOT map to a key — these are left as stored, and are
--     worth eyeballing before and after.
select distinct value ->> 'room_type' as unmapped
from properties p, jsonb_array_elements(p.room_types) as value
where jsonb_typeof(p.room_types) = 'array'
  and value ->> 'room_type' is not null
  and value ->> 'room_type' not in (
    'Studio','1 ห้องนอน','2 ห้องนอน','3 ห้องนอน','4 ห้องนอน+','เชิงพาณิชย์',
    'บ้านเดี่ยว','ทาวน์เฮ้าส์','Penthouse','ดูเพล็กซ์','ลอฟท์',
    'Individual Desk','Private Office','Meeting Room','Full Floor','Shared Space',
    'Hot Desk','Dedicated Desk','Day Pass',
    '1 bedroom','2 bedrooms','3 bedrooms','4+ bedrooms','Commercial',
    'Detached house','Townhouse','Duplex','Loft',
    'Individual desk','Private office','Meeting room','Full floor','Shared space',
    'Hot desk','Dedicated desk','Day pass',
    'studio','bed_1','bed_2','bed_3','bed_4_plus','commercial','detached_house',
    'townhouse','penthouse','duplex','loft','individual_desk','private_office',
    'meeting_room','full_floor','shared_space','hot_desk','dedicated_desk','day_pass'
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- 2 · BACK UP
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists properties_roomtypes_backup_20261016 as
select id, slug, room_types, now() as backed_up_at
from properties;

select count(*) as backed_up from properties_roomtypes_backup_20261016;


-- ─────────────────────────────────────────────────────────────────────────────
-- 3 · MIGRATE
-- ─────────────────────────────────────────────────────────────────────────────
--
-- Rewrites room_type in place, preserving every other field in each object and
-- the order of the array. Values already in key form, and values that match
-- nothing, are left exactly as they are.

with keymap(label, key) as (
  values
    ('Studio','studio'),                 ('1 ห้องนอน','bed_1'),
    ('2 ห้องนอน','bed_2'),                ('3 ห้องนอน','bed_3'),
    ('4 ห้องนอน+','bed_4_plus'),          ('เชิงพาณิชย์','commercial'),
    ('บ้านเดี่ยว','detached_house'),       ('ทาวน์เฮ้าส์','townhouse'),
    ('Penthouse','penthouse'),           ('ดูเพล็กซ์','duplex'),
    ('ลอฟท์','loft'),                     ('Individual Desk','individual_desk'),
    ('Private Office','private_office'), ('Meeting Room','meeting_room'),
    ('Full Floor','full_floor'),         ('Shared Space','shared_space'),
    ('Hot Desk','hot_desk'),             ('Dedicated Desk','dedicated_desk'),
    ('Day Pass','day_pass'),
    -- English labels too: a listing created through the English form before this
    -- migration ran could hold either language.
    ('1 bedroom','bed_1'),               ('2 bedrooms','bed_2'),
    ('3 bedrooms','bed_3'),              ('4+ bedrooms','bed_4_plus'),
    ('Commercial','commercial'),         ('Detached house','detached_house'),
    ('Townhouse','townhouse'),           ('Duplex','duplex'),
    ('Loft','loft'),                     ('Individual desk','individual_desk'),
    ('Private office','private_office'), ('Meeting room','meeting_room'),
    ('Full floor','full_floor'),         ('Shared space','shared_space'),
    ('Hot desk','hot_desk'),             ('Dedicated desk','dedicated_desk'),
    ('Day pass','day_pass')
),
fixed as (
  select p.id,
         (
           select jsonb_agg(
                    case
                      when e.value ? 'room_type' and k.key is not null
                        then jsonb_set(e.value, '{room_type}', to_jsonb(k.key))
                      else e.value
                    end
                    order by e.ord
                  )
           from jsonb_array_elements(p.room_types) with ordinality as e(value, ord)
           left join keymap k on k.label = e.value ->> 'room_type'
         ) as room_types
  from properties p
  where jsonb_typeof(p.room_types) = 'array'
    and jsonb_array_length(p.room_types) > 0
)
update properties p
set room_types = f.room_types
from fixed f
where p.id = f.id
  and p.room_types is distinct from f.room_types;


-- ─────────────────────────────────────────────────────────────────────────────
-- 4 · VERIFY
-- ─────────────────────────────────────────────────────────────────────────────

-- 4a. Every value should now be a key. Anything listed here was unmapped in 1c
--     and is expected; anything new is not.
select distinct value ->> 'room_type' as remaining_non_key
from properties p, jsonb_array_elements(p.room_types) as value
where jsonb_typeof(p.room_types) = 'array'
  and value ->> 'room_type' is not null
  and value ->> 'room_type' !~ '^[a-z0-9_]+$';

-- 4b. Rows changed, by status.
select p.listing_status, count(*) as changed
from properties p
join properties_roomtypes_backup_20261016 b on b.id = p.id
where p.room_types is distinct from b.room_types
group by p.listing_status
order by 2 desc;

-- 4c. No object lost a field or an array lost an element.
select p.slug,
       jsonb_array_length(b.room_types) as before_len,
       jsonb_array_length(p.room_types) as after_len
from properties p
join properties_roomtypes_backup_20261016 b on b.id = p.id
where jsonb_typeof(b.room_types) = 'array'
  and jsonb_array_length(b.room_types) <> jsonb_array_length(p.room_types);


-- ─────────────────────────────────────────────────────────────────────────────
-- ROLLBACK
-- ─────────────────────────────────────────────────────────────────────────────
-- update properties p
-- set room_types = b.room_types
-- from properties_roomtypes_backup_20261016 b
-- where p.id = b.id;
