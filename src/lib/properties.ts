export type Property = {
  slug: string;
  title: string;
  location: string;
  type: "Villas" | "Apartments" | "Houses";
  image: string;
  price: number;
  beds: number;
  baths: number;
  area: string;
  description: string;
  features: string[];
};

export const properties: Property[] = [
  {
    slug: "seaside-serenity-villa",
    title: "Seaside Serenity Villa",
    location: "Malibu, California",
    type: "Villas",
    image: "/estatein/property-villa.png",
    price: 2850000,
    beds: 4,
    baths: 3,
    area: "2,850 sq. ft.",
    description:
      "A calm, light-filled retreat with open living spaces, a private pool, and uninterrupted views of the Pacific.",
    features: [
      "Ocean-facing terrace",
      "Chef's kitchen",
      "Private swimming pool",
      "Smart home controls",
    ],
  },
  {
    slug: "metropolitan-haven",
    title: "Metropolitan Haven",
    location: "New York, New York",
    type: "Apartments",
    image: "/estatein/property-tower.png",
    price: 1650000,
    beds: 2,
    baths: 2,
    area: "1,480 sq. ft.",
    description:
      "A polished city apartment designed around generous views, considered materials, and the energy of downtown living.",
    features: [
      "Floor-to-ceiling windows",
      "Resident's lounge",
      "Fitness studio access",
      "24-hour concierge",
    ],
  },
  {
    slug: "rustic-retreat-cottage",
    title: "Rustic Retreat Cottage",
    location: "Austin, Texas",
    type: "Houses",
    image: "/estatein/property-campus.png",
    price: 850000,
    beds: 3,
    baths: 2,
    area: "2,120 sq. ft.",
    description:
      "A warm, characterful home surrounded by open space, pairing quiet mornings with easy access to the city.",
    features: [
      "Mature garden",
      "Outdoor entertaining deck",
      "Dedicated home office",
      "Two-car garage",
    ],
  },
  {
    slug: "skyline-residence",
    title: "Skyline Residence",
    location: "Chicago, Illinois",
    type: "Apartments",
    image: "/estatein/property-tower.png",
    price: 1240000,
    beds: 2,
    baths: 2,
    area: "1,260 sq. ft.",
    description:
      "An elevated residence with a flexible floor plan and a front-row seat to the city's changing skyline.",
    features: [
      "Private balcony",
      "Parking included",
      "Rooftop garden",
      "Transit at the door",
    ],
  },
  {
    slug: "garden-house",
    title: "The Garden House",
    location: "Portland, Oregon",
    type: "Houses",
    image: "/estatein/property-villa.png",
    price: 975000,
    beds: 3,
    baths: 2,
    area: "1,960 sq. ft.",
    description:
      "A modern garden home that balances clean architecture with a softer, slower way of living.",
    features: [
      "Glass garden room",
      "Solar-ready roof",
      "Natural stone finishes",
      "Quiet cul-de-sac",
    ],
  },
  {
    slug: "blue-hour-estate",
    title: "Blue Hour Estate",
    location: "San Diego, California",
    type: "Villas",
    image: "/estatein/property-campus.png",
    price: 3125000,
    beds: 5,
    baths: 4,
    area: "3,420 sq. ft.",
    description:
      "A generous coastal estate built for hosting, unwinding, and making the most of long California evenings.",
    features: [
      "Panoramic sunset views",
      "Guest suite",
      "Infinity-edge pool",
      "Landscaped courtyard",
    ],
  },
];

export function getProperty(slug: string) {
  return properties.find((property) => property.slug === slug);
}
