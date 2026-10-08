"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type MouseEvent, Suspense, useEffect, useRef, useState } from "react";
import PropertyGallery from "@/components/property-gallery";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import TransitPropertyExplorer from "@/components/transit-property-explorer";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { apiRequest } from "@/lib/api-client";
import { cities, type Property, roomTypes } from "@/lib/properties";
import {
  defaultPropertySearch,
  LISTINGS_PAGE_SIZE,
  type PropertySearch,
  paginationItems,
  positiveInteger,
  propertySearchParams,
  readPropertySearch,
} from "@/lib/property-search";
import { queryKeys } from "@/lib/query-keys";

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
    >
      <circle cx="10.8" cy="10.8" r="5.8" />
      <path d="m15.2 15.2 4.3 4.3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
    >
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

const prices = [
  ["Any budget", 0, 0],
  ["RM400 - RM699", 400, 699],
  ["RM700 - RM899", 700, 899],
  ["RM900 - RM1499", 900, 1499],
  ["RM1500 - RM1999", 1500, 1999],
  ["RM2000 - RM3000", 2000, 3000],
] as const;

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <main className="listing-page">
          <SiteHeader active="properties" tone="dark" />
          <div className="empty-results">Loading available properties...</div>
        </main>
      }
    >
      <PropertiesBrowser />
    </Suspense>
  );
}

function PropertiesBrowser() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const applied = readPropertySearch(searchParams);
  const requestedPage = positiveInteger(searchParams.get("page"), 1);
  const [filters, setFilters] = useState(applied);
  const [previousSearchKey, setPreviousSearchKey] = useState(searchKey);
  // Keep the form in sync with links and browser back/forward navigation.
  if (previousSearchKey !== searchKey) {
    setPreviousSearchKey(searchKey);
    setFilters(applied);
  }
  const { query, city, type, minPrice, maxPrice, furnishedOnly } = filters;
  const resultsRef = useRef<HTMLElement>(null);
  const params = propertySearchParams(applied, requestedPage);
  params.set("pageSize", String(LISTINGS_PAGE_SIZE));
  const propertiesQuery = useQuery({
    queryKey: queryKeys.properties.list({ search: params.toString() }),
    queryFn: ({ signal }) =>
      apiRequest<{
        data: Property[];
        total: number;
        page: number;
        pageSize: number;
      }>(`/api/properties?${params}`, { signal }),
  });
  const properties = propertiesQuery.data?.data ?? [];
  const total = propertiesQuery.data?.total ?? 0;
  const page = propertiesQuery.data?.page ?? requestedPage;
  const totalPages = Math.max(1, Math.ceil(total / LISTINGS_PAGE_SIZE));
  const searched = Boolean(propertySearchParams(applied).toString());
  const updateFilters = (patch: Partial<PropertySearch>) =>
    setFilters((current) => ({ ...current, ...patch }));
  const pageHref = (target: number) => {
    const queryString = propertySearchParams(applied, target).toString();
    return `/properties${queryString ? `?${queryString}` : ""}`;
  };
  const scrollToResults = () =>
    requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    });
  const applyFilters = (next = filters) => {
    setFilters(next);
    const queryString = propertySearchParams(next).toString();
    router.push(`/properties${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
    scrollToResults();
  };
  const navigatePage = (
    event: MouseEvent<HTMLAnchorElement>,
    target: number,
  ) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    router.push(pageHref(target), { scroll: false });
    scrollToResults();
  };
  const normalizedHref = pageHref(page);
  useEffect(() => {
    if (propertiesQuery.data && page !== requestedPage)
      router.replace(normalizedHref, { scroll: false });
  }, [propertiesQuery.data, page, requestedPage, router, normalizedHref]);

  return (
    <main className="listing-page">
      <section className="listing-hero">
        <SiteHeader active="properties" tone="dark" />
        <div className="rd-page-hero-inner listing-hero-inner">
          <div className="listing-hero-copy">
            <span className="rd-script-label">Find your new stay</span>
            <h1>
              Find a room that feels like <span>home.</span>
            </h1>
            <p>
              Browse clean, affordable, ready-to-move-in rooms and units across
              Klang Valley, with the details you need before you enquire.
            </p>
          </div>
          <search className="search-panel" aria-label="Search properties">
            <div
              className="search-tabs"
              role="tablist"
              aria-label="Listing filters"
            >
              <button
                type="button"
                className={!furnishedOnly ? "is-selected" : ""}
                onClick={() =>
                  applyFilters({ ...filters, furnishedOnly: false })
                }
              >
                All stays
              </button>
              <button
                type="button"
                className={furnishedOnly ? "is-selected" : ""}
                onClick={() =>
                  applyFilters({ ...filters, furnishedOnly: true })
                }
              >
                Fully furnished
              </button>
            </div>
            <div className="search-row">
              <label>
                <span>Search keyword</span>
                <div className="input-with-icon">
                  <SearchIcon />
                  <input
                    value={query}
                    onChange={(event) =>
                      updateFilters({ query: event.target.value })
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") applyFilters();
                    }}
                    placeholder="e.g. Damansara, master room"
                  />
                </div>
              </label>
              <label>
                <span>City</span>
                <select
                  value={city}
                  onChange={(event) =>
                    updateFilters({ city: event.target.value })
                  }
                >
                  <option>All locations</option>
                  {cities.map((location) => (
                    <option key={location}>{location}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Room type</span>
                <select
                  value={type}
                  onChange={(event) =>
                    updateFilters({ type: event.target.value })
                  }
                >
                  <option>All</option>
                  {roomTypes.map((roomType) => (
                    <option key={roomType}>{roomType}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Monthly budget</span>
                <select
                  value={`${minPrice}-${maxPrice}`}
                  onChange={(event) => {
                    const [minimum, maximum] = event.target.value
                      .split("-")
                      .map(Number);
                    updateFilters({ minPrice: minimum, maxPrice: maximum });
                  }}
                >
                  {prices.map(([label, minimum, maximum]) => (
                    <option value={`${minimum}-${maximum}`} key={label}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                className="rd-yellow-button search-submit"
                onClick={() => applyFilters()}
              >
                Search <SearchIcon />
              </button>
            </div>
            {searched && (
              <p className="search-feedback" aria-live="polite">
                {propertiesQuery.isPending
                  ? "Searching available properties..."
                  : propertiesQuery.isError
                    ? "Unable to load matching properties."
                    : `${total} rental ${total === 1 ? "property matches" : "properties match"} your search.`}
              </p>
            )}
          </search>
        </div>
      </section>

      <section className="listing-results content-section" ref={resultsRef}>
        <div className="section-heading">
          <div>
            <span className="rd-script-label">Explore listings</span>
            <h2>
              {propertiesQuery.isPending
                ? "Finding your next stay..."
                : `${total} properties to explore`}
            </h2>
          </div>
          <p>
            Explore each residence first, then choose the room or unit that fits
            your budget and lifestyle.
          </p>
        </div>
        <div className="listing-toolbar">
          <div className="listing-filters">
            {["All", ...roomTypes].map((filter) => (
              <button
                type="button"
                className={applied.type === filter ? "is-selected" : ""}
                aria-pressed={applied.type === filter}
                onClick={() => applyFilters({ ...applied, type: filter })}
                key={filter}
              >
                {filter}
              </button>
            ))}
          </div>
          <span>
            Sorted by: <strong>Featured</strong>
          </span>
        </div>
        {propertiesQuery.isPending ? (
          <div className="empty-results">
            <h3>Loading available properties...</h3>
          </div>
        ) : propertiesQuery.isError ? (
          <div className="empty-results">
            <h3>We could not load the properties.</h3>
            <p>Please refresh the page or try again shortly.</p>
          </div>
        ) : properties.length > 0 ? (
          <>
            <div className="property-grid listing-grid">
              {properties.map((property) => (
                <article className="property-card" key={property.slug}>
                  <PropertyGallery
                    className="property-image"
                    images={property.gallery}
                    alt={property.title}
                    label={`${property.units.length} rental options`}
                  />
                  <div className="property-content">
                    <span className="property-location">
                      {property.location}
                    </span>
                    <h3>{property.title}</h3>
                    <p>{property.description}</p>
                    <div className="property-details">
                      <span>{property.propertyType}</span>
                      <span>{property.facilities.length} facilities</span>
                      <strong>
                        From RM
                        {property.units.length
                          ? Math.min(
                              ...property.units.map((unit) => unit.monthlyRent),
                            ).toLocaleString()
                          : "—"}{" "}
                        / month
                      </strong>
                    </div>
                    <Link
                      className="property-button"
                      href={`/properties/${property.slug}`}
                    >
                      Explore Property <ArrowIcon />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            <div className="listing-pagination">
              <p className="listing-page-count" aria-live="polite">
                Showing {(page - 1) * LISTINGS_PAGE_SIZE + 1}–
                {Math.min(page * LISTINGS_PAGE_SIZE, total)} of {total}{" "}
                properties
              </p>
              {totalPages > 1 && (
                <Pagination aria-label="Listing pages">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href={page > 1 ? pageHref(page - 1) : undefined}
                        aria-disabled={page === 1}
                        tabIndex={page === 1 ? -1 : undefined}
                        onClick={(event) => {
                          if (page > 1) navigatePage(event, page - 1);
                          else event.preventDefault();
                        }}
                      />
                    </PaginationItem>
                    {paginationItems(page, totalPages).map((item) => (
                      <PaginationItem key={item}>
                        {typeof item === "number" ? (
                          <PaginationLink
                            href={pageHref(item)}
                            isActive={page === item}
                            aria-label={`Page ${item}`}
                            onClick={(event) => navigatePage(event, item)}
                          >
                            {item}
                          </PaginationLink>
                        ) : (
                          <PaginationEllipsis />
                        )}
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href={
                          page < totalPages ? pageHref(page + 1) : undefined
                        }
                        aria-disabled={page === totalPages}
                        tabIndex={page === totalPages ? -1 : undefined}
                        onClick={(event) => {
                          if (page < totalPages) navigatePage(event, page + 1);
                          else event.preventDefault();
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          </>
        ) : (
          <div className="empty-results">
            <h3>No properties match those filters.</h3>
            <p>Try a different city, room type, or monthly budget.</p>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => applyFilters(defaultPropertySearch)}
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      <TransitPropertyExplorer properties={properties} currentPageOnly />

      <section className="rd-page-cta-section">
        <div className="about-cta listing-cta">
          <div>
            <span className="rd-script-label">Need a little help?</span>
            <h2>Let&apos;s find your next stay together.</h2>
            <p>
              Share what you are looking for and a RentDeer advisor will curate
              a shortlist for you.
            </p>
          </div>
          <Link className="rd-yellow-button" href="/contact">
            Talk to RentDeer <ArrowIcon />
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
