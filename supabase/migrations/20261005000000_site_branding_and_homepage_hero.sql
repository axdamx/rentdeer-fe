alter table public.site_settings
  add column if not exists logo_path text,
  add column if not exists homepage_hero_slides jsonb not null default '[]'::jsonb;

alter table public.site_settings
  drop constraint if exists site_settings_homepage_hero_slides_check;

alter table public.site_settings
  add constraint site_settings_homepage_hero_slides_check check (
    jsonb_typeof(homepage_hero_slides) = 'array'
    and jsonb_array_length(homepage_hero_slides) <= 4
  );

update public.site_settings
set homepage_hero_slides = jsonb_build_array(
  jsonb_build_object(
    'path', '/estatein/property-villa.png',
    'alt', 'A furnished RentDeer residence'
  ),
  jsonb_build_object(
    'path', '/estatein/property-campus.png',
    'alt', 'A landscaped RentDeer residential community'
  ),
  jsonb_build_object(
    'path', '/estatein/property-tower.png',
    'alt', 'A modern RentDeer residential tower'
  ),
  jsonb_build_object(
    'path', '/estatein/hero-building.png',
    'alt', 'A contemporary home managed by RentDeer'
  )
)
where homepage_hero_slides = '[]'::jsonb;

update storage.buckets
set allowed_mime_types = array[
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/svg+xml'
]
where id = 'listing-media';
