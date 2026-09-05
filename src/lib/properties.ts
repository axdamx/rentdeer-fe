export type RoomType =
  | "Master Bedroom"
  | "Medium Bedroom"
  | "Single Bedroom"
  | "Small Room"
  | "Soho/Studio"
  | "Whole Unit";

export type RentalUnit = {
  slug: string;
  title: string;
  roomType: RoomType;
  image: string;
  monthlyRent: number;
  bedrooms: number;
  toilets: number;
  area: string;
  description: string;
  furnished: boolean;
  available: boolean;
};

export type PropertyDetails = {
  highlights: string[];
  houseRules: string[];
  rentalTerms: { label: string; value: string }[];
  availability: string;
  responseTime: string;
  nearby: { label: string; distance: string }[];
  review: { quote: string; author: string; role: string; rating: string };
  bookingSteps: string[];
};

export type Property = {
  slug: string;
  title: string;
  location: string;
  city: string;
  propertyType: string;
  image: string;
  gallery: string[];
  description: string;
  managedBy: string;
  facilities: string[];
  details: PropertyDetails;
  units: RentalUnit[];
};

export const cities = [
  "Ara Damansara",
  "Cheras",
  "Damansara Damai",
  "Kelana Jaya",
  "Kepong",
  "Kota Damansara",
  "Kuala Lumpur",
  "Petaling Jaya",
  "Puchong",
  "Sentul",
  "Seri Kembangan",
] as const;

export const roomTypes: RoomType[] = [
  "Master Bedroom",
  "Medium Bedroom",
  "Single Bedroom",
  "Small Room",
  "Soho/Studio",
  "Whole Unit",
];

const sharedTerms = [
  { label: "Deposit", value: "Required upon booking confirmation" },
  { label: "Utilities", value: "Included as stated during enquiry" },
  { label: "Parking", value: "Available on request for a monthly fee" },
];

const sharedRules = [
  "Minimum rental period: 6 months",
  "No pets allowed",
  "Cooking is allowed in the shared kitchen",
  "Keep shared spaces clean and considerate",
];

const sharedSteps = [
  "Send an enquiry with your preferred move-in date",
  "Ask questions or arrange a viewing with the team",
  "Confirm the room and review the rental terms",
];

const baseDetails = (
  nearby: { label: string; distance: string }[],
): PropertyDetails => ({
  highlights: [
    "Move-in-ready rental options",
    "Responsive RentDeer support",
    "Shared spaces kept clean and managed",
  ],
  houseRules: sharedRules,
  rentalTerms: sharedTerms,
  availability: "Ready to enquire",
  responseTime: "Usually replies within 1 business day",
  nearby,
  review: {
    quote:
      "The room was ready when I arrived, and the RentDeer team made the move-in process easy to understand.",
    author: "Aisyah Rahman",
    role: "RentDeer tenant",
    rating: "4.8",
  },
  bookingSteps: sharedSteps,
});

export const properties: Property[] = [
  {
    slug: "seasons-square-damansara-damai",
    title: "Seasons Square Residence",
    location: "Seasons Square, Damansara Damai",
    city: "Damansara Damai",
    propertyType: "Managed apartment residence",
    image: "/estatein/property-villa.png",
    gallery: [
      "/estatein/property-villa.png",
      "/estatein/property-tower.png",
      "/estatein/property-campus.png",
    ],
    description:
      "A well-managed residence with ready-to-move-in rooms, practical shared spaces, and a responsive team close to everyday essentials.",
    managedBy: "RentDeer Property Management",
    facilities: [
      "Shared kitchen",
      "Laundry area",
      "24-hour security",
      "Parking on request",
      "Common lounge",
    ],
    details: baseDetails([
      { label: "Damansara Damai MRT", distance: "8 min" },
      { label: "Grocery & essentials", distance: "5 min" },
      { label: "Kuala Lumpur city centre", distance: "25 min" },
    ]),
    units: [
      {
        slug: "master-room",
        title: "Fully Furnished Master Room",
        roomType: "Master Bedroom",
        image: "/estatein/property-villa.png",
        monthlyRent: 850,
        bedrooms: 1,
        toilets: 1,
        area: "220 sq. ft.",
        description:
          "A comfortable private room with practical storage and move-in-ready essentials.",
        furnished: true,
        available: true,
      },
      {
        slug: "medium-room",
        title: "Bright Medium Room",
        roomType: "Medium Bedroom",
        image: "/estatein/property-tower.png",
        monthlyRent: 700,
        bedrooms: 1,
        toilets: 1,
        area: "180 sq. ft.",
        description:
          "A bright room for renters who want a straightforward move-in experience.",
        furnished: true,
        available: true,
      },
      {
        slug: "small-room",
        title: "Simple Small Room",
        roomType: "Small Room",
        image: "/estatein/property-campus.png",
        monthlyRent: 550,
        bedrooms: 1,
        toilets: 1,
        area: "140 sq. ft.",
        description:
          "An affordable room with simple comforts for a clear, low-friction move.",
        furnished: true,
        available: false,
      },
    ],
  },
  {
    slug: "kota-damansara-residences",
    title: "Kota Damansara Residences",
    location: "Kota Damansara, Petaling Jaya",
    city: "Kota Damansara",
    propertyType: "Managed residential community",
    image: "/estatein/property-tower.png",
    gallery: [
      "/estatein/property-tower.png",
      "/estatein/property-campus.png",
      "/estatein/property-villa.png",
    ],
    description:
      "A connected residential community for renters who want easy access to work, food, transit, and a home supported by a dependable team.",
    managedBy: "RentDeer Property Management",
    facilities: [
      "Shared kitchen",
      "High-speed Wi-Fi",
      "Common lounge",
      "Visitor parking",
      "Gated access",
    ],
    details: baseDetails([
      { label: "Kota Damansara MRT", distance: "10 min" },
      { label: "Mutiara Damansara", distance: "12 min" },
      { label: "Petaling Jaya city centre", distance: "18 min" },
    ]),
    units: [
      {
        slug: "medium-room",
        title: "Bright Medium Room",
        roomType: "Medium Bedroom",
        image: "/estatein/property-tower.png",
        monthlyRent: 700,
        bedrooms: 1,
        toilets: 1,
        area: "180 sq. ft.",
        description:
          "A bright and comfortable room close to daily essentials and transit.",
        furnished: true,
        available: true,
      },
      {
        slug: "ready-single-room",
        title: "Ready Single Room",
        roomType: "Single Bedroom",
        image: "/estatein/property-campus.png",
        monthlyRent: 550,
        bedrooms: 1,
        toilets: 1,
        area: "140 sq. ft.",
        description:
          "An affordable room with simple comforts and an easy move-in setup.",
        furnished: true,
        available: true,
      },
    ],
  },
  {
    slug: "ara-damansara-studio-living",
    title: "Ara Damansara Studio Living",
    location: "Ara Damansara, Selangor",
    city: "Ara Damansara",
    propertyType: "Private studio residence",
    image: "/estatein/property-campus.png",
    gallery: [
      "/estatein/property-campus.png",
      "/estatein/property-villa.png",
      "/estatein/property-tower.png",
    ],
    description:
      "A private residence with flexible studio living for renters who want more room to work, rest, and make the space their own.",
    managedBy: "RentDeer Property Management",
    facilities: [
      "Swimming pool",
      "Gym",
      "Covered parking",
      "24-hour security",
      "Retail nearby",
    ],
    details: baseDetails([
      { label: "Ara Damansara LRT", distance: "7 min" },
      { label: "Subang airport", distance: "15 min" },
      { label: "Petaling Jaya city centre", distance: "20 min" },
    ]),
    units: [
      {
        slug: "private-soho-studio",
        title: "Private Soho Studio",
        roomType: "Soho/Studio",
        image: "/estatein/property-campus.png",
        monthlyRent: 1500,
        bedrooms: 1,
        toilets: 1,
        area: "480 sq. ft.",
        description:
          "A private studio with space to work, rest, and settle into a simpler routine.",
        furnished: true,
        available: true,
      },
      {
        slug: "whole-unit",
        title: "Flexible Whole Unit",
        roomType: "Whole Unit",
        image: "/estatein/property-villa.png",
        monthlyRent: 2200,
        bedrooms: 2,
        toilets: 2,
        area: "820 sq. ft.",
        description:
          "A practical whole unit for people who want privacy, flexibility, and shared living space.",
        furnished: true,
        available: false,
      },
    ],
  },
];

export function getProperty(slug: string) {
  return properties.find((property) => property.slug === slug);
}
