alter table public.properties
add column if not exists transit_connections jsonb not null default '[]'::jsonb;

alter table public.properties
drop constraint if exists properties_transit_connections_array_check;

alter table public.properties
add constraint properties_transit_connections_array_check
check (jsonb_typeof(transit_connections) = 'array');

comment on column public.properties.transit_connections is
'Selected station IDs and access details. Station display metadata is maintained in src/data/listing-reference-data.json.';
