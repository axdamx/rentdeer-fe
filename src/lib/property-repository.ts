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
import {
  defaultPropertySearch,
  filterFallbackProperties,
  positiveInteger,
  propertyLocationFilter,
  roomTypeDatabaseValues,
  safePropertyKeyword,
} from "@/lib/property-search";
import {
  type EnquiryContext,
  paginateRentalOptions,
  RENTAL_OPTIONS_PAGE_SIZE,
  type RentalOptionFilters,
  type RentalOptionsResponse,
  rentalAvailability,
  rentalPrice,
} from "@/lib/rental-options";
import { createClient } from "@/lib/supabase/server";

const propertyBaseSelect = `
  *,
  property_facilities(sort_order, facilities(name)),
  property_nearby_places(id, label, distance, sort_order),
  media_assets(id, bucket, object_path, alt_text, is_cover, sort_order)
`;

const propertySelect = `${propertyBaseSelect},
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

function mapRentalOption(
  option: RentalOptionRow,
  propertyImage: string,
): Property["units"][number] {
  return {
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
    area: option.area_sqft ? `${option.area_sqft} sq. ft.` : "Size on request",
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
  };
}

function mapProperty(row: PropertyRow): Property {
  const propertyImage =
    mediaUrl(row.media_assets) ?? "/estatein/property-villa.png";
  const gallery = mediaGallery(row.media_assets);
  const units = [...(row.rental_options ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((option) => mapRentalOption(option, propertyImage));

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
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  furnishedOnly?: boolean;
};

export async function listProperties(options: PropertyListOptions = {}) {
  const requestedPage = positiveInteger(options.page, 1);
  const pageSize = positiveInteger(options.pageSize, 24, 100);
  const filters = {
    ...defaultPropertySearch,
    query: options.query ?? "",
    city: options.city ?? "All locations",
    type:
      options.type && Object.hasOwn(roomTypeDatabaseValues, options.type)
        ? options.type
        : "All",
    minPrice: Math.max(0, options.minPrice || 0),
    maxPrice: Math.max(0, options.maxPrice || 0),
    furnishedOnly: options.furnishedOnly ?? false,
  };
  if (!hasSupabaseEnv()) {
    const filtered = filterFallbackProperties(
      fallbackProperties,
      filters,
      options.admin,
    ).filter(
      (property) =>
        !options.status ||
        options.status === "all" ||
        property.status === options.status,
    );
    const page = Math.min(
      requestedPage,
      Math.max(1, Math.ceil(filtered.length / pageSize)),
    );
    return {
      data: filtered.slice((page - 1) * pageSize, page * pageSize),
      total: filtered.length,
      page,
      pageSize,
    };
  }

  const supabase = await createClient();
  const keyword = safePropertyKeyword(filters.query);
  const requiresUnit =
    filters.type !== "All" ||
    filters.minPrice > 0 ||
    filters.maxPrice > 0 ||
    filters.furnishedOnly;
  // Separate filter embeds preserve all rental options on the displayed property.
  const select =
    propertySelect +
    (requiresUnit ? ", matching_rentals:rental_options!inner(id)" : "") +
    (keyword ? ", search_rentals:rental_options(id)" : "");
  let query = supabase.from("properties").select(select, { count: "exact" });

  if (!options.admin)
    query = query
      .order("is_featured", { ascending: false })
      .eq("rental_options.status", "published");
  query = query
    .order("updated_at", { ascending: false })
    .order("id", { ascending: true });

  if (!options.admin) query = query.eq("status", "published");
  if (options.status && options.status !== "all") {
    query = query.eq("status", options.status);
  }
  const locationFilter = propertyLocationFilter(filters.city);
  if (locationFilter) query = query.or(locationFilter);
  if (requiresUnit) {
    if (!options.admin)
      query = query.eq("matching_rentals.status", "published");
    if (filters.type !== "All")
      query = query.eq(
        "matching_rentals.room_type",
        roomTypeDatabaseValues[filters.type],
      );
    if (filters.minPrice)
      query = query.gte("matching_rentals.price_min", filters.minPrice);
    if (filters.maxPrice)
      query = query.lte("matching_rentals.price_min", filters.maxPrice);
    if (filters.furnishedOnly)
      query = query.eq("matching_rentals.furnished", true);
  }
  if (keyword) {
    if (!options.admin) query = query.eq("search_rentals.status", "published");
    const matchingTypes = Object.entries(roomTypeDatabaseValues)
      .filter(([label]) => label.toLowerCase().includes(keyword.toLowerCase()))
      .map(([, value]) => value);
    query = query.or(
      `title.ilike.%${keyword}%${matchingTypes.length ? `,room_type.in.(${matchingTypes.join(",")})` : ""}`,
      { referencedTable: "search_rentals" },
    );
    query = query.or(
      `title.ilike.%${keyword}%,address_line.ilike.%${keyword}%,city.ilike.%${keyword}%,area.ilike.%${keyword}%,property_type.ilike.%${keyword}%,search_rentals.not.is.null`,
    );
  }

  const { data, count, error } = await query.range(
    (requestedPage - 1) * pageSize,
    requestedPage * pageSize - 1,
  );
  // PostgREST returns 416 when a saved page is beyond the current result set.
  if (error?.code === "PGRST103" && requestedPage > 1) {
    return listProperties({ ...options, page: 1, pageSize });
  }
  if (error) throw error;
  const page = Math.min(
    requestedPage,
    Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  );
  // A bookmarked page can disappear after listings are archived or filters change.
  if (page !== requestedPage && count)
    return listProperties({ ...options, page, pageSize });
  return {
    data: ((data ?? []) as unknown as PropertyRow[]).map(mapProperty),
    total: count ?? 0,
    page,
    pageSize,
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
  if (!admin)
    query = query
      .eq("status", "published")
      .eq("rental_options.status", "published");
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data ? mapProperty(data as unknown as PropertyRow) : null;
}

// The detail page needs aggregate figures, not every room and its media.
export async function getPropertyOverviewBySlug(slug: string) {
  if (!hasSupabaseEnv()) {
    const property = fallbackProperties.find(
      (item) =>
        item.slug === slug && (!item.status || item.status === "published"),
    );
    if (!property) return null;
    const units = property.units.filter(
      (unit) => !unit.status || unit.status === "published",
    );
    return {
      property: { ...property, units: [] },
      total: units.length,
      available: units.filter((unit) => unit.available).length,
      startingPrice: units.length
        ? Math.min(...units.map((unit) => unit.monthlyRent))
        : null,
    };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select(propertyBaseSelect)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const property = mapProperty(data as unknown as PropertyRow);
  const options = () =>
    supabase
      .from("rental_options")
      .select("id", { count: "exact", head: true })
      .eq("property_id", property.id)
      .eq("status", "published");
  const [total, available, cheapest] = await Promise.all([
    options(),
    options().eq("availability", "available"),
    supabase
      .from("rental_options")
      .select("price_min")
      .eq("property_id", property.id)
      .eq("status", "published")
      .order("price_min", { ascending: true })
      .limit(1),
  ]);
  for (const result of [total, available, cheapest])
    if (result.error) throw result.error;
  return {
    property,
    total: total.count ?? 0,
    available: available.count ?? 0,
    startingPrice:
      (cheapest.data?.[0]?.price_min as number | undefined) ?? null,
  };
}

export async function listRentalOptions(
  slug: string,
  filters: RentalOptionFilters,
): Promise<RentalOptionsResponse | null> {
  if (!hasSupabaseEnv()) {
    const property = fallbackProperties.find(
      (item) =>
        item.slug === slug && (!item.status || item.status === "published"),
    );
    return property ? paginateRentalOptions(property.units, filters) : null;
  }
  const supabase = await createClient();
  const propertyResult = await supabase
    .from("properties")
    .select("id, media_assets(bucket, object_path, is_cover, sort_order)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (propertyResult.error) throw propertyResult.error;
  if (!propertyResult.data) return null;
  const property = propertyResult.data;
  let query = supabase
    .from("rental_options")
    .select("*, media_assets(bucket, object_path, is_cover, sort_order)", {
      count: "exact",
    })
    .eq("property_id", property.id)
    .eq("status", "published")
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });
  if (filters.type !== "All")
    query = query.eq("room_type", roomTypeDatabaseValues[filters.type]);
  if (filters.availability !== "all")
    query = query.eq("availability", filters.availability);
  const { data, count, error } = await query.range(
    (filters.page - 1) * RENTAL_OPTIONS_PAGE_SIZE,
    filters.page * RENTAL_OPTIONS_PAGE_SIZE - 1,
  );
  if (error?.code === "PGRST103" && filters.page > 1)
    return listRentalOptions(slug, { ...filters, page: 1 });
  if (error) throw error;
  return {
    data: ((data ?? []) as unknown as RentalOptionRow[]).map((unit) =>
      mapRentalOption(
        unit,
        mediaUrl(property.media_assets) ?? "/estatein/property-villa.png",
      ),
    ),
    total: count ?? 0,
    page: count ? filters.page : 1,
    pageSize: RENTAL_OPTIONS_PAGE_SIZE,
  };
}

// Resolve the exact published property/room pair before preparing an enquiry.
export async function getEnquiryContext(
  propertySlug: string,
  rentalOptionSlug = "",
): Promise<EnquiryContext | null> {
  if (!hasSupabaseEnv()) {
    const property = fallbackProperties.find(
      (item) =>
        item.slug === propertySlug &&
        (!item.status || item.status === "published"),
    );
    if (!property) return null;
    const unit = property.units.find(
      (item) =>
        item.slug === rentalOptionSlug &&
        (!item.status || item.status === "published"),
    );
    if (rentalOptionSlug && !unit) return null;
    return {
      propertySlug: property.slug,
      propertyTitle: property.title,
      location: property.location,
      rentalOptionSlug: unit?.slug ?? "",
      ...(unit
        ? {
            unitTitle: unit.title,
            roomType: unit.roomType,
            price: rentalPrice(unit),
            availability: rentalAvailability(unit),
            furnished: unit.furnished,
          }
        : {}),
    };
  }
  const supabase = await createClient();
  const { data: property, error } = await supabase
    .from("properties")
    .select("id, slug, title, address_line, area, city")
    .eq("slug", propertySlug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  if (!property) return null;
  const context: EnquiryContext = {
    propertySlug: property.slug,
    propertyTitle: property.title,
    location: [property.address_line, property.area, property.city]
      .filter(Boolean)
      .join(", "),
    rentalOptionSlug: "",
  };
  if (!rentalOptionSlug) return context;
  const result = await supabase
    .from("rental_options")
    .select(
      "slug, title, room_type, price_min, price_max, furnished, availability",
    )
    .eq("property_id", property.id)
    .eq("slug", rentalOptionSlug)
    .eq("status", "published")
    .maybeSingle();
  if (result.error) throw result.error;
  if (!result.data) return null;
  const unit = result.data;
  return {
    ...context,
    rentalOptionSlug: unit.slug,
    unitTitle: unit.title,
    roomType: roomTypeLabels[unit.room_type],
    price: rentalPrice({
      monthlyRent: unit.price_min,
      maximumRent: unit.price_max ?? undefined,
    }),
    availability: rentalAvailability({
      available: unit.availability === "available",
      availability: unit.availability,
    }),
    furnished: unit.furnished,
  };
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
