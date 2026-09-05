"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
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
  ["Any budget", 0],
  ["Under RM600", 600],
  ["Under RM1,000", 1000],
  ["Under RM1,600", 1600],
  ["Under RM2,200", 2200],
] as const;

export default function PropertiesPage() {
  const [furnishedOnly, setFurnishedOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [city, setCity] = useState("All locations");
  const [maxPrice, setMaxPrice] = useState(0);
  const [searched, setSearched] = useState(false);

  const filteredProperties = useMemo(
    () =>
      properties.filter((property) => {
        const matchesQuery =
          `${property.title} ${property.location} ${property.roomType}`
            .toLowerCase()
            .includes(query.trim().toLowerCase());
        const matchesType = type === "All" || property.roomType === type;
        const matchesCity = city === "All locations" || property.city === city;
        const matchesPrice = maxPrice === 0 || property.monthlyRent <= maxPrice;
        const matchesFurnished = !furnishedOnly || property.furnished;
        return (
          matchesQuery &&
          matchesType &&
          matchesCity &&
          matchesPrice &&
          matchesFurnished
        );
      }),
    [city, furnishedOnly, maxPrice, query, type],
  );

  return (
    <main className="listing-page">
      <div className="announcement-bar">
        <span>✨ Rent smarter. Live better with RentDeer.</span>
        <Link href="/about">
          Learn More <ArrowIcon />
        </Link>
      </div>
      <SiteHeader active="properties" />

      <section className="listing-hero">
        <div className="listing-hero-copy">
          <span className="section-kicker">FIND YOUR NEW STAY</span>
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
              Showing {filteredProperties.length} rental{" "}
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
            <h2>{filteredProperties.length} stays waiting for you</h2>
          </div>
          <p>
            Refine by room type, city, and monthly budget. Every listing is
            built around the details renters need to decide with confidence.
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
                  <span>{property.roomType}</span>
                </Link>
                <div className="property-content">
                  <span className="property-location">{property.city}</span>
                  <h3>{property.title}</h3>
                  <p>{property.description}</p>
                  <div className="property-details">
                    <span>{property.bedrooms} Bedroom</span>
                    <span>{property.toilets} Toilet</span>
                    <strong>
                      RM{property.monthlyRent.toLocaleString()} / month
                    </strong>
                  </div>
                  <Link
                    className="property-button"
                    href={`/properties/${property.slug}`}
                  >
                    View Rental Details <ArrowIcon />
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
                setMaxPrice(0);
                setFurnishedOnly(false);
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
          <h2>Let&apos;s find your next stay together.</h2>
          <p>
            Share what you are looking for and a RentDeer advisor will curate a
            shortlist for you.
          </p>
        </div>
        <Link className="button button-primary" href="/contact">
          Talk to RentDeer <ArrowIcon />
        </Link>
      </section>
    </main>
  );
}
