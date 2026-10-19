import type { PropertyDetails } from "./properties";

// Original listing content seeds new listings and fills older empty records.
// Property-specific saved content takes precedence.
export const defaultPropertyDetails: PropertyDetails = {
  highlights: [
    "Move-in-ready rental options",
    "Responsive RentDeer support",
    "Shared spaces kept clean and managed",
  ],
  houseRules: [
    "Minimum rental period: 6 months",
    "No pets allowed",
    "Cooking is allowed in the shared kitchen",
    "Keep shared spaces clean and considerate",
  ],
  rentalTerms: [
    { label: "Deposit", value: "Required upon booking confirmation" },
    { label: "Utilities", value: "Included as stated during enquiry" },
    { label: "Parking", value: "Available on request for a monthly fee" },
  ],
  availability: "Ready to enquire",
  responseTime: "Usually replies within 1 business day",
  nearby: [],
  review: {
    quote:
      "The room was ready when I arrived, and the RentDeer team made the move-in process easy to understand.",
    author: "Aisyah Rahman",
    role: "RentDeer tenant",
    rating: "4.8",
    isDemo: true,
  },
  bookingSteps: [
    "Send an enquiry with your preferred move-in date",
    "Ask questions or arrange a viewing with the team",
    "Confirm the room and review the rental terms",
  ],
};

function text(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function textList(value: unknown, fallback: string[]) {
  const items = Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
  return items.length ? items : fallback;
}

export function resolvePropertyDetails(values: {
  highlights?: unknown;
  houseRules?: unknown;
  rentalTerms?: unknown;
  bookingSteps?: unknown;
  availability?: unknown;
  responseTime?: unknown;
  nearby?: PropertyDetails["nearby"];
}): PropertyDetails {
  const terms = Array.isArray(values.rentalTerms)
    ? values.rentalTerms.flatMap((item) => {
        if (typeof item !== "object" || item === null) return [];
        const label = text(item.label, "");
        const value = text(item.value, "");
        return label && value ? [{ label, value }] : [];
      })
    : [];

  return {
    highlights: textList(values.highlights, defaultPropertyDetails.highlights),
    houseRules: textList(values.houseRules, defaultPropertyDetails.houseRules),
    rentalTerms: terms.length ? terms : defaultPropertyDetails.rentalTerms,
    bookingSteps: textList(
      values.bookingSteps,
      defaultPropertyDetails.bookingSteps,
    ),
    availability: text(
      values.availability,
      defaultPropertyDetails.availability,
    ),
    responseTime: text(
      values.responseTime,
      defaultPropertyDetails.responseTime,
    ),
    nearby: values.nearby ?? [],
    review: defaultPropertyDetails.review,
  };
}
