import { localAreas, matchesPropertyLocation } from "./local-areas";
import { type Property, roomTypes } from "./properties";

export const LISTINGS_PAGE_SIZE = 9;
export const roomTypeDatabaseValues: Record<string, string> = {
  "Master Bedroom": "master_bedroom",
  "Medium Bedroom": "medium_bedroom",
  "Single Bedroom": "single_bedroom",
  "Small Room": "small_room",
  "Soho/Studio": "soho_studio",
  "Whole Unit": "whole_unit",
};

export type PropertySearch = {
  query: string;
  city: string;
  type: string;
  minPrice: number;
  maxPrice: number;
  furnishedOnly: boolean;
};

export const defaultPropertySearch: PropertySearch = {
  query: "",
  city: "All locations",
  type: "All",
  minPrice: 0,
  maxPrice: 0,
  furnishedOnly: false,
};

export function positiveInteger(
  value: unknown,
  fallback: number,
  max = 1_000_000,
) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0
    ? Math.min(number, max)
    : fallback;
}

export function readPropertySearch(params: Pick<URLSearchParams, "get">) {
  const area = localAreas.find((item) => item.key === params.get("area"));
  const budget = (params.get("budget") ?? "").split("-").map(Number);
  const validBudget =
    budget.length === 2 &&
    budget.every((value) => Number.isFinite(value) && value >= 0) &&
    (budget[1] === 0 || budget[1] >= budget[0]);
  const type = params.get("type");
  return {
    query: (params.get("query") ?? "").trim().slice(0, 200),
    city: area?.name ?? params.get("city") ?? "All locations",
    type: roomTypes.find((item) => item === type) ?? "All",
    minPrice: validBudget ? budget[0] : 0,
    maxPrice: validBudget ? budget[1] : 0,
    furnishedOnly: params.get("furnished") === "true",
  };
}

export function propertySearchParams(filters: PropertySearch, page = 1) {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set("query", filters.query.trim());
  if (filters.city !== "All locations") params.set("city", filters.city);
  if (filters.type !== "All") params.set("type", filters.type);
  if (filters.minPrice || filters.maxPrice)
    params.set("budget", `${filters.minPrice}-${filters.maxPrice}`);
  if (filters.furnishedOnly) params.set("furnished", "true");
  if (page > 1) params.set("page", String(page));
  return params;
}

// Quote values as PostgREST literals, so commas/parentheses cannot alter a filter.
const literal = (value: string) =>
  `"${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;

export function propertyLocationFilter(selected: string) {
  if (!selected || selected === "All locations") return null;
  const area = localAreas.find(
    (item) => item.key === selected || item.name === selected,
  );
  const regionAreas = localAreas.filter((item) => item.region === selected);
  if (!area && !regionAreas.length) {
    return `city.ilike.${literal(selected)},area.ilike.${literal(selected)}`;
  }
  const names = area ? [area.name] : regionAreas.map((item) => item.name);
  // A known area takes precedence over a legacy city name, matching the homepage catalog.
  const unknownArea = `or(area.is.null,and(${localAreas.map((item) => `area.not.ilike.${literal(item.name)}`).join(",")}))`;
  const fallbackCities = area ? names : [...names, selected];
  return [
    ...names.map((name) => `area.ilike.${literal(name)}`),
    `and(${unknownArea},or(${fallbackCities.map((name) => `city.ilike.${literal(name)}`).join(",")}))`,
  ].join(",");
}

export function safePropertyKeyword(value = "") {
  return value
    .replace(/[^\p{L}\p{N}\s'-]/gu, " ")
    .trim()
    .slice(0, 200);
}

export function filterFallbackProperties(
  properties: Property[],
  filters: PropertySearch,
  admin = false,
) {
  const keyword = safePropertyKeyword(filters.query).toLowerCase();
  return properties.filter((property) => {
    if (!admin && property.status && property.status !== "published")
      return false;
    const units = property.units.filter(
      (unit) => admin || !unit.status || unit.status === "published",
    );
    const text =
      `${property.title} ${property.location} ${property.city} ${property.propertyType} ${units.map((unit) => `${unit.title} ${unit.roomType}`).join(" ")}`.toLowerCase();
    const requiresUnit =
      filters.type !== "All" ||
      filters.minPrice > 0 ||
      filters.maxPrice > 0 ||
      filters.furnishedOnly;
    return (
      text.includes(keyword) &&
      matchesPropertyLocation(property, filters.city) &&
      (!requiresUnit ||
        units.some(
          (unit) =>
            (filters.type === "All" || unit.roomType === filters.type) &&
            unit.monthlyRent >= filters.minPrice &&
            (!filters.maxPrice || unit.monthlyRent <= filters.maxPrice) &&
            (!filters.furnishedOnly || unit.furnished),
        ))
    );
  });
}

// Keep the control compact even with thousands of listings (including on phones).
export function paginationItems(
  page: number,
  totalPages: number,
): (number | "start-gap" | "end-gap")[] {
  if (totalPages <= 5)
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (page <= 3) return [1, 2, 3, "end-gap", totalPages];
  if (page >= totalPages - 2)
    return [1, "start-gap", totalPages - 2, totalPages - 1, totalPages];
  return [1, "start-gap", page, "end-gap", totalPages];
}
