insert into public.content_sections as sections (
  page_id,
  section_key,
  name,
  content,
  sort_order
)
select
  id,
  'belief-feature',
  'Striving For Change feature',
  jsonb_build_object(
    'eyebrow', 'RentDeer',
    'heading', 'Striving For Change',
    'description', 'The RentDeer team striving to improve rental living'
  ),
  2
from public.content_pages
where slug = 'about'
on conflict (page_id, section_key) do update set
  name = excluded.name,
  content = case
    when sections.content->>'heading' = 'Striving For Change feature'
      then excluded.content
    else sections.content
  end,
  sort_order = excluded.sort_order;

update public.content_sections sections
set sort_order = case sections.section_key
  when 'journey' then 3
  when 'team' then 4
  else sections.sort_order
end
from public.content_pages pages
where sections.page_id = pages.id
  and pages.slug = 'about'
  and sections.section_key in ('journey', 'team');

update public.content_sections sections
set content = jsonb_build_object(
  'eyebrow', 'Meet The Team',
  'heading', 'Behind The Vision',
  'description', 'With a focus on better living and smarter property solutions, our team continues to shape RentDeer''s journey and the future of rental living.',
  'teamMembers', jsonb_build_array(
    jsonb_build_object(
      'id', 'haziq',
      'name', 'Mr. Haziq',
      'title', 'CEO',
      'description', 'Helping shape RentDeer''s journey through better living and smarter property solutions.',
      'imageAssetId', null
    ),
    jsonb_build_object(
      'id', 'syafiq',
      'name', 'Mr. Syafiq',
      'title', 'CFO',
      'description', 'Building a stable and sustainable future for RentDeer''s tenants and property partners.',
      'imageAssetId', null
    )
  )
)
from public.content_pages pages
where sections.page_id = pages.id
  and pages.slug = 'about'
  and sections.section_key = 'team'
  and sections.content->>'heading' = 'Our team';

update public.content_sections sections
set content = sections.content || jsonb_build_object(
  'teamMembers', jsonb_build_array(
    jsonb_build_object(
      'id', 'haziq',
      'name', 'Mr. Haziq',
      'title', 'CEO',
      'description', 'Helping shape RentDeer''s journey through better living and smarter property solutions.',
      'imageAssetId', null
    ),
    jsonb_build_object(
      'id', 'syafiq',
      'name', 'Mr. Syafiq',
      'title', 'CFO',
      'description', 'Building a stable and sustainable future for RentDeer''s tenants and property partners.',
      'imageAssetId', null
    )
  )
)
from public.content_pages pages
where sections.page_id = pages.id
  and pages.slug = 'about'
  and sections.section_key = 'team'
  and not (sections.content ? 'teamMembers');
