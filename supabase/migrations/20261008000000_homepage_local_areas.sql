-- Existing databases also provision this section on the first authenticated
-- homepage editor visit. Keep visibility in content so public RLS can read it.
insert into public.content_sections (page_id, section_key, name, content, sort_order)
select id, 'local-areas', 'Local areas', jsonb_build_object(
  'eyebrow', 'RentDeer in your area',
  'heading', 'Serving your local area.',
  'description', 'Explore managed rooms and homes close to the places that matter to you.',
  'localAreas', '[]'::jsonb,
  'localAreasEnabled', true
), 2
from public.content_pages where slug = 'home'
on conflict (page_id, section_key) do nothing;
