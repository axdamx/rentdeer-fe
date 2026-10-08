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

const units = Array.from({ length: 1000 }, (_, index) => ({
  slug: `room-${index}`,
  title: `Room ${index}`,
  roomType: index % 2 ? "Master Bedroom" : "Medium Bedroom",
  monthlyRent: 700 + index,
  maximumRent: 900 + index,
  furnished: true,
  available: index % 2 === 1,
  availability: index % 2 ? "available" : "occupied",
  status: "published",
}));
const property = {
  id: "property-id",
  slug: "test-residence",
  title: "Test Residence",
  location: "Sentul, Kuala Lumpur",
  city: "Kuala Lumpur",
  status: "published",
  units,
};
const overrides = {
  "server-only": {},
  "@/lib/env": { hasSupabaseEnv: () => false },
  "@/lib/listing-schema": {},
  "@/lib/supabase/server": {},
  "@/lib/properties": { properties: [property] },
  "@/lib/property-search": search,
  "@/lib/rental-options": rental,
};
const repository = load("../src/lib/property-repository.ts", overrides);

test("1000 rental options paginate without duplicates or omissions", async () => {
  const seen = [];
  for (let page = 1; page <= 112; page++) {
    const result = await repository.listRentalOptions(property.slug, {
      type: "All",
      availability: "all",
      page,
    });
    assert.equal(result.total, 1000);
    assert.equal(result.data.length, page === 112 ? 1 : 9);
    seen.push(...result.data.map((unit) => unit.slug));
  }
  assert.equal(new Set(seen).size, 1000);
});

test("room type and availability filter the full catalogue before pagination and exclude draft rooms", () => {
  const result = rental.paginateRentalOptions(
    [...units, { ...units[1], slug: "draft", status: "draft" }],
    { type: "Master Bedroom", availability: "available", page: 2 },
  );
  assert.equal(result.total, 500);
  assert.equal(result.data.length, 9);
  assert.equal(result.data[0].slug, "room-19");
  assert.ok(
    result.data.every(
      (unit) => unit.roomType === "Master Bedroom" && unit.available,
    ),
  );
  assert.equal(
    rental.paginateRentalOptions(units, {
      type: "Medium Bedroom",
      availability: "available",
      page: 99,
    }).total,
    0,
  );
  assert.deepEqual(
    rental.readRentalOptionFilters(
      new URLSearchParams(
        "roomType=constructor&availability=oops&optionsPage=nope",
      ),
    ),
    { type: "All", availability: "all", page: 1 },
  );
});

test("the detail overview returns aggregate figures without returning all rental options", async () => {
  const result = await repository.getPropertyOverviewBySlug(property.slug);
  assert.equal(result.total, 1000);
  assert.equal(result.available, 500);
  assert.equal(result.startingPrice, 700);
  assert.equal(result.property.units.length, 0);
});

test("enquiry context validates the exact published property and room pair", async () => {
  assert.equal(
    await repository.getEnquiryContext("missing", units[0].slug),
    null,
  );
  assert.equal(
    await repository.getEnquiryContext(
      property.slug,
      "another-properties-room",
    ),
    null,
  );
  units[0].status = "draft";
  assert.equal(
    await repository.getEnquiryContext(property.slug, units[0].slug),
    null,
  );
  units[0].status = "published";
  const context = await repository.getEnquiryContext(
    property.slug,
    units[1].slug,
  );
  assert.equal(context.unitTitle, "Room 1");
  assert.equal(context.propertyTitle, property.title);
  assert.equal(context.price, "RM701 – RM901");
  const message = rental.enquiryMessage(context);
  assert.ok(message.includes("Room 1 at Test Residence"));
  assert.ok(message.includes("Location: Sentul, Kuala Lumpur"));
  assert.ok(message.includes("Monthly rent: RM701 – RM901 / month"));
  assert.ok(message.includes("Availability: Available now"));
  assert.ok(message.includes("viewing times"));
  assert.ok(!message.includes("undefined"));
});

test("property-only enquiry links retain context and produce a complete message", async () => {
  const context = await repository.getEnquiryContext(property.slug);
  assert.equal(context.rentalOptionSlug, "");
  assert.ok(!rental.enquiryMessage(context).includes("undefined"));
  assert.equal(
    rental.enquiryHref("test-residence", "room-a"),
    "/contact?property=test-residence&unit=room-a#enquiry-form",
  );
});

test("database rental queries request nine matching published rooms from only the selected property", async () => {
  const { PostgrestClient } = require("@supabase/postgrest-js");
  const requests = [];
  const client = new PostgrestClient("https://example.supabase.co/rest/v1", {
    fetch: async (url) => {
      const parsed = new URL(url);
      requests.push(parsed);
      return parsed.pathname.endsWith("/properties")
        ? new Response(JSON.stringify({ id: property.id, media_assets: [] }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
        : new Response("[]", {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Content-Range": "9-17/500",
            },
          });
    },
  });
  const db = load("../src/lib/property-repository.ts", {
    ...overrides,
    "@/lib/env": { hasSupabaseEnv: () => true },
    "@/lib/supabase/server": { createClient: async () => client },
  });
  const result = await db.listRentalOptions(property.slug, {
    type: "Master Bedroom",
    availability: "available",
    page: 2,
  });
  assert.equal(result.total, 500);
  assert.equal(requests.length, 2);
  const params = requests[1].searchParams;
  assert.equal(params.get("property_id"), "eq.property-id");
  assert.equal(params.get("status"), "eq.published");
  assert.equal(params.get("room_type"), "eq.master_bedroom");
  assert.equal(params.get("availability"), "eq.available");
  assert.equal(params.get("offset"), "9");
  assert.equal(params.get("limit"), "9");
  assert.equal(params.get("order"), "sort_order.asc,id.asc");
});
