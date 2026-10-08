import type { RentalUnit } from "./properties";
import { positiveInteger, roomTypeDatabaseValues } from "./property-search";

export const RENTAL_OPTIONS_PAGE_SIZE = 9;
export const availabilityLabels = {
  available: "Available now",
  reserved: "Reserved",
  occupied: "Currently rented",
  unavailable: "Unavailable",
  coming_soon: "Coming soon",
} as const;

export type RentalOptionFilters = {
  type: string;
  availability: string;
  page: number;
};
export type RentalOptionsResponse = {
  data: RentalUnit[];
  total: number;
  page: number;
  pageSize: number;
};

export function readRentalOptionFilters(
  params: Pick<URLSearchParams, "get">,
): RentalOptionFilters {
  const type = params.get("roomType") ?? "All";
  const availability = params.get("availability") ?? "all";
  return {
    type: Object.hasOwn(roomTypeDatabaseValues, type) ? type : "All",
    availability: Object.hasOwn(availabilityLabels, availability)
      ? availability
      : "all",
    page: positiveInteger(params.get("optionsPage"), 1),
  };
}

export function paginateRentalOptions(
  units: RentalUnit[],
  filters: RentalOptionFilters,
): RentalOptionsResponse {
  const filtered = units.filter(
    (unit) =>
      (!unit.status || unit.status === "published") &&
      (filters.type === "All" || unit.roomType === filters.type) &&
      (filters.availability === "all" ||
        (unit.availability ?? (unit.available ? "available" : "occupied")) ===
          filters.availability),
  );
  const page = Math.min(
    filters.page,
    Math.max(1, Math.ceil(filtered.length / RENTAL_OPTIONS_PAGE_SIZE)),
  );
  return {
    data: filtered.slice(
      (page - 1) * RENTAL_OPTIONS_PAGE_SIZE,
      page * RENTAL_OPTIONS_PAGE_SIZE,
    ),
    total: filtered.length,
    page,
    pageSize: RENTAL_OPTIONS_PAGE_SIZE,
  };
}

export function rentalPrice(
  unit: Pick<RentalUnit, "monthlyRent" | "maximumRent">,
) {
  const minimum = `RM${unit.monthlyRent.toLocaleString("en-MY")}`;
  return unit.maximumRent && unit.maximumRent !== unit.monthlyRent
    ? `${minimum} – RM${unit.maximumRent.toLocaleString("en-MY")}`
    : minimum;
}

export function rentalAvailability(
  unit: Pick<RentalUnit, "available" | "availability">,
) {
  return availabilityLabels[
    unit.availability ?? (unit.available ? "available" : "occupied")
  ];
}

export type EnquiryContext = {
  propertySlug: string;
  propertyTitle: string;
  location: string;
  rentalOptionSlug: string;
  unitTitle?: string;
  roomType?: string;
  price?: string;
  availability?: string;
  furnished?: boolean;
};

export function enquiryMessage(context: EnquiryContext) {
  return [
    `Hi RentDeer, I’m interested in ${context.unitTitle ? `${context.unitTitle} at ` : ""}${context.propertyTitle}.`,
    "",
    `Location: ${context.location}`,
    ...(context.unitTitle
      ? [
          `Room type: ${context.roomType}`,
          `Monthly rent: ${context.price} / month`,
          `Furnishing: ${context.furnished ? "Fully furnished" : "Not fully furnished"}`,
          `Availability: ${context.availability}`,
        ]
      : []),
    "",
    "Could you confirm the latest availability, rental terms and viewing times? Thank you.",
  ].join("\n");
}

export function enquiryHref(propertySlug: string, rentalOptionSlug?: string) {
  const params = new URLSearchParams({ property: propertySlug });
  if (rentalOptionSlug) params.set("unit", rentalOptionSlug);
  return `/contact?${params}#enquiry-form`;
}
