import "server-only";

import { hasSupabaseEnv } from "@/lib/env";
import {
  type PropertyInput,
  type RentalOptionInput,
  slugify,
  type TransitConnectionInput,
} from "@/lib/listing-schema";
import type { AreaDevelopment } from "@/lib/local-areas";
import {
  properties as fallbackProperties,
  type Property,
  type RoomType,
} from "@/lib/properties";
import { createClient } from "@/lib/supabase/server";

const propertySelect = `
  *,
  property_facilities(sort_order, facilities(name)),
  property_nearby_places(id, label, distance, sort_order),
  media_assets(id, bucket, object_path, alt_text, is_cover, sort_order),
  rental_options(
    *,
    media_assets(id, bucket, object_path, alt_text, is_cover, sort_order),
    rental_option_amenities(sort_order, amenities(name))
  )
`;

const roomTypeLabels: Record<string, RoomType> = {
  master_bedroom: "Master Bedroom",
  medium_bedroom: "Medium Bedroom",
  single_bedroom: "Single Bedroom",
  small_room: "Small Room",
  soho_studio: "Soho/Studio",
  whole_unit: "Whole Unit",
};

const roomTypeValues: Record<RoomType, RentalOptionInput["roomType"]> = {
  "Master Bedroom": "master_bedroom",
  "Medium Bedroom": "medium_bedroom",
  "Single Bedroom": "single_bedroom",
  "Small Room": "small_room",
  "Soho/Studio": "soho_studio",
  "Whole Unit": "whole_unit",
};

type JsonTerm = { label: string; value: string };
type MediaRow = {
  bucket: string;
  object_path: string;
  is_cover: boolean;
  sort_order: number;
};
type FacilityJoin = { sort_order: number; facilities: { name: string } | null };
type NearbyRow = { label: string; distance: string; sort_order: number };
type RentalOptionRow = {
  id: string;
  slug: string;
  title: string;
  internal_code: string | null;
  variant: string | null;
  room_type: string;
  description: string;
  price_min: number;
  price_max: number | null;
  price_note: string | null;
  bedrooms: number | string;
  bathrooms: number | string;
  area_sqft: number | null;
  bed_type: string | null;
  bathroom_type: "private" | "shared" | "unspecified";
  furnished: boolean;
  availability:
    | "available"
    | "reserved"
    | "occupied"
    | "unavailable"
    | "coming_soon";
  status: "draft" | "published" | "archived";
  quantity_available: number;
  virtual_tour_url: string | null;
  sort_order: number;
  media_assets: MediaRow[] | null;
};
type PropertyRow = {
  id: string;
  slug: string;
  title: string;
  address_line: string | null;
  postcode: string | null;
  area: string | null;
  city: string;
  state: string;
  latitude: number | string | null;
  longitude: number | string | null;
  property_type: string;
  description: string;
  managed_by: string;
  status: "draft" | "published" | "archived";
  is_featured: boolean;
  updated_at: string;
  highlights: unknown;
  house_rules: unknown;
  rental_terms: unknown;
  booking_steps: unknown;
  availability_label: string;
  response_time: string;
  transit_connections: unknown;
  property_facilities: FacilityJoin[] | null;
  property_nearby_places: NearbyRow[] | null;
  media_assets: MediaRow[] | null;
  rental_options: RentalOptionRow[] | null;
};

function stringArray(value: unknown, fallback: string[] = []) {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : fallback;
}

function rentalTerms(value: unknown): JsonTerm[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is JsonTerm =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as JsonTerm).label === "string" &&
      typeof (item as JsonTerm).value === "string",
  );
}

function transitConnections(value: unknown): TransitConnectionInput[] {
  let connections = value;
  if (typeof connections === "string") {
    try {
      connections = JSON.parse(connections);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(connections)) return [];

  return connections.flatMap((item) => {
    if (typeof item !== "object" || item === null) return [];
    const candidate = item as Record<string, unknown>;
    const accessMinutes = Number(candidate.accessMinutes);
    const accessMode = candidate.accessMode;

    if (
      typeof candidate.stationId !== "string" ||
      !Number.isInteger(accessMinutes) ||
      accessMinutes < 1 ||
      !["walk", "drive", "shuttle"].includes(String(accessMode))
    ) {
      return [];
    }

    return [
      {
        stationId: candidate.stationId,
        accessMinutes,
        accessMode: accessMode as TransitConnectionInput["accessMode"],
      },
    ];
  });
}

function mediaUrl(media: MediaRow[] | null | undefined) {
  const item = [...(media ?? [])].sort(
    (a, b) =>
      Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order,
  )[0];
  if (!item) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base
    ? `${base}/storage/v1/object/public/${item.bucket}/${item.object_path}`
    : null;
}

function mediaGallery(media: MediaRow[] | null | undefined) {
  return [...(media ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => {
      const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
      return base
        ? `${base}/storage/v1/object/public/${item.bucket}/${item.object_path}`
        : "";
    })
    .filter(Boolean);
}

function mapProperty(row: PropertyRow): Property {
  const propertyImage =
    mediaUrl(row.media_assets) ?? "/estatein/property-villa.png";
  const gallery = mediaGallery(row.media_assets);
  const units = [...(row.rental_options ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((option): Property["units"][number] => ({
      id: option.id,
      slug: option.slug,
      title: option.title,
      internalCode: option.internal_code ?? undefined,
      variant: option.variant ?? undefined,
      roomType: roomTypeLabels[option.room_type] ?? "Single Bedroom",
      image: mediaUrl(option.media_assets) ?? propertyImage,
      monthlyRent: option.price_min,
      maximumRent: option.price_max ?? undefined,
      priceNote: option.price_note ?? undefined,
      bedrooms: Number(option.bedrooms),
      toilets: Number(option.bathrooms),
      area: option.area_sqft
        ? `${option.area_sqft} sq. ft.`
        : "Size on request",
      areaSqft: option.area_sqft ?? undefined,
      description: option.description,
      furnished: option.furnished,
      bedType: option.bed_type ?? undefined,
      bathroomType: option.bathroom_type,
      quantityAvailable: option.quantity_available,
      available: option.availability === "available",
      availability: option.availability,
      status: option.status,
      virtualTour: option.virtual_tour_url
        ? { source: option.virtual_tour_url }
        : undefined,
    }));

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    location:
      [row.address_line, row.area, row.city].filter(Boolean).join(", ") ||
      row.city,
    city: row.city,
    addressLine: row.address_line ?? undefined,
    area: row.area ?? undefined,
    postcode: row.postcode ?? undefined,
    state: row.state,
    latitude: row.latitude == null ? undefined : Number(row.latitude),
    longitude: row.longitude == null ? undefined : Number(row.longitude),
    propertyType: row.property_type,
    image: propertyImage,
    gallery: gallery.length ? gallery : [propertyImage],
    description: row.description,
    managedBy: row.managed_by,
    facilities: [...(row.property_facilities ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => item.facilities?.name)
      .filter((name): name is string => Boolean(name)),
    transitConnections: transitConnections(row.transit_connections),
    details: {
      highlights: stringArray(row.highlights),
      houseRules: stringArray(row.house_rules),
      rentalTerms: rentalTerms(row.rental_terms),
      availability: row.availability_label,
      responseTime: row.response_time,
      nearby: [...(row.property_nearby_places ?? [])]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((place) => ({ label: place.label, distance: place.distance })),
      review: {
        quote:
          "Ask our team about the latest tenant experience at this property.",
        author: "RentDeer",
        role: "Property management team",
        rating: "—",
      },
      bookingSteps: stringArray(row.booking_steps),
    },
    units,
    status: row.status,
    isFeatured: row.is_featured,
    updatedAt: row.updated_at,
  };
}

export type PropertyListOptions = {
  admin?: boolean;
  query?: string;
  city?: string;
  status?: string;
  page?: number;
  pageSize?: number;
};

export async function listProperties(options: PropertyListOptions = {}) {
  if (!hasSupabaseEnv()) {
    const filtered = fallbackProperties.filter((property) =>
      options.query
        ? `${property.title} ${property.location}`
            .toLowerCase()
            .includes(options.query.toLowerCase())
        : true,
    );
    return { data: filtered, total: filtered.length };
  }

  const supabase = await createClient();
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options.pageSize ?? 24));
  let query = supabase
    .from("properties")
    .select(propertySelect, { count: "exact" })
    .order("updated_at", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (!options.admin) query = query.eq("status", "published");
  if (options.status && options.status !== "all") {
    query = query.eq("status", options.status);
  }
  if (options.city && options.city !== "All locations") {
    query = query.ilike("city", `%${options.city}%`);
  }
  if (options.query) {
    const safeQuery = options.query.replace(/[^a-zA-Z0-9\s'-]/g, " ").trim();
    if (safeQuery) {
      query = query.or(
        `title.ilike.%${safeQuery}%,city.ilike.%${safeQuery}%,area.ilike.%${safeQuery}%`,
      );
    }
  }

  const { data, count, error } = await query;
  if (error) throw error;
  return {
    data: ((data ?? []) as unknown as PropertyRow[]).map(mapProperty),
    total: count ?? 0,
  };
}

export async function getPropertyBySlug(slug: string, admin = false) {
  if (!hasSupabaseEnv()) {
    return (
      fallbackProperties.find((property) => property.slug === slug) ?? null
    );
  }

  const supabase = await createClient();
  let query = supabase
    .from("properties")
    .select(propertySelect)
    .eq("slug", slug);
  if (!admin) query = query.eq("status", "published");
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data ? mapProperty(data as unknown as PropertyRow) : null;
}

export async function saveProperty(input: PropertyInput, userId: string) {
  const supabase = await createClient();
  const propertyPayload = {
    slug: input.slug,
    title: input.title,
    description: input.description,
    property_type: input.propertyType,
    managed_by: input.managedBy,
    address_line: input.addressLine || null,
    postcode: input.postcode || null,
    city: input.city,
    area: input.area || null,
    state: input.state,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    status: input.status,
    is_featured: input.isFeatured,
    transit_connections: input.transitConnections,
    updated_by: userId,
    published_at:
      input.status === "published" ? new Date().toISOString() : null,
  };

  const propertyResult = input.id
    ? await supabase
        .from("properties")
        .update(propertyPayload)
        .eq("id", input.id)
        .select("id, slug")
        .single()
    : await supabase
        .from("properties")
        .insert({ ...propertyPayload, created_by: userId })
        .select("id, slug")
        .single();

  if (propertyResult.error) throw propertyResult.error;
  const propertyId = propertyResult.data.id;

  const { data: existingOptions, error: existingOptionsError } = await supabase
    .from("rental_options")
    .select("id")
    .eq("property_id", propertyId);
  if (existingOptionsError) throw existingOptionsError;

  const optionRows = input.rentalOptions.map((option, index) => ({
    ...(option.id ? { id: option.id } : {}),
    property_id: propertyId,
    slug: option.slug,
    title: option.title,
    internal_code: option.internalCode || null,
    variant: option.variant || null,
    room_type: option.roomType,
    description: option.description,
    price_min: option.priceMin,
    price_max: option.priceMax ?? null,
    price_note: option.priceNote || null,
    bedrooms: option.bedrooms,
    bathrooms: option.bathrooms,
    area_sqft: option.areaSqft ?? null,
    bed_type: option.bedType || null,
    bathroom_type: option.bathroomType,
    furnished: option.furnished,
    availability: option.availability,
    quantity_available: option.quantityAvailable,
    status: option.status,
    sort_order: option.sortOrder ?? index,
    updated_by: userId,
    published_at:
      option.status === "published" ? new Date().toISOString() : null,
  }));

  const { data: savedOptions, error: optionsError } = await supabase
    .from("rental_options")
    .upsert(optionRows)
    .select("id");
  if (optionsError) throw optionsError;

  const savedIds = new Set((savedOptions ?? []).map((option) => option.id));
  const removedIds = (existingOptions ?? [])
    .map((option) => option.id)
    .filter((id) => !savedIds.has(id));
  if (removedIds.length) {
    const { error } = await supabase
      .from("rental_options")
      .delete()
      .in("id", removedIds);
    if (error) throw error;
  }

  const facilityNames = [
    ...new Set(input.facilities.map((name) => name.trim())),
  ]
    .filter(Boolean)
    .map((name) => ({ name, slug: slugify(name) }));
  const { error: deleteFacilityLinksError } = await supabase
    .from("property_facilities")
    .delete()
    .eq("property_id", propertyId);
  if (deleteFacilityLinksError) throw deleteFacilityLinksError;

  if (facilityNames.length) {
    const { data: savedFacilities, error: facilitiesError } = await supabase
      .from("facilities")
      .upsert(facilityNames, { onConflict: "slug" })
      .select("id, slug");
    if (facilitiesError) throw facilitiesError;

    const { error: facilityLinksError } = await supabase
      .from("property_facilities")
      .insert(
        (savedFacilities ?? []).map((facility, index) => ({
          property_id: propertyId,
          facility_id: facility.id,
          sort_order: index,
        })),
      );
    if (facilityLinksError) throw facilityLinksError;
  }

  return getPropertyBySlug(propertyResult.data.slug, true);
}

export function propertyToInput(property: Property): PropertyInput {
  return {
    id: property.id,
    slug: property.slug,
    title: property.title,
    description: property.description,
    propertyType: property.propertyType,
    managedBy: property.managedBy,
    addressLine: property.addressLine ?? "",
    postcode: property.postcode ?? "",
    city: property.city,
    area: property.area ?? "",
    state: property.state ?? "Selangor",
    latitude: property.latitude ?? null,
    longitude: property.longitude ?? null,
    status: property.status ?? "published",
    isFeatured: property.isFeatured ?? false,
    facilities: property.facilities,
    transitConnections: property.transitConnections,
    rentalOptions: property.units.map((unit, index) => ({
      id: unit.id,
      slug: unit.slug,
      title: unit.title,
      internalCode: unit.internalCode ?? "",
      variant: unit.variant ?? "",
      roomType: roomTypeValues[unit.roomType],
      description: unit.description,
      priceMin: unit.monthlyRent,
      priceMax: unit.maximumRent ?? null,
      priceNote: unit.priceNote ?? "",
      bedrooms: unit.bedrooms,
      bathrooms: unit.toilets,
      areaSqft: unit.areaSqft ?? (Number.parseInt(unit.area, 10) || null),
      bedType: unit.bedType ?? "",
      bathroomType: unit.bathroomType ?? "unspecified",
      furnished: unit.furnished,
      availability:
        unit.availability ?? (unit.available ? "available" : "occupied"),
      quantityAvailable: unit.quantityAvailable ?? (unit.available ? 1 : 0),
      status: unit.status ?? "published",
      sortOrder: index,
    })),
  };
}

// Homepage imagery needs only published development metadata, not rental units.
export async function listAreaDevelopments(): Promise<AreaDevelopment[]> {
  if (!hasSupabaseEnv())
    return fallbackProperties.map((property) => ({
      id: property.id ?? property.slug,
      title: property.title,
      city: property.city,
      area: property.area,
      image: property.image,
      gallery: property.gallery,
    }));
  const supabase = await createClient();
  const result: AreaDevelopment[] = [];
  for (let offset = 0; ; offset += 500) {
    const { data, error } = await supabase
      .from("properties")
      .select(
        "id, title, city, area, media_assets(bucket, object_path, is_cover, sort_order)",
      )
      .eq("status", "published")
      .order("title")
      .order("id")
      .range(offset, offset + 499);
    if (error) throw error;
    const rows = data as unknown as Array<{
      id: string;
      title: string;
      city: string;
      area: string | null;
      media_assets: MediaRow[] | null;
    }>;
    result.push(
      ...rows.map((row) => ({
        id: row.id,
        title: row.title,
        city: row.city,
        area: row.area,
        image: mediaUrl(row.media_assets) ?? "/estatein/property-villa.png",
        gallery: mediaGallery(row.media_assets),
      })),
    );
    if (rows.length < 500) break;
  }
  return result;
}
