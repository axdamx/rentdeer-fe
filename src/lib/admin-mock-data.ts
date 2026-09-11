export type AdminContentPage = {
  slug: string;
  name: string;
  route: string;
  description: string;
  status: "Published" | "Draft";
  lastUpdated: string;
  sections: {
    id: string;
    name: string;
    description: string;
    assetCount: number;
  }[];
};

export const adminContentPages: AdminContentPage[] = [
  {
    slug: "home",
    name: "Homepage",
    route: "/",
    description: "Hero, discovery search, stories, statistics and reviews.",
    status: "Published",
    lastUpdated: "10 Sep 2026",
    sections: [
      {
        id: "hero",
        name: "Hero & search",
        description: "Headline, supporting copy and hero background.",
        assetCount: 1,
      },
      {
        id: "story",
        name: "Story scroll",
        description: "Sticky images and the RentDeer story cards.",
        assetCount: 3,
      },
      {
        id: "statistics",
        name: "Inside RentDeer",
        description: "Background image and company statistics.",
        assetCount: 1,
      },
      {
        id: "reviews",
        name: "Reviews",
        description: "Tenant and landlord testimonials.",
        assetCount: 0,
      },
    ],
  },
  {
    slug: "about",
    name: "About Us",
    route: "/about",
    description: "Company story, parallax gallery, journey and team.",
    status: "Published",
    lastUpdated: "10 Sep 2026",
    sections: [
      {
        id: "hero",
        name: "About hero",
        description: "Page headline and introduction.",
        assetCount: 1,
      },
      {
        id: "parallax-gallery",
        name: "Parallax gallery",
        description: "Bento gallery images, order and display sizes.",
        assetCount: 9,
      },
      {
        id: "journey",
        name: "Our journey",
        description: "Company milestones and supporting copy.",
        assetCount: 0,
      },
      {
        id: "team",
        name: "Our team",
        description: "Leadership profiles, roles and biographies.",
        assetCount: 3,
      },
    ],
  },
  {
    slug: "services",
    name: "Services",
    route: "/services",
    description: "Tenant, landlord and property-agent service flows.",
    status: "Published",
    lastUpdated: "9 Sep 2026",
    sections: [
      {
        id: "hero",
        name: "Services hero",
        description: "Headline, introduction and overview statistic.",
        assetCount: 0,
      },
      {
        id: "services",
        name: "Service cards",
        description: "Service names, descriptions and destinations.",
        assetCount: 0,
      },
      {
        id: "flows",
        name: "Role-based flows",
        description: "Tenant, landlord and agent process steps.",
        assetCount: 0,
      },
    ],
  },
  {
    slug: "faq",
    name: "FAQ",
    route: "/faq",
    description: "Frequently asked questions and renter guidance.",
    status: "Published",
    lastUpdated: "6 Sep 2026",
    sections: [
      {
        id: "hero",
        name: "FAQ hero",
        description: "Page introduction and supporting text.",
        assetCount: 0,
      },
      {
        id: "questions",
        name: "Questions & answers",
        description: "Manage question order, answers and visibility.",
        assetCount: 0,
      },
    ],
  },
  {
    slug: "bulletin",
    name: "Bulletin",
    route: "/bulletin",
    description: "Rental guides, company updates and community notes.",
    status: "Draft",
    lastUpdated: "4 Sep 2026",
    sections: [
      {
        id: "hero",
        name: "Bulletin hero",
        description: "Page introduction and featured story.",
        assetCount: 1,
      },
      {
        id: "articles",
        name: "Articles",
        description: "Published guides and community updates.",
        assetCount: 3,
      },
    ],
  },
  {
    slug: "contact",
    name: "Contact Us",
    route: "/contact",
    description: "Contact details, enquiry form copy and response message.",
    status: "Published",
    lastUpdated: "2 Sep 2026",
    sections: [
      {
        id: "hero",
        name: "Contact hero",
        description: "Headline and enquiry introduction.",
        assetCount: 0,
      },
      {
        id: "contact-details",
        name: "Contact details",
        description: "Email, phone, WhatsApp and office address.",
        assetCount: 0,
      },
      {
        id: "form",
        name: "Enquiry form",
        description: "Form labels, topics and confirmation message.",
        assetCount: 0,
      },
    ],
  },
];

export const adminEnquiries = [
  {
    id: "ENQ-1048",
    name: "Nur Aina",
    email: "aina@example.com",
    topic: "Viewing a room",
    property: "Seasons Square Residence",
    received: "Today, 10:42 AM",
    status: "New",
  },
  {
    id: "ENQ-1047",
    name: "Daniel Lee",
    email: "daniel@example.com",
    topic: "Landlord management",
    property: "New property enquiry",
    received: "Today, 9:18 AM",
    status: "In progress",
  },
  {
    id: "ENQ-1046",
    name: "Siti Hajar",
    email: "siti@example.com",
    topic: "Booking a room",
    property: "Ara Damansara Studio Living",
    received: "Yesterday, 4:32 PM",
    status: "Replied",
  },
  {
    id: "ENQ-1045",
    name: "Marcus Tan",
    email: "marcus@example.com",
    topic: "Property agent partnership",
    property: "—",
    received: "Yesterday, 1:05 PM",
    status: "New",
  },
  {
    id: "ENQ-1044",
    name: "Farah Nadia",
    email: "farah@example.com",
    topic: "General question",
    property: "Kota Damansara Residences",
    received: "8 Sep 2026",
    status: "Closed",
  },
];

export function getAdminContentPage(slug: string) {
  return adminContentPages.find((page) => page.slug === slug);
}
