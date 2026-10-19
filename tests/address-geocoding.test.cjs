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
    Object.hasOwn(overrides, name) ? overrides[name] : require(name);
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

const geocoding = load("../src/lib/address-geocoding.ts");
const feature = (properties = {}, coordinates = [101.69, 3.14]) => ({
  geometry: { type: "Point", coordinates },
  properties: {
    name: "Example Residence",
    street: "Jalan Example",
    city: "Kuala Lumpur",
    country: "Malaysia",
    countrycode: "MY",
    osm_key: "building",
    osm_value: "apartments",
    ...properties,
  },
});

test("address search restricts Malaysia, caches queries and maps longitude/latitude correctly", async (context) => {
  const requests = [];
  context.mock.method(globalThis, "fetch", async (url, options) => {
    requests.push({ url, options });
    return Response.json({
      features: [
        feature(),
        feature(),
        feature({ countrycode: "SG" }),
        feature({ osm_key: "place", osm_value: "city" }),
        feature({ osm_key: "highway", osm_value: "bus_stop", type: "house" }),
        feature({
          osm_key: "landuse",
          osm_value: "recreation_ground",
          type: "other",
        }),
      ],
    });
  });
  const results = await geocoding.lookupAddress(
    "  Example Residence, Jalan Example, Kuala Lumpur  ",
  );
  assert.equal(results.length, 1);
  assert.equal(results[0].latitude, 3.14);
  assert.equal(results[0].longitude, 101.69);
  assert.ok(results[0].label.includes("Jalan Example"));
  assert.equal(
    requests[0].url.searchParams.get("q"),
    "Example Residence, Jalan Example, Kuala Lumpur",
  );
  assert.equal(requests[0].url.searchParams.get("countrycode"), "MY");
  assert.equal(requests[0].url.searchParams.get("limit"), "5");
  assert.equal(requests[0].options.next.revalidate, 86400);
});

test("empty results, invalid coordinates and provider outages never produce a fabricated pin", async (context) => {
  let response = { features: [] };
  const stub = context.mock.method(globalThis, "fetch", async () =>
    Response.json(response),
  );
  assert.deepEqual(await geocoding.lookupAddress("Example Residence"), []);
  response = { features: [feature({}, [101.69, 91])] };
  await assert.rejects(
    geocoding.lookupAddress("Example Residence"),
    /invalid response/,
  );
  stub.mock.mockImplementation(
    async () => new Response("Unavailable", { status: 503 }),
  );
  await assert.rejects(
    geocoding.lookupAddress("Example Residence"),
    /unavailable/,
  );
});

test("address API requires an administrator and validates input before contacting the provider", async () => {
  let admin = null;
  let calls = 0;
  const route = load("../src/app/api/admin/geocode/route.ts", {
    "@/lib/auth": { getAdminUser: async () => admin },
    "@/lib/address-geocoding": {
      ...geocoding,
      lookupAddress: async () => {
        calls++;
        return [
          { label: "Example Residence", latitude: 3.14, longitude: 101.69 },
        ];
      },
    },
  });
  const request = (body) =>
    new Request("http://localhost/api/admin/geocode", {
      method: "POST",
      body: JSON.stringify(body),
    });
  assert.equal(
    (await route.POST(request({ address: "Example Residence" }))).status,
    401,
  );
  assert.equal(calls, 0);
  admin = { id: "admin" };
  assert.equal((await route.POST(request({ address: "" }))).status, 400);
  assert.equal(calls, 0);
  const response = await route.POST(request({ address: "Example Residence" }));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data[0].latitude, 3.14);
  assert.equal(calls, 1);
});
