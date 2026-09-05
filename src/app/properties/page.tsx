"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import SiteHeader from "@/components/site-header";
import { properties } from "@/lib/properties";

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
  ["Any budget", 0],
  ["Under $1M", 1000000],
  ["Under $2M", 2000000],
  ["Under $3M", 3000000],
] as const;

export default function PropertiesPage() {
  const [intent, setIntent] = useState("Buy");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [maxPrice, setMaxPrice] = useState(0);
  const [searched, setSearched] = useState(false);

  const filteredProperties = useMemo(
    () =>
      properties.filter((property) => {
        const matchesQuery = `${property.title} ${property.location}`
          .toLowerCase()
          .includes(query.trim().toLowerCase());
        const matchesType = type === "All" || property.type === type;
        const matchesPrice = maxPrice === 0 || property.price <= maxPrice;
        return matchesQuery && matchesType && matchesPrice;
      }),
    [maxPrice, query, type],
  );

  return (
    <main className="listing-page">
      <div className="announcement-bar">
        <span>✨ Discover Your Dream Property with Estatein</span>
        <Link href="/about">
          Learn More <ArrowIcon />
        </Link>
      </div>
      <SiteHeader active="properties" />

      <section className="listing-hero">
        <div className="listing-hero-copy">
          <span className="section-kicker">PROPERTY COLLECTION</span>
          <h1>
            Find a place that feels like <span>yours.</span>
          </h1>
          <p>
            Explore our handpicked selection of homes and investment
            opportunities, each chosen to make your next move feel clear.
          </p>
        </div>
        <search className="search-panel" aria-label="Search properties">
          <div
            className="search-tabs"
            role="tablist"
            aria-label="Listing intent"
          >
            <button
              type="button"
              className={intent === "Buy" ? "is-selected" : ""}
              onClick={() => setIntent("Buy")}
            >
              Buy
            </button>
            <button
              type="button"
              className={intent === "Rent" ? "is-selected" : ""}
              onClick={() => setIntent("Rent")}
            >
              Rent
            </button>
          </div>
          <div className="search-row">
            <label>
              <span>Location or keyword</span>
              <div className="input-with-icon">
                <SearchIcon />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="e.g. Malibu, villa"
                />
              </div>
            </label>
            <label>
              <span>Property type</span>
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
              >
                <option>All</option>
                <option>Villas</option>
                <option>Apartments</option>
                <option>Houses</option>
              </select>
            </label>
            <label>
              <span>Price range</span>
              <select
                value={maxPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
              >
                {prices.map(([label, value]) => (
                  <option value={value} key={label}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="button button-primary search-submit"
              onClick={() => setSearched(true)}
            >
              Search <SearchIcon />
            </button>
          </div>
          {searched && (
            <p className="search-feedback" aria-live="polite">
              Showing {filteredProperties.length} {intent.toLowerCase()}{" "}
              {filteredProperties.length === 1 ? "property" : "properties"}{" "}
              matching your search.
            </p>
          )}
        </search>
      </section>

      <section className="listing-results content-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">EXPLORE LISTINGS</span>
            <h2>{filteredProperties.length} properties waiting for you</h2>
          </div>
          <p>
            Refine your search anytime. Every listing includes the details you
            need to take the next step with confidence.
          </p>
        </div>
        <div className="listing-toolbar">
          <div className="listing-filters">
            {["All", "Villas", "Apartments", "Houses"].map((filter) => (
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
                <Link
                  className="property-image"
                  href={`/properties/${property.slug}`}
                >
                  <Image
                    src={property.image}
                    alt={property.title}
                    fill
                    sizes="(max-width: 760px) 100vw, 33vw"
                  />
                  <span>{property.type}</span>
                </Link>
                <div className="property-content">
                  <span className="property-location">{property.location}</span>
                  <h3>{property.title}</h3>
                  <p>{property.description}</p>
                  <div className="property-details">
                    <span>{property.beds} Beds</span>
                    <span>{property.baths} Baths</span>
                    <strong>${property.price.toLocaleString()}</strong>
                  </div>
                  <Link
                    className="property-button"
                    href={`/properties/${property.slug}`}
                  >
                    View Property Details <ArrowIcon />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-results">
            <h3>No properties match those filters.</h3>
            <p>Try a different location, property type, or price range.</p>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                setQuery("");
                setType("All");
                setMaxPrice(0);
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      <section className="contact-cta listing-cta">
        <div>
          <span className="section-kicker">NEED A LITTLE HELP?</span>
          <h2>Let&apos;s find the right fit together.</h2>
          <p>
            Share what you are looking for and an Estatein advisor will curate a
            shortlist for you.
          </p>
        </div>
        <Link className="button button-primary" href="/contact">
          Talk to an Advisor <ArrowIcon />
        </Link>
      </section>
    </main>
  );
}
