import { z } from "zod";

export const addressLookupSchema = z.object({
  address: z.string().trim().min(5).max(1200),
});

export type AddressMatch = {
  label: string;
  latitude: number;
  longitude: number;
};

const photonResultSchema = z.object({
  features: z.array(
    z.object({
      geometry: z.object({
        type: z.literal("Point"),
        coordinates: z.tuple([
          z.number().min(-180).max(180),
          z.number().min(-90).max(90),
        ]),
      }),
      properties: z.record(z.string(), z.unknown()),
    }),
  ),
});

export async function lookupAddress(address: string): Promise<AddressMatch[]> {
  const query = addressLookupSchema.parse({ address }).address;
  const url = new URL(
    process.env.GEOCODING_API_URL || "https://photon.komoot.io/api/",
  );
  url.searchParams.set("q", query);
  url.searchParams.set("countrycode", "MY");
  url.searchParams.set("limit", "5");
  url.searchParams.set("lang", "en");
  const response = await fetch(url, {
    headers: {
      "User-Agent": "RentDeer listing address lookup",
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(10_000),
    next: { revalidate: 86_400 },
  });
  if (!response.ok)
    throw new Error("Address search is unavailable. Please try again shortly.");
  const result = photonResultSchema.safeParse(await response.json());
  if (!result.success)
    throw new Error(
      "Address search returned an invalid response. Please try again.",
    );
  const matches = new Map<string, AddressMatch>();
  for (const { geometry, properties } of result.data.features) {
    if (String(properties.countrycode).toUpperCase() !== "MY") continue;
    // Exclude fuzzy matches for bus stops, parks and other unrelated places.
    if (
      properties.osm_value === "bus_stop" ||
      !(
        properties.type === "house" ||
        properties.type === "street" ||
        properties.osm_key === "building"
      )
    )
      continue;
    // A city/district centre is not a property address match.
    if (
      ["country", "state", "county", "city", "district", "locality"].includes(
        String(properties.type),
      ) ||
      [
        "country",
        "state",
        "county",
        "city",
        "town",
        "village",
        "suburb",
        "quarter",
        "neighbourhood",
      ].includes(String(properties.osm_value))
    )
      continue;
    const parts = [
      properties.name,
      [properties.housenumber, properties.street].filter(Boolean).join(" "),
      properties.postcode,
      properties.city,
      properties.state,
      properties.country,
    ];
    const label = [
      ...new Set(
        parts.filter(
          (part): part is string =>
            typeof part === "string" && Boolean(part.trim()),
        ),
      ),
    ].join(", ");
    if (!label) continue;
    const [longitude, latitude] = geometry.coordinates;
    matches.set(`${latitude},${longitude}`, { label, latitude, longitude });
  }
  return [...matches.values()].slice(0, 5);
}
