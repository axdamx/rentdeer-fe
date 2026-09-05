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
