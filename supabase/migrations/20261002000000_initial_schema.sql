create extension if not exists pg_trgm with schema extensions;

create type public.admin_role as enum ('admin', 'editor');
create type public.publish_status as enum ('draft', 'published', 'archived');
create type public.availability_status as enum (
  'available',
  'reserved',
  'occupied',
  'unavailable',
  'coming_soon'
);
create type public.room_type as enum (
  'master_bedroom',
  'medium_bedroom',
  'single_bedroom',
  'small_room',
  'soho_studio',
  'whole_unit'
);
create type public.bathroom_type as enum ('private', 'shared', 'unspecified');
create type public.enquiry_status as enum ('new', 'in_progress', 'replied', 'closed');

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.admin_role not null default 'editor',
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles
    where user_id = (select auth.uid())
      and is_active = true
  );
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.admin_profiles (user_id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger create_admin_profile_after_signup
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  legal_name text,
  description text not null default '',
  property_type text not null default 'Managed residence',
  managed_by text not null default 'RentDeer Property Management',
  address_line text,
  postcode text,
  city text not null,
  area text,
  state text not null default 'Selangor',
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  status public.publish_status not null default 'draft',
  is_featured boolean not null default false,
  seo_title text,
  seo_description text,
  highlights jsonb not null default '[]'::jsonb,
  house_rules jsonb not null default '[]'::jsonb,
  rental_terms jsonb not null default '[]'::jsonb,
  booking_steps jsonb not null default '[]'::jsonb,
  availability_label text not null default 'Ready to enquire',
  response_time text not null default 'Usually replies within 1 business day',
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint properties_latitude_check check (latitude is null or latitude between -90 and 90),
  constraint properties_longitude_check check (longitude is null or longitude between -180 and 180)
);

create table public.property_aliases (
  id bigint generated always as identity primary key,
  property_id uuid not null references public.properties(id) on delete cascade,
  alias text not null,
  unique (property_id, alias)
);

create table public.facilities (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null unique
);

create table public.property_facilities (
  property_id uuid not null references public.properties(id) on delete cascade,
  facility_id bigint not null references public.facilities(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (property_id, facility_id)
);

create table public.rental_options (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  slug text not null,
  title text not null,
  internal_code text,
  variant text,
  room_type public.room_type not null,
  description text not null default '',
  price_min integer not null,
  price_max integer,
  currency char(3) not null default 'MYR',
  price_note text,
  bedrooms numeric(4, 1) not null default 1,
  bathrooms numeric(4, 1) not null default 1,
  area_sqft integer,
  bed_type text,
  bathroom_type public.bathroom_type not null default 'unspecified',
  furnished boolean not null default true,
  has_balcony boolean,
  has_window boolean,
  availability public.availability_status not null default 'available',
  available_from date,
  quantity_available integer not null default 1,
  status public.publish_status not null default 'draft',
  virtual_tour_url text,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (property_id, slug),
  constraint rental_options_price_min_check check (price_min >= 0),
  constraint rental_options_price_max_check check (price_max is null or price_max >= price_min),
  constraint rental_options_quantity_check check (quantity_available >= 0)
);

create table public.amenities (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null unique
);

create table public.rental_option_amenities (
  rental_option_id uuid not null references public.rental_options(id) on delete cascade,
  amenity_id bigint not null references public.amenities(id) on delete cascade,
  sort_order integer not null default 0,
  primary key (rental_option_id, amenity_id)
);

create table public.property_nearby_places (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  label text not null,
  distance text not null,
  sort_order integer not null default 0
);

create table public.content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  route text not null unique,
  description text not null default '',
  status public.publish_status not null default 'draft',
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.content_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.content_pages(id) on delete cascade,
  section_key text not null,
  name text not null,
  content jsonb not null default '{}'::jsonb,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_id, section_key)
);

create table public.media_assets (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references public.properties(id) on delete cascade,
  rental_option_id uuid references public.rental_options(id) on delete cascade,
  content_section_id uuid references public.content_sections(id) on delete cascade,
  bucket text not null default 'listing-media',
  object_path text not null unique,
  source_url text,
  alt_text text not null default '',
  mime_type text,
  width integer,
  height integer,
  is_cover boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint media_assets_single_owner_check check (
    num_nonnulls(property_id, rental_option_id, content_section_id) = 1
  )
);

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('ENQ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  property_id uuid references public.properties(id) on delete set null,
  rental_option_id uuid references public.rental_options(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  topic text not null,
  message text not null,
  status public.enquiry_status not null default 'new',
  consented_at timestamptz not null,
  source_url text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.enquiry_notes (
  id uuid primary key default gen_random_uuid(),
  enquiry_id uuid not null references public.enquiries(id) on delete cascade,
  body text not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.site_settings (
  id boolean primary key default true check (id),
  site_name text not null default 'RentDeer',
  tagline text not null default 'Rent Smarter. Live Better.',
  primary_colour text not null default '#185519',
  accent_colour text not null default '#F5CF3F',
  company_email text,
  tenant_phone text,
  tenant_whatsapp text,
  landlord_whatsapp text,
  company_address text,
  default_seo_title text,
  default_seo_description text,
  updated_at timestamptz not null default now()
);

create table public.social_links (
  id bigint generated always as identity primary key,
  platform text not null unique,
  url text not null,
  is_visible boolean not null default true,
  sort_order integer not null default 0
);

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  quote text not null,
  rating numeric(2, 1),
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  biography text not null default '',
  image_path text,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  audience text,
  is_visible boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_steps (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  title text not null,
  description text,
  sort_order integer not null default 0
);

create table public.bulletin_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text,
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  cover_image_path text,
  status public.publish_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  changes jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'admin_profiles', 'properties', 'rental_options', 'content_pages',
    'content_sections', 'enquiries', 'site_settings', 'faqs', 'testimonials',
    'team_members', 'services', 'bulletin_posts'
  ]
  loop
    execute format(
      'create trigger set_%I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      table_name,
      table_name
    );
  end loop;
end;
$$;

create index properties_status_city_idx on public.properties(status, city);
create index properties_updated_at_idx on public.properties(updated_at desc);
create index properties_title_trgm_idx on public.properties using gin (title extensions.gin_trgm_ops);
create index rental_options_property_status_idx on public.rental_options(property_id, status, availability);
create index rental_options_room_price_idx on public.rental_options(room_type, price_min, price_max);
create index enquiries_status_created_idx on public.enquiries(status, created_at desc);
create index media_assets_property_idx on public.media_assets(property_id, sort_order);
create index media_assets_rental_option_idx on public.media_assets(rental_option_id, sort_order);

alter table public.admin_profiles enable row level security;
alter table public.properties enable row level security;
alter table public.property_aliases enable row level security;
alter table public.facilities enable row level security;
alter table public.property_facilities enable row level security;
alter table public.rental_options enable row level security;
alter table public.amenities enable row level security;
alter table public.rental_option_amenities enable row level security;
alter table public.property_nearby_places enable row level security;
alter table public.content_pages enable row level security;
alter table public.content_sections enable row level security;
alter table public.media_assets enable row level security;
alter table public.enquiries enable row level security;
alter table public.enquiry_notes enable row level security;
alter table public.site_settings enable row level security;
alter table public.social_links enable row level security;
alter table public.faqs enable row level security;
alter table public.testimonials enable row level security;
alter table public.team_members enable row level security;
alter table public.services enable row level security;
alter table public.service_steps enable row level security;
alter table public.bulletin_posts enable row level security;
alter table public.audit_logs enable row level security;

create policy "Users can read their own admin profile"
on public.admin_profiles for select to authenticated
using (user_id = (select auth.uid()) or public.is_admin());

create policy "Admins manage admin profiles"
on public.admin_profiles for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Public reads published properties"
on public.properties for select to anon, authenticated
using (status = 'published' or public.is_admin());
create policy "Admins manage properties"
on public.properties for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Public reads published rental options"
on public.rental_options for select to anon, authenticated
using (
  (status = 'published' and exists (
    select 1 from public.properties
    where properties.id = rental_options.property_id
      and properties.status = 'published'
  )) or public.is_admin()
);
create policy "Admins manage rental options"
on public.rental_options for all to authenticated
using (public.is_admin()) with check (public.is_admin());

create policy "Public reads property support data" on public.property_aliases for select to anon, authenticated using (true);
create policy "Public reads facilities" on public.facilities for select to anon, authenticated using (true);
create policy "Public reads property facilities" on public.property_facilities for select to anon, authenticated using (true);
create policy "Public reads amenities" on public.amenities for select to anon, authenticated using (true);
create policy "Public reads rental option amenities" on public.rental_option_amenities for select to anon, authenticated using (true);
create policy "Public reads nearby places" on public.property_nearby_places for select to anon, authenticated using (true);
create policy "Admins manage aliases" on public.property_aliases for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage facilities" on public.facilities for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage property facilities" on public.property_facilities for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage amenities" on public.amenities for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage option amenities" on public.rental_option_amenities for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage nearby places" on public.property_nearby_places for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Public reads published pages" on public.content_pages for select to anon, authenticated using (status = 'published' or public.is_admin());
create policy "Public reads visible sections" on public.content_sections for select to anon, authenticated using (
  (
    is_visible
    and exists (
      select 1 from public.content_pages
      where content_pages.id = content_sections.page_id
        and content_pages.status = 'published'
    )
  ) or public.is_admin()
);
create policy "Admins manage content pages" on public.content_pages for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage content sections" on public.content_sections for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Public reads media metadata" on public.media_assets for select to anon, authenticated using (
  public.is_admin()
  or exists (
    select 1 from public.properties
    where properties.id = media_assets.property_id
      and properties.status = 'published'
  )
  or exists (
    select 1
    from public.rental_options
    join public.properties on properties.id = rental_options.property_id
    where rental_options.id = media_assets.rental_option_id
      and rental_options.status = 'published'
      and properties.status = 'published'
  )
  or exists (
    select 1
    from public.content_sections
    join public.content_pages on content_pages.id = content_sections.page_id
    where content_sections.id = media_assets.content_section_id
      and content_sections.is_visible
      and content_pages.status = 'published'
  )
);
create policy "Admins manage media metadata" on public.media_assets for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Anyone can submit an enquiry"
on public.enquiries for insert to anon, authenticated
with check (status = 'new' and assigned_to is null);
create policy "Admins read enquiries" on public.enquiries for select to authenticated using (public.is_admin());
create policy "Admins update enquiries" on public.enquiries for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage enquiry notes" on public.enquiry_notes for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Public reads site settings" on public.site_settings for select to anon, authenticated using (true);
create policy "Public reads social links" on public.social_links for select to anon, authenticated using (is_visible or public.is_admin());
create policy "Admins manage site settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage social links" on public.social_links for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "Public reads visible faqs" on public.faqs for select to anon, authenticated using (is_visible or public.is_admin());
create policy "Public reads visible testimonials" on public.testimonials for select to anon, authenticated using (is_visible or public.is_admin());
create policy "Public reads visible team" on public.team_members for select to anon, authenticated using (is_visible or public.is_admin());
create policy "Public reads visible services" on public.services for select to anon, authenticated using (is_visible or public.is_admin());
create policy "Public reads service steps" on public.service_steps for select to anon, authenticated using (true);
create policy "Public reads published posts" on public.bulletin_posts for select to anon, authenticated using (status = 'published' or public.is_admin());
create policy "Admins manage faqs" on public.faqs for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage testimonials" on public.testimonials for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage team" on public.team_members for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage services" on public.services for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage service steps" on public.service_steps for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage posts" on public.bulletin_posts for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "Admins read audit logs" on public.audit_logs for select to authenticated using (public.is_admin());
create policy "Admins create audit logs" on public.audit_logs for insert to authenticated with check (public.is_admin());

revoke all on all tables in schema public from anon, authenticated;
grant select on public.properties, public.property_aliases, public.facilities,
  public.property_facilities, public.rental_options, public.amenities,
  public.rental_option_amenities, public.property_nearby_places,
  public.content_pages, public.content_sections, public.media_assets,
  public.site_settings, public.social_links, public.faqs, public.testimonials,
  public.team_members, public.services, public.service_steps, public.bulletin_posts
to anon, authenticated;
grant insert on public.enquiries to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-media',
  'listing-media',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Admins upload listing media"
on storage.objects for insert to authenticated
with check (bucket_id = 'listing-media' and public.is_admin());
create policy "Admins update listing media"
on storage.objects for update to authenticated
using (bucket_id = 'listing-media' and public.is_admin())
with check (bucket_id = 'listing-media' and public.is_admin());
create policy "Admins delete listing media"
on storage.objects for delete to authenticated
using (bucket_id = 'listing-media' and public.is_admin());

insert into public.site_settings (
  id, company_email, tenant_phone, tenant_whatsapp, landlord_whatsapp, company_address
) values (
  true,
  'hello.rentdeer@gmail.com',
  '+6019 252 3804',
  '+6019 343 3804',
  '+6011 3928 2804',
  'S-036 & S-042, Seasons Square, Jalan PJU 10/3C, Damansara Damai, 47380 Petaling Jaya, Selangor, Malaysia'
) on conflict (id) do nothing;

insert into public.social_links (platform, url, sort_order) values
  ('Instagram', 'https://www.instagram.com/rent.deer/', 1),
  ('Facebook', 'https://www.facebook.com/people/Rentdeercom/61557446064027/', 2),
  ('TikTok', 'https://www.tiktok.com/@rentdeer.com', 3),
  ('YouTube', 'https://www.youtube.com/@RentDeer_Channel', 4),
  ('Threads', 'https://www.threads.com/@rent.deer', 5)
on conflict (platform) do nothing;

insert into public.content_pages (slug, name, route, description, status) values
  ('home', 'Homepage', '/', 'Hero, discovery search, stories, statistics and reviews.', 'published'),
  ('about', 'About Us', '/about', 'Company story, parallax gallery, journey and team.', 'published'),
  ('services', 'Services', '/services', 'Tenant, landlord and property-agent service flows.', 'published'),
  ('faq', 'FAQ', '/faq', 'Frequently asked questions and renter guidance.', 'published'),
  ('bulletin', 'Bulletin', '/bulletin', 'Rental guides, company updates and community notes.', 'draft'),
  ('contact', 'Contact Us', '/contact', 'Contact details, enquiry form copy and response message.', 'published')
on conflict (slug) do nothing;

with section_seed(page_slug, section_key, name, description, sort_order) as (
  values
    ('home', 'hero', 'Hero & search', 'Headline, supporting copy and hero background.', 0),
    ('home', 'story', 'Story scroll', 'Sticky images and the RentDeer story cards.', 1),
    ('home', 'statistics', 'Inside RentDeer', 'Background image and company statistics.', 2),
    ('home', 'reviews', 'Reviews', 'Tenant and landlord testimonials.', 3),
    ('about', 'hero', 'About hero', 'Page headline and introduction.', 0),
    ('about', 'parallax-gallery', 'Parallax gallery', 'Bento gallery images, order and display sizes.', 1),
    ('about', 'belief-feature', 'Striving For Change feature', 'The centered RentDeer message and background feature image.', 2),
    ('about', 'journey', 'Our journey', 'Company milestones and supporting copy.', 3),
    ('about', 'team', 'Our team', 'Leadership profiles, roles and biographies.', 4),
    ('services', 'hero', 'Services hero', 'Headline, introduction and overview statistic.', 0),
    ('services', 'services', 'Service cards', 'Service names, descriptions and destinations.', 1),
    ('services', 'flows', 'Role-based flows', 'Tenant, landlord and agent process steps.', 2),
    ('faq', 'hero', 'FAQ hero', 'Page introduction and supporting text.', 0),
    ('faq', 'questions', 'Questions & answers', 'Manage question order, answers and visibility.', 1),
    ('bulletin', 'hero', 'Bulletin hero', 'Page introduction and featured story.', 0),
    ('bulletin', 'articles', 'Articles', 'Published guides and community updates.', 1),
    ('contact', 'hero', 'Contact hero', 'Headline and enquiry introduction.', 0),
    ('contact', 'contact-details', 'Contact details', 'Email, phone, WhatsApp and office address.', 1),
    ('contact', 'form', 'Enquiry form', 'Form labels, topics and confirmation message.', 2)
)
insert into public.content_sections (
  page_id,
  section_key,
  name,
  content,
  sort_order
)
select
  pages.id,
  seed.section_key,
  seed.name,
  jsonb_build_object(
    'eyebrow', seed.name,
    'heading', seed.name,
    'description', seed.description
  ),
  seed.sort_order
from section_seed seed
join public.content_pages pages on pages.slug = seed.page_slug
on conflict (page_id, section_key) do nothing;
