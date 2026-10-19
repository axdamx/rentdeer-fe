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
const { propertyLocation } = load("../src/lib/property-location.ts");

test("listing maps use the saved address and coordinates, including zero, with no fabricated pin", () => {
  const property = {
    addressLine: "  12 Jalan Test  ",
    postcode: "50000",
    city: "Kuala Lumpur",
    state: "Wilayah Persekutuan",
    location: "Kuala Lumpur",
    latitude: 3.14,
    longitude: 101.69,
  };
  assert.deepEqual(propertyLocation(property), {
    address: "12 Jalan Test, 50000, Kuala Lumpur, Wilayah Persekutuan",
    coordinates: [3.14, 101.69],
  });
  assert.deepEqual(
    propertyLocation({ ...property, latitude: 0, longitude: 0 }).coordinates,
    [0, 0],
  );
  for (const values of [
    { latitude: undefined },
    { longitude: undefined },
    { latitude: NaN },
    { longitude: Infinity },
    { latitude: 91 },
    { longitude: -181 },
  ]) {
    assert.equal(
      propertyLocation({ ...property, ...values }).coordinates,
      null,
    );
  }
});

const listingSchema = load("../src/lib/listing-schema.ts", {
  "@/lib/listing-reference-data": { transitStationById: new Map() },
  "@/lib/local-areas": load("../src/lib/local-areas.ts"),
});
const { defaultPropertyDetails, resolvePropertyDetails } = load(
  "../src/lib/property-details.ts",
);

test("older empty listing details recover original content and retain the labelled sample review", () => {
  for (const empty of [undefined, null, [], [null, " ", 42]]) {
    const details = resolvePropertyDetails({
      highlights: empty,
      houseRules: empty,
      rentalTerms: empty,
      bookingSteps: empty,
      availability: " ",
      responseTime: null,
    });
    assert.deepEqual(details, defaultPropertyDetails);
    assert.equal(details.review.isDemo, true);
  }
  const details = resolvePropertyDetails({
    highlights: ["  Walk to the station  ", null, ""],
    houseRules: ["Quiet hours after 10pm"],
    rentalTerms: [{ label: " Deposit ", value: " Two months ", ignored: true }],
    bookingSteps: ["Contact the property manager"],
    availability: " Available in November ",
    responseTime: " Replies within a day ",
  });
  assert.deepEqual(details.highlights, ["Walk to the station"]);
  assert.deepEqual(details.rentalTerms, [
    { label: "Deposit", value: "Two months" },
  ]);
  assert.equal(details.availability, "Available in November");
});

test("listing information rejects blank rows and incomplete rental terms", () => {
  const input = {
    slug: "test-residence",
    title: "Test Residence",
    propertyType: "Condominium",
    managedBy: "RentDeer",
    city: "Kuala Lumpur",
    status: "draft",
    rentalOptions: [
      {
        slug: "master-room",
        title: "Master room",
        roomType: "master_bedroom",
        priceMin: 700,
        bathroomType: "private",
        availability: "available",
        status: "draft",
      },
    ],
  };
  assert.equal(
    listingSchema.propertyInputSchema.safeParse(input).success,
    true,
  );
  for (const invalid of [
    { highlights: [" "] },
    { houseRules: [] },
    { rentalTerms: [{ label: "Deposit", value: "" }] },
    { bookingSteps: [""] },
    { availabilityLabel: "" },
    { responseTime: " " },
  ]) {
    assert.equal(
      listingSchema.propertyInputSchema.safeParse({ ...input, ...invalid })
        .success,
      false,
    );
  }
});

test("360 tour URLs accept hosted videos, trim whitespace and reject unsafe protocols", () => {
  const schema = listingSchema.virtualTourUrlSchema;
  for (const url of [
    "https://media.example.com/room.mp4",
    "https://media.example.com/room.webm?token=example",
    "http://localhost:3000/tour.mp4",
    "",
    undefined,
  ]) {
    assert.equal(schema.safeParse(url).success, true);
  }
  assert.equal(
    schema.parse("  https://media.example.com/room.mp4  "),
    "https://media.example.com/room.mp4",
  );
  assert.equal(schema.parse("   "), "");
  for (const url of [
    "bad URL",
    "/tour.mp4",
    "javascript:alert(1)",
    "data:video/mp4;base64,AAA",
    "ftp://example.com/tour.mp4",
  ]) {
    assert.equal(schema.safeParse(url).success, false);
  }
});

test("property information and 360 tours survive validation, saving and reopening", async () => {
  const { PostgrestClient } = require("@supabase/postgrest-js");
  const propertyId = "00000000-0000-4000-8000-000000000001";
  const roomId = "00000000-0000-4000-8000-000000000002";
  const otherRoomId = "00000000-0000-4000-8000-000000000003";
  let row = { id: propertyId, slug: "test-residence", rental_options: [] };
  const client = new PostgrestClient("https://example.supabase.co/rest/v1", {
    fetch: async (url, init) => {
      const table = new URL(url).pathname.split("/").pop();
      const method = init?.method ?? "GET";
      let result;
      if (table === "properties") {
        if (method === "PATCH") row = { ...row, ...JSON.parse(init.body) };
        result = row;
      } else if (table === "rental_options") {
        if (method === "POST") row.rental_options = JSON.parse(init.body);
        result = row.rental_options.map(({ id }) => ({ id }));
      } else {
        result = [];
      }
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    },
  });
  const db = load("../src/lib/property-repository.ts", {
    ...overrides,
    "@/lib/listing-schema": listingSchema,
    "@/lib/env": { hasSupabaseEnv: () => true },
    "@/lib/supabase/server": { createClient: async () => client },
  });
  let input = {
    id: propertyId,
    slug: "test-residence",
    title: "Test Residence",
    propertyType: "Condominium",
    managedBy: "RentDeer",
    city: "Kuala Lumpur",
    status: "published",
    latitude: 3.14,
    longitude: 101.69,
    highlights: ["Near Sentul station"],
    houseRules: ["Quiet hours after 10pm"],
    rentalTerms: [{ label: "Deposit", value: "Two months" }],
    bookingSteps: ["Contact the manager", "Arrange a viewing"],
    availabilityLabel: "Rooms available in November",
    responseTime: "Replies within a day",
    rentalOptions: [roomId, otherRoomId].map((id, index) => ({
      id,
      slug: `room-${index}`,
      title: `Room ${index}`,
      roomType: "master_bedroom",
      priceMin: 700,
      bathroomType: "private",
      availability: "available",
      status: "published",
      virtualTourUrl: index ? "https://media.example.com/other.mp4" : "",
    })),
  };
  for (const url of [
    "  https://media.example.com/tour.mp4  ",
    "https://media.example.com/replacement.webm",
    "",
  ]) {
    input.rentalOptions[0].virtualTourUrl = url;
    const parsed = listingSchema.propertyInputSchema.parse(input);
    await db.saveProperty(parsed, "admin-id");
    assert.equal(row.rental_options[0].virtual_tour_url, url.trim() || null);
    const publicProperty = await db.getPropertyBySlug(input.slug);
    assert.deepEqual(
      propertyLocation(publicProperty).coordinates,
      [3.14, 101.69],
    );
    assert.equal(
      publicProperty.units[0].virtualTour?.source,
      url.trim() || undefined,
    );
    assert.equal(
      publicProperty.units[1].virtualTour.source,
      "https://media.example.com/other.mp4",
    );
    const reopened = db.propertyToInput(publicProperty);
    for (const [field, column] of [
      ["highlights", "highlights"],
      ["houseRules", "house_rules"],
      ["rentalTerms", "rental_terms"],
      ["bookingSteps", "booking_steps"],
      ["availabilityLabel", "availability_label"],
      ["responseTime", "response_time"],
    ]) {
      assert.deepEqual(row[column], input[field]);
      assert.deepEqual(reopened[field], input[field]);
    }
    assert.equal(publicProperty.details.review.isDemo, true);
    assert.equal(reopened.latitude, 3.14);
    assert.equal(reopened.longitude, 101.69);
    assert.equal(reopened.rentalOptions[0].virtualTourUrl, url.trim());
    assert.equal(
      reopened.rentalOptions[1].virtualTourUrl,
      "https://media.example.com/other.mp4",
    );
    input = reopened;
    input.highlights = ["Updated property highlight"];
    input.rentalTerms = [{ label: "Parking", value: "Ask about availability" }];
  }
});

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
