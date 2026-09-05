export type RoomType =
  | "Master Bedroom"
  | "Medium Bedroom"
  | "Single Bedroom"
  | "Small Room"
  | "Soho/Studio"
  | "Whole Unit";

export type Property = {
  slug: string;
  title: string;
  location: string;
  city: string;
  roomType: RoomType;
  image: string;
  monthlyRent: number;
  bedrooms: number;
  toilets: number;
  area: string;
  description: string;
  furnished: boolean;
  amenities: string[];
  facilities: string[];
  details: PropertyDetails;
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

const mockPropertyDetails: PropertyDetails = {
  highlights: [
    "Move-in-ready furnished room",
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
    { label: "Availability", value: "Ready to enquire" },
  ],
  availability: "Ready to enquire",
  responseTime: "Usually replies within 1 business day",
  nearby: [
    { label: "Nearest transit", distance: "8 min" },
    { label: "Grocery & essentials", distance: "5 min" },
    { label: "Kuala Lumpur city centre", distance: "25 min" },
  ],
  review: {
    quote:
      "The room was ready when I arrived, and the RentDeer team made the move-in process easy to understand.",
    author: "Aisyah Rahman",
    role: "RentDeer tenant",
    rating: "4.8",
  },
  bookingSteps: [
    "Send an enquiry with your preferred move-in date",
    "Ask questions or arrange a viewing with the team",
    "Confirm the booking and review the rental terms",
  ],
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

export const properties: Property[] = [
  {
    slug: "fully-furnished-master-room-damansara-damai",
    title: "Fully Furnished Master Room",
    location: "Seasons Square, Damansara Damai",
    city: "Damansara Damai",
    roomType: "Master Bedroom",
    image: "/estatein/property-villa.png",
    monthlyRent: 850,
    bedrooms: 1,
    toilets: 1,
    area: "220 sq. ft.",
    description:
      "A clean, move-in-ready master room in a well-connected community, with practical living spaces and a responsive support team.",
    furnished: true,
    details: mockPropertyDetails,
    amenities: [
      "Bed and mattress",
      "Wardrobe",
      "Study table",
      "Air conditioning",
    ],
    facilities: [
      "Shared kitchen",
      "Laundry area",
      "24-hour security",
      "Parking on request",
    ],
  },
  {
    slug: "medium-room-kota-damansara",
    title: "Bright Medium Room",
    location: "Kota Damansara, Petaling Jaya",
    city: "Kota Damansara",
    roomType: "Medium Bedroom",
    image: "/estatein/property-tower.png",
    monthlyRent: 700,
    bedrooms: 1,
    toilets: 1,
    area: "180 sq. ft.",
    description:
      "A bright and comfortable room for renters who want a straightforward move-in experience close to daily essentials and transit.",
    furnished: true,
    details: mockPropertyDetails,
    amenities: ["Single bed", "Wardrobe", "Ceiling fan", "Natural light"],
    facilities: [
      "Shared kitchen",
      "High-speed Wi-Fi",
      "Common lounge",
      "Visitor parking",
    ],
  },
  {
    slug: "single-room-kelana-jaya",
    title: "Ready Single Room",
    location: "Kelana Jaya, Petaling Jaya",
    city: "Kelana Jaya",
    roomType: "Single Bedroom",
    image: "/estatein/property-campus.png",
    monthlyRent: 550,
    bedrooms: 1,
    toilets: 1,
    area: "140 sq. ft.",
    description:
      "An affordable, ready-to-rent room with simple comforts and a location that keeps work, food, and transport within easy reach.",
    furnished: true,
    details: mockPropertyDetails,
    amenities: ["Single bed", "Storage", "Desk", "Fan"],
    facilities: [
      "Shared kitchen",
      "Laundry area",
      "Gated access",
      "Maintenance support",
    ],
  },
  {
    slug: "soho-studio-ara-damansara",
    title: "Private Soho Studio",
    location: "Ara Damansara, Selangor",
    city: "Ara Damansara",
    roomType: "Soho/Studio",
    image: "/estatein/property-villa.png",
    monthlyRent: 1500,
    bedrooms: 1,
    toilets: 1,
    area: "480 sq. ft.",
    description:
      "A private studio for renters who want more room to work, rest, and make the space their own without the complexity of a full lease search.",
    furnished: true,
    details: mockPropertyDetails,
    amenities: ["Queen bed", "Kitchenette", "Work desk", "Built-in storage"],
    facilities: ["Swimming pool", "Gym", "Covered parking", "24-hour security"],
  },
  {
    slug: "whole-unit-cheras",
    title: "Family Whole Unit",
    location: "Cheras, Kuala Lumpur",
    city: "Cheras",
    roomType: "Whole Unit",
    image: "/estatein/property-campus.png",
    monthlyRent: 2200,
    bedrooms: 3,
    toilets: 2,
    area: "980 sq. ft.",
    description:
      "A practical whole-unit home for families or housemates, with flexible rooms, shared facilities, and easy access to the city.",
    furnished: true,
    details: mockPropertyDetails,
    amenities: ["Three bedrooms", "Living room", "Dining area", "Kitchen"],
    facilities: [
      "Playground",
      "Covered parking",
      "Security patrol",
      "Nearby transit",
    ],
  },
  {
    slug: "small-room-sentul",
    title: "Simple Small Room",
    location: "Sentul, Kuala Lumpur",
    city: "Sentul",
    roomType: "Small Room",
    image: "/estatein/property-tower.png",
    monthlyRent: 450,
    bedrooms: 1,
    toilets: 1,
    area: "110 sq. ft.",
    description:
      "A neat, budget-friendly room for renters who value simplicity, clear rental terms, and a home that is ready when they are.",
    furnished: true,
    details: mockPropertyDetails,
    amenities: ["Single bed", "Wardrobe", "Fan", "Window"],
    facilities: [
      "Shared kitchen",
      "Laundry area",
      "Gated access",
      "Customer care",
    ],
  },
];

export function getProperty(slug: string) {
  return properties.find((property) => property.slug === slug);
}
