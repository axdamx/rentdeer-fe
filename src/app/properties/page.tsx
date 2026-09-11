"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import PropertyGallery from "@/components/property-gallery";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { cities, properties, roomTypes } from "@/lib/properties";

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

const regionCities: Record<string, string[]> = {
  "Kuala Lumpur": ["Kuala Lumpur", "Cheras", "Kepong", "Sentul"],
  "Petaling Jaya": [
    "Petaling Jaya",
    "Ara Damansara",
    "Damansara Damai",
    "Kelana Jaya",
    "Kota Damansara",
  ],
  Puchong: ["Puchong", "Seri Kembangan"],
};

export default function PropertiesPage() {
  const [furnishedOnly, setFurnishedOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [city, setCity] = useState("All locations");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get("query") ?? "";
    const searchCity = params.get("city") ?? "All locations";
    const budget = params.get("budget")?.split("-").map(Number) ?? [];

    setQuery(searchQuery);
    setCity(searchCity);
    if (
      budget.length === 2 &&
      budget.every((value) => Number.isFinite(value))
    ) {
      setMinPrice(budget[0]);
      setMaxPrice(budget[1]);
    }
    setSearched(
      Boolean(searchQuery || params.get("city") || params.get("budget")),
    );
  }, []);

  const filteredProperties = useMemo(
    () =>
      properties.filter((property) => {
        const matchesQuery =
          `${property.title} ${property.location} ${property.city} ${property.propertyType} ${property.units.map((unit) => `${unit.title} ${unit.roomType}`).join(" ")}`
            .toLowerCase()
            .includes(query.trim().toLowerCase());
        const matchesType =
          type === "All" ||
          property.units.some((unit) => unit.roomType === type);
        const selectedRegionCities = regionCities[city] ?? [city];
        const matchesCity =
          city === "All locations" ||
          selectedRegionCities.some(
            (location) =>
              property.city.includes(location) ||
              property.location.includes(location),
          ) ||
          ["Kuala Lumpur", "Puchong"].includes(city);
        const matchesPrice =
          (minPrice === 0 && maxPrice === 0) ||
          property.units.some(
            (unit) =>
              unit.monthlyRent >= minPrice && unit.monthlyRent <= maxPrice,
          );
        const matchesFurnished =
          !furnishedOnly || property.units.some((unit) => unit.furnished);
        return (
          matchesQuery &&
          matchesType &&
          matchesCity &&
          matchesPrice &&
          matchesFurnished
        );
      }),
    [city, furnishedOnly, maxPrice, minPrice, query, type],
  );

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
                onClick={() => setFurnishedOnly(false)}
              >
                All stays
              </button>
              <button
                type="button"
                className={furnishedOnly ? "is-selected" : ""}
                onClick={() => setFurnishedOnly(true)}
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
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="e.g. Damansara, master room"
                  />
                </div>
              </label>
              <label>
                <span>City</span>
                <select
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                >
                  <option>All locations</option>
                  <option>Kuala Lumpur</option>
                  <option>Petaling Jaya</option>
                  <option>Puchong</option>
                  {cities.map((location) => (
                    <option key={location}>{location}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Room type</span>
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
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
                    setMinPrice(minimum);
                    setMaxPrice(maximum);
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
                onClick={() => setSearched(true)}
              >
                Search <SearchIcon />
              </button>
            </div>
            {searched && (
              <p className="search-feedback" aria-live="polite">
                Showing {filteredProperties.length} rental{" "}
                {filteredProperties.length === 1 ? "property" : "properties"}{" "}
                matching your search.
              </p>
            )}
          </search>
        </div>
      </section>

      <section className="listing-results content-section">
        <div className="section-heading">
          <div>
            <span className="rd-script-label">Explore listings</span>
            <h2>{filteredProperties.length} properties to explore</h2>
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
                className={type === filter ? "is-selected" : ""}
                onClick={() => setType(filter)}
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
        {filteredProperties.length > 0 ? (
          <div className="property-grid listing-grid">
            {filteredProperties.map((property) => (
              <article className="property-card" key={property.slug}>
                <PropertyGallery
                  className="property-image"
                  images={property.gallery}
                  alt={property.title}
                  label={`${property.units.length} rental options`}
                />
                <div className="property-content">
                  <span className="property-location">{property.location}</span>
                  <h3>{property.title}</h3>
                  <p>{property.description}</p>
                  <div className="property-details">
                    <span>{property.propertyType}</span>
                    <span>{property.facilities.length} facilities</span>
                    <strong>
                      From RM
                      {Math.min(
                        ...property.units.map((unit) => unit.monthlyRent),
                      ).toLocaleString()}{" "}
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
        ) : (
          <div className="empty-results">
            <h3>No properties match those filters.</h3>
            <p>Try a different city, room type, or monthly budget.</p>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                setQuery("");
                setType("All");
                setCity("All locations");
                setMinPrice(0);
                setMaxPrice(0);
                setFurnishedOnly(false);
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

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
