const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

function load(relative, overrides = {}) {
  const filename = path.resolve(__dirname, relative);
  const compiled = new Module(filename, module);
  compiled.filename = filename;
  compiled.paths = module.paths;
  compiled.require = (name) =>
    Object.hasOwn(overrides, name)
      ? overrides[name]
      : name.startsWith(".")
        ? load(
            path.relative(
              __dirname,
              path.resolve(path.dirname(filename), `${name}.ts`),
            ),
            overrides,
          )
        : require(name);
  compiled._compile(
    ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText,
    filename,
  );
  return compiled.exports;
}
const search = load("../src/lib/property-search.ts");
const rental = load("../src/lib/rental-options.ts");
const fixture = Array.from({ length: 1000 }, (_, index) => ({
  id: String(index),
  slug: `property-${index}`,
  title: `Residence ${index}`,
  location: "Sentul, Kuala Lumpur",
  city: "Kuala Lumpur",
  area: index % 2 ? "Sentul" : "Cheras",
  propertyType: "Condominium",
  status: "published",
  units: [
    {
      title: "Master room",
      roomType: "Master Bedroom",
      monthlyRent: 800,
      furnished: true,
      status: "published",
    },
  ],
}));
const { listProperties } = load("../src/lib/property-repository.ts", {
  "server-only": {},
  "@/lib/env": { hasSupabaseEnv: () => false },
  "@/lib/listing-schema": {},
  "@/lib/supabase/server": {},
  "@/lib/properties": { properties: fixture },
  "@/lib/property-search": search,
  "@/lib/rental-options": rental,
});

test("1000 listings are split into 112 pages with nine unique properties per full page", async () => {
  const slugs = [];
  for (let page = 1; page <= 112; page++) {
    const result = await listProperties({ page, pageSize: 9 });
    assert.equal(result.total, 1000);
    assert.equal(result.data.length, page === 112 ? 1 : 9);
    slugs.push(...result.data.map((property) => property.slug));
  }
  assert.equal(new Set(slugs).size, 1000);
});

test("location filters apply before the page limit, and out-of-range pages recover", async () => {
  const result = await listProperties({ city: "Sentul", pageSize: 9, page: 2 });
  assert.equal(result.total, 500);
  assert.equal(result.data.length, 9);
  assert.ok(result.data.every((property) => property.area === "Sentul"));
  const last = await listProperties({ city: "Sentul", pageSize: 9, page: 999 });
  assert.equal(last.page, 56);
  assert.equal(last.data.length, 5);
  const empty = await listProperties({ city: "Kepong", pageSize: 9, page: 99 });
  assert.equal(empty.page, 1);
  assert.equal(empty.total, 0);
  assert.equal(empty.data.length, 0);
});

test("combined room, budget and furnishing filters match a single published option", () => {
  const property = {
    ...fixture[0],
    units: [
      {
        title: "Master room",
        roomType: "Master Bedroom",
        monthlyRent: 1500,
        furnished: false,
        status: "published",
      },
      {
        title: "Single room",
        roomType: "Single Bedroom",
        monthlyRent: 800,
        furnished: true,
        status: "published",
      },
      {
        title: "Draft room",
        roomType: "Master Bedroom",
        monthlyRent: 800,
        furnished: true,
        status: "draft",
      },
    ],
  };
  const filters = {
    ...search.defaultPropertySearch,
    type: "Master Bedroom",
    minPrice: 700,
    maxPrice: 899,
    furnishedOnly: true,
  };
  assert.equal(search.filterFallbackProperties([property], filters).length, 0);
  property.units.push({
    title: "Master room",
    roomType: "Master Bedroom",
    monthlyRent: 800,
    furnished: true,
    status: "published",
  });
  assert.equal(search.filterFallbackProperties([property], filters).length, 1);
});

test("filter URLs retain all filters when paging, and support homepage area links", () => {
  const filters = {
    query: "Master room",
    city: "Sentul",
    type: "Master Bedroom",
    minPrice: 700,
    maxPrice: 899,
    furnishedOnly: true,
  };
  const params = search.propertySearchParams(filters, 2);
  assert.equal(params.get("page"), "2");
  assert.deepEqual(search.readPropertySearch(params), filters);
  assert.equal(
    search.readPropertySearch(new URLSearchParams("area=seri-kembangan")).city,
    "Seri Kembangan",
  );
  assert.equal(search.propertySearchParams(filters).has("page"), false);
});

test("invalid page sizes, budgets and room types cannot produce broken requests", () => {
  for (const value of ["oops", "Infinity", "-1", "2.5", 0, NaN])
    assert.equal(search.positiveInteger(value, 9, 100), 9);
  assert.equal(search.positiveInteger(1000, 9, 100), 100);
  assert.deepEqual(
    search.readPropertySearch(
      new URLSearchParams("budget=899-700&type=constructor"),
    ),
    search.defaultPropertySearch,
  );
  assert.equal(
    search.safePropertyKeyword("Sentul%,title.eq.injected"),
    "Sentul  title eq injected",
  );
});

test("pagination controls stay compact at the beginning, middle and end of a large catalogue", () => {
  assert.deepEqual(search.paginationItems(1, 2), [1, 2]);
  assert.deepEqual(search.paginationItems(1, 112), [1, 2, 3, "end-gap", 112]);
  assert.deepEqual(search.paginationItems(56, 112), [
    1,
    "start-gap",
    56,
    "end-gap",
    112,
  ]);
  assert.deepEqual(search.paginationItems(112, 112), [
    1,
    "start-gap",
    110,
    111,
    112,
  ]);
});

test("database requests filter published options and count results before requesting only the selected range", async () => {
  const { PostgrestClient } = require("@supabase/postgrest-js");
  let requestUrl;
  const client = new PostgrestClient("https://example.supabase.co/rest/v1", {
    fetch: async (url) => {
      requestUrl = new URL(url);
      return new Response("[]", {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Content-Range": "9-17/1000",
        },
      });
    },
  });
  const repository = load("../src/lib/property-repository.ts", {
    "server-only": {},
    "@/lib/env": { hasSupabaseEnv: () => true },
    "@/lib/listing-schema": {},
    "@/lib/supabase/server": { createClient: async () => client },
    "@/lib/properties": { properties: fixture },
    "@/lib/property-search": search,
    "@/lib/rental-options": rental,
  });
  const result = await repository.listProperties({
    city: "Sentul",
    query: "master",
    type: "Master Bedroom",
    minPrice: 700,
    maxPrice: 899,
    furnishedOnly: true,
    page: 2,
    pageSize: 9,
  });
  assert.equal(result.total, 1000);
  assert.equal(requestUrl.searchParams.get("limit"), "9");
  assert.equal(requestUrl.searchParams.get("offset"), "9");
  assert.equal(requestUrl.searchParams.get("status"), "eq.published");
  assert.equal(
    requestUrl.searchParams.get("matching_rentals.status"),
    "eq.published",
  );
  assert.equal(
    requestUrl.searchParams.get("matching_rentals.room_type"),
    "eq.master_bedroom",
  );
  assert.deepEqual(
    requestUrl.searchParams.getAll("matching_rentals.price_min"),
    ["gte.700", "lte.899"],
  );
  assert.equal(
    requestUrl.searchParams.get("matching_rentals.furnished"),
    "eq.true",
  );
  assert.equal(
    requestUrl.searchParams.get("rental_options.status"),
    "eq.published",
  );
  assert.equal(
    requestUrl.searchParams.get("search_rentals.status"),
    "eq.published",
  );
  assert.equal(requestUrl.searchParams.getAll("or").length, 2);
  assert.equal(
    requestUrl.searchParams.get("order"),
    "is_featured.desc,updated_at.desc,id.asc",
  );
});
