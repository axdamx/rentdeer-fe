import type { Property } from "./properties";

export function propertyLocation(
  property: Pick<
    Property,
    | "addressLine"
    | "postcode"
    | "area"
    | "city"
    | "state"
    | "location"
    | "latitude"
    | "longitude"
  >,
) {
  const address =
    [
      property.addressLine,
      property.postcode,
      property.area,
      property.city,
      property.state,
    ]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(", ") || property.location;
  const { latitude, longitude } = property;
  const coordinates: [number, number] | null =
    latitude != null &&
    longitude != null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
      ? [latitude, longitude]
      : null;

  return { address, coordinates };
}
