const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const test = require("node:test");
const ts = require("typescript");

// Compile the pure domain module using the project's existing TypeScript dependency.
const filename = path.resolve(__dirname, "../src/lib/local-areas.ts");
const domainModule = new Module(filename, module);
domainModule.filename = filename;
domainModule.paths = module.paths;
domainModule._compile(
  ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText,
  filename,
);
const {
  localAreas,
  resolveLocalArea,
  matchesPropertyLocation,
  localAreaInputSchema,
  localAreaListSchema,
  buildLocalAreaCards,
  validLocalAreaSources,
} = domainModule.exports;
const id = (number) =>
  `00000000-0000-4000-8000-${String(number).padStart(12, "0")}`;
const property = (number, area, city = "Kuala Lumpur") => ({
  id: id(number),
  title: `Development ${number}`,
  city,
  area,
  image: `/photos/${number}.jpg`,
  gallery: [`/photos/${number}.jpg`, `/photos/${number}-2.jpg`],
});
const config = (values = {}) =>
  localAreaInputSchema.parse({ areaKey: "sentul", ...values });

test("area matching uses exact area first, then legacy city; it never guesses substrings", () => {
  assert.equal(
    resolveLocalArea({ area: "  sEnTuL ", city: "Cheras" }).key,
    "sentul",
  );
  assert.equal(
    resolveLocalArea({ area: "Selangor", city: "Cheras" }).key,
    "cheras",
  );
  assert.equal(
    resolveLocalArea({ area: "Bandar Sri Permaisuri", city: "Kuala Lumpur" }),
    undefined,
  );
  assert.equal(
    resolveLocalArea({ area: "Sentul Heights", city: "Kuala Lumpur" }),
    undefined,
  );
});

test("regional and area filters exclude unrelated developments", () => {
  const sentul = property(1, "Sentul");
  const meta = property(2, "Seri Kembangan", "Seri Kembangan");
  const pj = property(3, "Kelana Jaya", "Petaling Jaya");
  assert.equal(matchesPropertyLocation(sentul, "sentul"), true);
  assert.equal(matchesPropertyLocation(pj, "Sentul"), false);
  assert.equal(matchesPropertyLocation(pj, "Kuala Lumpur"), false);
  assert.equal(matchesPropertyLocation(sentul, "Puchong"), false);
  assert.equal(matchesPropertyLocation(meta, "Puchong"), true);
  assert.equal(
    matchesPropertyLocation(property(4, "Semarak"), "Semarak"),
    true,
  );
});

test("all nine configured areas retain fixed labels; out-of-catalog developments do not create cards", () => {
  const cards = buildLocalAreaCards([
    ...localAreas.map((area, index) => property(index + 1, area.name)),
    property(20, "Unknown"),
  ]);
  assert.equal(cards.length, 9);
  assert.equal(
    cards.find((card) => card.key === "seri-kembangan").region,
    "Puchong",
  );
  assert.equal(cards.find((card) => card.key === "sentul").name, "Sentul");
});

test("schema rejects more than three sources, duplicate sources, duplicate areas and unknown areas", () => {
  assert.equal(
    localAreaInputSchema.safeParse({
      areaKey: "sentul",
      propertyIds: [1, 2, 3, 4].map(id),
    }).success,
    false,
  );
  assert.equal(
    localAreaInputSchema.safeParse({
      areaKey: "sentul",
      propertyIds: [id(1), id(1)],
    }).success,
    false,
  );
  assert.equal(
    localAreaListSchema.safeParse([config(), config()]).success,
    false,
  );
  assert.equal(
    localAreaInputSchema.safeParse({ areaKey: "unknown" }).success,
    false,
  );
});

test("admin validation rejects wrong-area, unpublished or unselected cover sources and foreign uploads", () => {
  const published = [property(1, "Sentul"), property(2, "Kepong")];
  assert.equal(
    validLocalAreaSources(config({ propertyIds: [id(1)] }), published, []),
    true,
  );
  assert.equal(
    validLocalAreaSources(config({ propertyIds: [id(2)] }), published, []),
    false,
  );
  assert.equal(
    validLocalAreaSources(config({ propertyIds: [id(3)] }), published, []),
    false,
  );
  assert.equal(
    validLocalAreaSources(
      config({ propertyIds: [id(1)], coverPropertyId: id(2) }),
      published,
      [],
    ),
    false,
  );
  assert.equal(
    validLocalAreaSources(config({ imageAssetId: id(5) }), published, []),
    false,
  );
  assert.equal(
    validLocalAreaSources(config({ imageAssetId: id(5) }), published, [id(5)]),
    true,
  );
});

test("selected development, gallery photo and uploaded image override resolve in order", () => {
  const published = [property(1, "Sentul"), property(2, "Sentul")];
  const selected = config({ propertyIds: [id(2)], galleryIndex: 1 });
  assert.equal(
    buildLocalAreaCards(published, [selected])[0].image,
    "/photos/2-2.jpg",
  );
  const uploaded = {
    id: id(5),
    url: "/uploads/sentul.jpg",
    alt: "Sentul skyline",
  };
  const card = buildLocalAreaCards(
    published,
    [{ ...selected, imageAssetId: uploaded.id }],
    [uploaded],
  )[0];
  assert.equal(card.image, uploaded.url);
  assert.equal(card.imageAlt, uploaded.alt);
});

test("hidden and empty areas stay hidden; archived sources and deleted uploads cannot leave stale photos", () => {
  assert.equal(buildLocalAreaCards([], [config()]).length, 0);
  assert.equal(
    buildLocalAreaCards([property(1, "Sentul")], [config({ isVisible: false })])
      .length,
    0,
  );
  const card = buildLocalAreaCards(
    [property(1, "Sentul")],
    [config({ propertyIds: [id(2)], imageAssetId: id(5) })],
  )[0];
  assert.equal(card.image, null);
});

test("automatic sources stop at three, and generic listing images become honest placeholders", () => {
  const published = [1, 2, 3, 4].map((number) => property(number, "Sentul"));
  assert.equal(
    validLocalAreaSources(config({ coverPropertyId: id(4) }), published, []),
    false,
  );
  assert.equal(
    buildLocalAreaCards([
      {
        ...property(1, "Sentul"),
        image: "/estatein/property-villa.png",
        gallery: [],
      },
    ])[0].image,
    null,
  );
});
