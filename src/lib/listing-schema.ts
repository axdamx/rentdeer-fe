import { z } from "zod";
import { transitStationById } from "@/lib/listing-reference-data";
import { localAreaListSchema } from "@/lib/local-areas";
import { defaultPropertyDetails } from "./property-details";

export const publishStatuses = ["draft", "published", "archived"] as const;
export const roomTypeValues = [
  "master_bedroom",
  "medium_bedroom",
  "single_bedroom",
  "small_room",
  "soho_studio",
  "whole_unit",
] as const;
export const availabilityValues = [
  "available",
  "reserved",
  "occupied",
  "unavailable",
  "coming_soon",
] as const;
export const transitAccessModes = ["walk", "drive", "shuttle"] as const;

const optionalText = z.string().trim().optional().or(z.literal(""));

export const virtualTourUrlSchema = z
  .string()
  .trim()
  .pipe(
    z
      .url({
        protocol: /^https?$/,
        error: "Enter a valid HTTP or HTTPS video URL, or leave it blank.",
      })
      .max(3000)
      .or(z.literal("")),
  )
  .optional();

export const transitConnectionInputSchema = z.object({
  stationId: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .refine((stationId) => transitStationById.has(stationId), {
      message: "Choose a station from the public transport catalogue.",
    }),
  accessMinutes: z.coerce.number().int().min(1).max(180),
  accessMode: z.enum(transitAccessModes),
});

export const rentalOptionInputSchema = z.object({
  id: z.uuid().optional(),
  slug: z.string().trim().min(1).max(120),
  title: z.string().trim().min(2).max(160),
  internalCode: optionalText,
  variant: optionalText,
  roomType: z.enum(roomTypeValues),
  description: z.string().trim().max(2000).default(""),
  priceMin: z.coerce.number().int().min(0),
  priceMax: z.coerce.number().int().min(0).nullable().optional(),
  priceNote: optionalText,
  bedrooms: z.coerce.number().min(0).max(20).default(1),
  bathrooms: z.coerce.number().min(0).max(20).default(1),
  areaSqft: z.coerce.number().int().positive().nullable().optional(),
  bedType: optionalText,
  bathroomType: z.enum(["private", "shared", "unspecified"]),
  furnished: z.boolean().default(true),
  availability: z.enum(availabilityValues),
  quantityAvailable: z.coerce.number().int().min(0).default(1),
  virtualTourUrl: virtualTourUrlSchema,
  status: z.enum(publishStatuses),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export const propertyInputSchema = z
  .object({
    id: z.uuid().optional(),
    slug: z.string().trim().min(1).max(120),
    title: z.string().trim().min(2).max(160),
    description: z.string().trim().max(5000).default(""),
    propertyType: z.string().trim().min(2).max(120),
    managedBy: z.string().trim().min(2).max(160),
    addressLine: optionalText,
    postcode: optionalText,
    city: z.string().trim().min(2).max(100),
    area: optionalText,
    state: z.string().trim().min(2).max(100).default("Selangor"),
    latitude: z.coerce.number().min(-90).max(90).nullable().optional(),
    longitude: z.coerce.number().min(-180).max(180).nullable().optional(),
    status: z.enum(publishStatuses),
    isFeatured: z.boolean().default(false),
    facilities: z.array(z.string().trim().min(1).max(120)).default([]),
    transitConnections: z.array(transitConnectionInputSchema).default([]),
    highlights: z
      .array(z.string().trim().min(1).max(500))
      .min(1)
      .max(20)
      .default(defaultPropertyDetails.highlights),
    houseRules: z
      .array(z.string().trim().min(1).max(500))
      .min(1)
      .max(20)
      .default(defaultPropertyDetails.houseRules),
    rentalTerms: z
      .array(
        z.object({
          label: z.string().trim().min(1).max(120),
          value: z.string().trim().min(1).max(1000),
        }),
      )
      .min(1)
      .max(20)
      .default(defaultPropertyDetails.rentalTerms),
    bookingSteps: z
      .array(z.string().trim().min(1).max(500))
      .min(1)
      .max(12)
      .default(defaultPropertyDetails.bookingSteps),
    availabilityLabel: z
      .string()
      .trim()
      .min(1)
      .max(160)
      .default(defaultPropertyDetails.availability),
    responseTime: z
      .string()
      .trim()
      .min(1)
      .max(200)
      .default(defaultPropertyDetails.responseTime),
    rentalOptions: z.array(rentalOptionInputSchema).min(1),
  })
  .superRefine((value, context) => {
    const stationIds = new Set<string>();
    for (const [index, connection] of value.transitConnections.entries()) {
      if (stationIds.has(connection.stationId)) {
        context.addIssue({
          code: "custom",
          message: "Each public transport station can only be selected once.",
          path: ["transitConnections", index, "stationId"],
        });
      }
      stationIds.add(connection.stationId);
    }

    for (const [index, option] of value.rentalOptions.entries()) {
      if (option.priceMax != null && option.priceMax < option.priceMin) {
        context.addIssue({
          code: "custom",
          message: "Maximum price cannot be lower than minimum price.",
          path: ["rentalOptions", index, "priceMax"],
        });
      }
    }
  });

export const enquiryInputSchema = z.object({
  propertySlug: optionalText,
  rentalOptionSlug: optionalText,
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  email: z.email().max(254),
  phone: optionalText,
  topic: z.string().trim().min(1).max(120),
  message: z.string().trim().min(5).max(5000),
  consent: z.literal(true),
  sourceUrl: optionalText,
  utmSource: optionalText,
  utmMedium: optionalText,
  utmCampaign: optionalText,
});

export const enquiryStatusSchema = z.object({
  status: z.enum(["new", "in_progress", "replied", "closed"]),
});

export const siteImageSchema = z.object({
  path: z.string().trim().min(1).max(1200),
  url: z.string().trim().min(1).max(3000),
  alt: z.string().trim().max(300),
});

export const teamMemberInputSchema = z.object({
  id: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1500),
  imageAssetId: z.uuid().nullable().default(null),
});

export const siteSettingsInputSchema = z.object({
  siteName: z.string().trim().min(1).max(100),
  tagline: z.string().trim().max(200),
  primaryColour: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accentColour: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  companyEmail: z.email().or(z.literal("")),
  tenantPhone: z.string().trim().max(50),
  tenantWhatsapp: z.string().trim().max(50),
  landlordWhatsapp: z.string().trim().max(50),
  companyAddress: z.string().trim().max(1000),
  logo: siteImageSchema.nullable(),
  homepageHeroSlides: z.array(siteImageSchema).max(4),
  socialLinks: z.array(
    z.object({
      platform: z.string().trim().min(1).max(50),
      url: z.url().or(z.literal("")),
      isVisible: z.boolean().default(true),
      sortOrder: z.number().int().min(0),
    }),
  ),
});

export const contentPageInputSchema = z.object({
  id: z.uuid(),
  slug: z.string().trim().min(1).max(100),
  name: z.string().trim().min(1).max(120),
  route: z.string().trim().startsWith("/"),
  description: z.string().trim().max(1000),
  status: z.enum(publishStatuses),
  sections: z.array(
    z.object({
      id: z.uuid(),
      sectionKey: z.string().trim().min(1).max(100),
      name: z.string().trim().min(1).max(120),
      content: z.object({
        eyebrow: z.string().max(200).default(""),
        heading: z.string().max(500).default(""),
        description: z.string().max(3000).default(""),
        teamMembers: z.array(teamMemberInputSchema).max(3).default([]),
        localAreas: localAreaListSchema.default([]),
        localAreasEnabled: z.boolean().default(true),
      }),
      assets: z
        .array(
          z.object({
            id: z.uuid(),
            url: z.string().trim().min(1).max(3000),
            alt: z.string().trim().max(300),
            isCover: z.boolean(),
            sortOrder: z.number().int().min(0),
          }),
        )
        .default([]),
      isVisible: z.boolean(),
      sortOrder: z.number().int().min(0),
      assetCount: z.number().int().min(0).default(0),
    }),
  ),
});

export type PropertyInput = z.infer<typeof propertyInputSchema>;
export type RentalOptionInput = z.infer<typeof rentalOptionInputSchema>;
export type TransitConnectionInput = z.infer<
  typeof transitConnectionInputSchema
>;
export type EnquiryInput = z.infer<typeof enquiryInputSchema>;
export type SiteSettingsInput = z.infer<typeof siteSettingsInputSchema>;
export type ContentPageInput = z.infer<typeof contentPageInputSchema>;

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}
