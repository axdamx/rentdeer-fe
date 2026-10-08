# Supabase setup

## 1. Configure the application

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_PROJECT_ID`
- `NEXT_PUBLIC_SITE_URL`

Only the publishable key belongs in `NEXT_PUBLIC_*`. Never add a Supabase
secret key or service-role key to a public environment variable.

## 2. Apply the database schema

For a hosted project:

```bash
npx supabase login
npx supabase link --project-ref "$SUPABASE_PROJECT_ID"
npm run db:push
```

For local development, start a Docker-compatible runtime and run:

```bash
npm run db:start
npm run db:reset
```

The reset command applies the migration and `supabase/seed.sql`.

## 3. Create the first administrator

Supabase Dashboard → Authentication → Users → Add user. Use email/password and
mark the email as confirmed. A disabled `admin_profiles` row is created
automatically.

Activate the account in the Supabase SQL editor:

```sql
insert into public.admin_profiles (user_id, display_name, role, is_active)
select id, 'Your name', 'admin', true
from auth.users
where email = 'your-admin@example.com'
on conflict (user_id) do update set
  display_name = excluded.display_name,
  role = excluded.role,
  is_active = excluded.is_active;
```

Public signup remains disabled. Additional users can be created through the
Supabase Dashboard and activated in the same way.

## 4. Generate application types

After every schema change:

```bash
npm run db:types:linked
```

Use `npm run db:types` when the local Supabase stack is running.

## 5. Authentication URL settings

In Supabase Dashboard → Authentication → URL Configuration, set the production
site URL and add these redirect URLs:

- `http://localhost:3000/auth/callback`
- `https://your-production-domain/auth/callback`

## 6. Data workflow

- Create a main property under `/admin/listings/new`.
- Add one or more rental options/sub-listings inside it.
- Select facilities from the shared catalogue; add a custom value only when it
  is genuinely property-specific.
- In Location, use the current-location helper while physically at the property
  or enter verified latitude and longitude manually.
- Select one or more nearby rail stations and record the travel time and access
  mode. Connected published properties automatically appear in the public
  transport explorer on `/properties`.
- Save drafts while editing and publish when ready.
- Upload property images after the first save.
- Public pages only return published properties and published rental options.
- Archive listings instead of deleting them when historical enquiries exist.

Facility choices, rail-station labels, line colours and transit-map pin
positions are maintained in
`src/data/listing-reference-data.json`. Add a station there once, then admins
can connect any number of properties to it without entering map metadata.

## Homepage local areas

Open **Content → Homepage → Local areas**. The nine area/city labels are fixed
in `src/lib/local-areas.ts`; the Seri Kembangan card uses the requested Puchong
group without changing the development's stored city.

Each area automatically uses up to three published developments. Select up to
three sources to curate an area, choose a listing gallery photo, or upload an
image in **Section assets** and assign it as that area's override. Removing all
selected sources returns to automatic selection. Area visibility and the whole
section's Visible switch are saved separately from the fixed labels. Areas with
no published development are omitted. Generic listing fallback images display
brand placeholders until real development photos are uploaded.

The additive `20261008000000_homepage_local_areas.sql` migration seeds the
homepage section. Existing databases also create the same section on the first
authenticated visit to the homepage editor, without replacing saved settings.
Visibility is stored in `content.localAreasEnabled` so public RLS can still read
the section configuration when it is switched off.

Public cards use `/api/homepage/areas` and link to `/properties?area=<area-key>`.
Area sources, uploaded asset ownership, and the three-source limit are checked
on admin saves. Run `npm run test:areas` for matching and configuration checks.
