-- Reference data used by the listing editor.
insert into public.facilities (slug, name) values
  ('swimming-pool', 'Swimming pool'),
  ('wading-pool', 'Wading pool'),
  ('gym-centre', 'Gym centre'),
  ('bbq-area', 'BBQ area'),
  ('surau', 'Surau'),
  ('24-hour-security', '24-hour security'),
  ('playground', 'Playground'),
  ('multi-purpose-hall', 'Multi-purpose hall'),
  ('tennis-court', 'Tennis court'),
  ('basketball-court', 'Basketball court')
on conflict (slug) do update set name = excluded.name;

insert into public.amenities (slug, name) values
  ('queen-bed', 'Queen bed'),
  ('single-bed', 'Single bed'),
  ('super-single-bed', 'Super single bed'),
  ('fully-furnished', 'Fully furnished'),
  ('private-bathroom', 'Private bathroom'),
  ('shared-bathroom', 'Shared bathroom'),
  ('balcony', 'Balcony'),
  ('washing-machine', 'Washing machine'),
  ('dryer', 'Dryer'),
  ('kitchen', 'Kitchen')
on conflict (slug) do update set name = excluded.name;

insert into public.content_pages (slug, name, route, description, status) values
  ('home', 'Homepage', '/', 'Hero, discovery search, stories, statistics and reviews.', 'published'),
  ('about', 'About Us', '/about', 'Company story, parallax gallery, journey and team.', 'published'),
  ('services', 'Services', '/services', 'Tenant, landlord and property-agent service flows.', 'published'),
  ('faq', 'FAQ', '/faq', 'Frequently asked questions and renter guidance.', 'published'),
  ('bulletin', 'Bulletin', '/bulletin', 'Rental guides, company updates and community notes.', 'draft'),
  ('contact', 'Contact Us', '/contact', 'Contact details, enquiry form copy and response message.', 'published')
on conflict (slug) do update set
  name = excluded.name,
  route = excluded.route,
  description = excluded.description;

insert into public.content_sections (page_id, section_key, name, content, sort_order)
select id, 'hero', 'Hero', '{"eyebrow":"RentDeer","heading":"A better rental experience.","description":"Update this content from the admin workspace."}'::jsonb, 0
from public.content_pages
on conflict (page_id, section_key) do nothing;
