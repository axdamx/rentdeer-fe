"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import ResultsPagination from "@/components/results-pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/lib/api-client";
import { roomTypes } from "@/lib/properties";
import {
  availabilityLabels,
  enquiryHref,
  RENTAL_OPTIONS_PAGE_SIZE,
  type RentalOptionFilters,
  type RentalOptionsResponse,
  readRentalOptionFilters,
  rentalAvailability,
  rentalPrice,
} from "@/lib/rental-options";

export default function RentalOptionsBrowser({
  propertySlug,
  propertyTitle,
  totalOptions,
}: {
  propertySlug: string;
  propertyTitle: string;
  totalOptions: number;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const filters = readRentalOptionFilters(searchParams);
  const sectionRef = useRef<HTMLElement>(null);
  const apiParams = new URLSearchParams({
    roomType: filters.type,
    availability: filters.availability,
    optionsPage: String(filters.page),
  });
  const optionsQuery = useQuery({
    queryKey: ["rental-options", propertySlug, apiParams.toString()],
    queryFn: ({ signal }) =>
      apiRequest<RentalOptionsResponse>(
        `/api/properties/${encodeURIComponent(propertySlug)}/rental-options?${apiParams}`,
        { signal },
      ),
  });
  const data = optionsQuery.data;
  const hrefFor = (next: RentalOptionFilters) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const key of ["roomType", "availability", "optionsPage"])
      params.delete(key);
    if (next.type !== "All") params.set("roomType", next.type);
    if (next.availability !== "all")
      params.set("availability", next.availability);
    if (next.page > 1) params.set("optionsPage", String(next.page));
    return `${pathname}${params.size ? `?${params}` : ""}#rental-options`;
  };
  const navigate = (next: RentalOptionFilters) => {
    window.history.pushState(null, "", hrefFor(next));
    sectionRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start",
    });
  };
  const normalizedHref = hrefFor({
    ...filters,
    page: data?.page ?? filters.page,
  });
  useEffect(() => {
    if (data && data.page !== filters.page)
      window.history.replaceState(null, "", normalizedHref);
  }, [data, filters.page, normalizedHref]);

  return (
    <section
      className="detail-units-section rd-detail-green-section content-section"
      id="rental-options"
      ref={sectionRef}
    >
      <div className="section-heading">
        <div>
          <span className="rd-script-label">Rental options</span>
          <h2>Choose the way you want to live here.</h2>
        </div>
        <p>
          Compare rooms and units at {propertyTitle}. Find the layout and
          availability that suit your next move.
        </p>
      </div>
      <div className="rental-options-toolbar">
        <p>
          {totalOptions} rental {totalOptions === 1 ? "option" : "options"} at
          this residence
        </p>
        <div className="rental-option-filters">
          <div>
            <span id="rental-type-label">Room type</span>
            <Select
              value={filters.type}
              onValueChange={(value) => {
                if (value) navigate({ ...filters, type: value, page: 1 });
              }}
              items={[
                { value: "All", label: "All room types" },
                ...roomTypes.map((type) => ({ value: type, label: type })),
              ]}
            >
              <SelectTrigger aria-labelledby="rental-type-label">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All room types</SelectItem>
                {roomTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <span id="rental-availability-label">Availability</span>
            <Select
              value={filters.availability}
              onValueChange={(value) => {
                if (value)
                  navigate({ ...filters, availability: value, page: 1 });
              }}
              items={[
                { value: "all", label: "All availability" },
                ...Object.entries(availabilityLabels).map(([value, label]) => ({
                  value,
                  label,
                })),
              ]}
            >
              <SelectTrigger aria-labelledby="rental-availability-label">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All availability</SelectItem>
                {Object.entries(availabilityLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {optionsQuery.isPending ? (
        <div className="rental-options-empty" aria-live="polite">
          Loading rental options...
        </div>
      ) : optionsQuery.isError ? (
        <div className="rental-options-empty" role="alert">
          <p>We could not load the rental options.</p>
          <button
            type="button"
            className="rd-yellow-button"
            onClick={() => optionsQuery.refetch()}
          >
            Try again
          </button>
        </div>
      ) : !data?.data.length ? (
        <div className="rental-options-empty">
          <h3>No rental options match these filters.</h3>
          <p>Try another room type or check all availability.</p>
          <button
            type="button"
            className="rd-yellow-button"
            onClick={() =>
              navigate({ type: "All", availability: "all", page: 1 })
            }
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="unit-grid">
            {data.data.map((unit) => (
              <article className="unit-card" key={unit.slug}>
                <div className="unit-card-image">
                  <Image
                    src={unit.image}
                    alt={unit.title}
                    fill
                    sizes="(max-width: 700px) 100vw, 33vw"
                  />
                  <span
                    className={
                      unit.available
                        ? "unit-status"
                        : "unit-status is-unavailable"
                    }
                  >
                    {rentalAvailability(unit)}
                  </span>
                </div>
                <div className="unit-card-content">
                  <span className="property-location">{unit.roomType}</span>
                  <h3>{unit.title}</h3>
                  <p>{unit.description}</p>
                  <div className="unit-card-footer">
                    <div className="unit-card-meta">
                      <span>
                        {unit.bedrooms}{" "}
                        {unit.bedrooms === 1 ? "bedroom" : "bedrooms"}
                      </span>
                      <span>
                        {unit.toilets}{" "}
                        {unit.toilets === 1 ? "toilet" : "toilets"}
                      </span>
                      <span>{unit.area}</span>
                    </div>
                    <div className="unit-card-bottom">
                      <strong>
                        {rentalPrice(unit)} <small>/ month</small>
                      </strong>
                      <div className="unit-card-actions">
                        <Link
                          className="unit-card-view"
                          href={`/properties/${propertySlug}/units/${unit.slug}`}
                        >
                          View details <ArrowRight aria-hidden="true" />
                        </Link>
                        <Link
                          className="button button-secondary"
                          href={enquiryHref(propertySlug, unit.slug)}
                        >
                          Enquire <ArrowRight aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <ResultsPagination
            page={data.page}
            total={data.total}
            pageSize={RENTAL_OPTIONS_PAGE_SIZE}
            noun="rental options"
            label="Rental option pages"
            className="rental-pagination"
            pageHref={(page) => hrefFor({ ...filters, page })}
            onNavigate={(page) => navigate({ ...filters, page })}
          />
        </>
      )}
    </section>
  );
}
