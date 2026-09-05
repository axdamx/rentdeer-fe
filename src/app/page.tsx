"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import SiteFooter from "@/components/site-footer";

type IconName =
  | "arrow"
  | "building"
  | "check"
  | "chevron"
  | "close"
  | "menu"
  | "search"
  | "spark";

function Icon({ name }: { name: IconName }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.6,
  };

  if (name === "arrow") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" {...common}>
        <path d="M5 12h13M13 6l6 6-6 6" />
      </svg>
    );
  }
  if (name === "building") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" {...common}>
        <path d="M4 20V5.5L12 3l8 2.5V20M8 8h1M8 12h1M8 16h1M12 8h1M12 12h1M12 16h1M16 8h1M16 12h1M16 16h1" />
      </svg>
    );
  }
  if (name === "check") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" {...common}>
        <path d="m5 12 4.5 4.5L19 7" />
      </svg>
    );
  }
  if (name === "chevron") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" {...common}>
        <path d="m7 10 5 5 5-5" />
      </svg>
    );
  }
  if (name === "close") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" {...common}>
        <path d="m6 6 12 12M18 6 6 18" />
      </svg>
    );
  }
  if (name === "menu") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" {...common}>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    );
  }
  if (name === "search") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" {...common}>
        <circle cx="10.8" cy="10.8" r="5.8" />
        <path d="m15.2 15.2 4.3 4.3" />
      </svg>
    );
  }
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" {...common}>
      <path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4" />
    </svg>
  );
}

const properties = [
  {
    title: "Fully Furnished Master Room",
    location: "Damansara Damai",
    type: "Master Bedroom",
    image: "/estatein/property-villa.png",
    price: "RM850 / month",
    beds: "1",
    baths: "1",
  },
  {
    title: "Bright Medium Room",
    location: "Kota Damansara",
    type: "Medium Bedroom",
    image: "/estatein/property-tower.png",
    price: "RM700 / month",
    beds: "1",
    baths: "1",
  },
  {
    title: "Private Soho Studio",
    location: "Ara Damansara",
    type: "Soho/Studio",
    image: "/estatein/property-campus.png",
    price: "RM1,500 / month",
    beds: "1",
    baths: "1",
  },
];

const features = [
  {
    icon: "building" as IconName,
    title: "Find a Room That Fits",
    text: "Search ready-to-move-in rooms by location and budget.",
  },
  {
    icon: "search" as IconName,
    title: "Make Renting Simple",
    text: "See clear rental details before you enquire.",
  },
  {
    icon: "building" as IconName,
    title: "Support for Landlords",
    text: "Protect your units with dependable management.",
  },
  {
    icon: "spark" as IconName,
    title: "Agreements Made Easy",
    text: "Create, review, and sign tenancy agreements securely.",
  },
];

const faqs = [
  [
    "Does RentDeer accept internship tenants?",
    "Yes, internship tenants are welcome to stay with us. Contact the team to check available rooms and requirements.",
  ],
  [
    "Is a deposit required?",
    "Yes, a deposit is required upon booking confirmation. Our team will explain the amount and terms before you commit.",
  ],
  [
    "What is the minimum rental period?",
    "The minimum rental period is six months, helping create a stable living environment while keeping the process straightforward.",
  ],
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [propertyType, setPropertyType] = useState("All");
  const [openFaq, setOpenFaq] = useState(0);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const filteredProperties =
    propertyType === "All"
      ? properties
      : properties.filter((property) => property.type === propertyType);

  return (
    <main className="estatein-shell">
      <div className="announcement-bar">
        <span>✨ Rent smarter. Live better with RentDeer.</span>
        <button type="button" onClick={() => scrollTo("properties")}>
          Learn More <Icon name="arrow" />
        </button>
      </div>

      <header className="site-header">
        <button
          type="button"
          className="brand"
          aria-label="RentDeer home"
          onClick={() => scrollTo("home")}
        >
          <span className="brand-wordmark">
            <span className="brand-symbol">R</span>RentDeer
          </span>
        </button>
        <nav
          className={menuOpen ? "main-nav is-open" : "main-nav"}
          aria-label="Main navigation"
        >
          <button
            type="button"
            className="nav-link active"
            onClick={() => scrollTo("home")}
          >
            Home
          </button>
          <Link className="nav-link" href="/about">
            About Us
          </Link>
          <Link
            className="nav-link"
            href="/properties"
            onClick={() => setMenuOpen(false)}
          >
            Properties
          </Link>
          <Link
            className="nav-link"
            href="/services"
            onClick={() => setMenuOpen(false)}
          >
            Services
          </Link>
          <Link
            className="nav-link"
            href="/faq"
            onClick={() => setMenuOpen(false)}
          >
            FAQ
          </Link>
          <Link
            className="nav-link"
            href="/bulletin"
            onClick={() => setMenuOpen(false)}
          >
            Bulletin
          </Link>
        </nav>
        <Link
          className="contact-button"
          href="/contact"
          onClick={() => setMenuOpen(false)}
        >
          Contact Us
        </Link>
        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Icon name={menuOpen ? "close" : "menu"} />
        </button>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <span className="eyebrow">REAL ESTATE, REIMAGINED</span>
          <h1>
            Rent Smarter. <span>Live Better.</span>
          </h1>
          <p>
            Find clean, affordable, ready-to-move-in rooms across Klang Valley —
            with clear rental terms and a team that is here when you need us.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => scrollTo("about")}
            >
              Learn More
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={() => (window.location.href = "/properties")}
            >
              Find Property
            </button>
          </div>
          <div className="stats-grid">
            <div>
              <strong>
                500<span>+</span>
              </strong>
              <small>Rooms &amp; units</small>
            </div>
            <div>
              <strong>
                11<span>+</span>
              </strong>
              <small>Locations in Klang Valley</small>
            </div>
            <div>
              <strong>
                24<span>/7</span>
              </strong>
              <small>Customer support</small>
            </div>
          </div>
        </div>
        <div
          className="hero-visual"
          role="img"
          aria-label="Blue glass skyscraper illustration"
        >
          <div className="orbit-badge">
            <span>EXPLORE</span>
            <span>YOUR DREAM</span>
            <span>PROPERTY</span>
            <b>
              <Icon name="arrow" />
            </b>
          </div>
        </div>
      </section>

      <section className="feature-strip" id="services">
        {features.map((feature) => (
          <article className="feature-card" key={feature.title}>
            <div className="feature-icon">
              <Icon name={feature.icon} />
            </div>
            <div>
              <h2>{feature.title}</h2>
              <p>{feature.text}</p>
            </div>
            <button
              type="button"
              aria-label={`Explore ${feature.title}`}
              onClick={() => scrollTo("properties")}
            >
              <Icon name="arrow" />
            </button>
          </article>
        ))}
      </section>

      <section className="content-section" id="about">
        <div className="section-heading">
          <div>
            <span className="section-kicker">WHAT WE DO</span>
            <h2>We make finding property feel effortless</h2>
          </div>
          <p>
            At RentDeer, we believe finding or managing a home shouldn&apos;t be
            stressful. We connect renters and landlords with well-managed
            spaces, clear communication, and dependable support.
          </p>
        </div>
        <div className="values-grid">
          <div className="value-panel">
            <span className="value-number">01</span>
            <h3>Transparency</h3>
            <p>Review property details and rental terms before you commit.</p>
          </div>
          <div className="value-panel">
            <span className="value-number">02</span>
            <h3>Community</h3>
            <p>
              Live comfortably with support from a team that stays connected.
            </p>
          </div>
          <div className="value-panel">
            <span className="value-number">03</span>
            <h3>Simplicity</h3>
            <p>Search, enquire, and move in with fewer unknowns.</p>
          </div>
        </div>
      </section>

      <section className="content-section properties-section" id="properties">
        <div className="section-heading">
          <div>
            <span className="section-kicker">FEATURED RENTALS</span>
            <h2>Find your new stay</h2>
          </div>
          <Link
            className="button button-secondary desktop-only"
            href="/properties"
          >
            View All Rentals
          </Link>
        </div>
        <div
          className="property-tabs"
          role="tablist"
          aria-label="Filter properties"
        >
          {[
            "All",
            "Master Bedroom",
            "Medium Bedroom",
            "Single Bedroom",
            "Whole Unit",
          ].map((type) => (
            <button
              type="button"
              key={type}
              className={propertyType === type ? "is-selected" : ""}
              onClick={() => setPropertyType(type)}
            >
              {type}
            </button>
          ))}
        </div>
        <div className="property-grid">
          {filteredProperties.map((property) => (
            <article className="property-card" key={property.title}>
              <div className="property-image">
                <Image
                  src={property.image}
                  alt={property.title}
                  fill
                  sizes="(max-width: 760px) 100vw, 33vw"
                />
                <span>{property.type}</span>
              </div>
              <div className="property-content">
                <span className="property-location">{property.location}</span>
                <h3>{property.title}</h3>
                <p>
                  {property.type} available in a well-managed RentDeer home.
                </p>
                <div className="property-details">
                  <span>
                    <Icon name="building" /> {property.beds} Bedroom
                  </span>
                  <span>
                    <Icon name="spark" /> {property.baths} Toilet
                  </span>
                  <strong>{property.price}</strong>
                </div>
                <Link className="property-button" href="/properties">
                  View Rental Details <Icon name="arrow" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="testimonial-section">
        <div className="testimonial-mark">“</div>
        <div>
          <span className="section-kicker">CLIENT STORIES</span>
          <blockquote>
            They are reliable and operate with integrity. I really recommend
            RentDeer to anyone looking for great renters.
          </blockquote>
          <p className="quote-author">
            — Zulyasih Normalasari, RentDeer tenant
          </p>
        </div>
      </section>

      <section className="content-section faq-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">FREQUENTLY ASKED QUESTIONS</span>
            <h2>Answers before you move in</h2>
          </div>
          <p>
            Find quick answers about deposits, cooking, pets, rental periods,
            and parking — or reach out to our team.
          </p>
        </div>
        <div className="faq-list">
          {faqs.map(([question, answer], index) => (
            <div
              className={openFaq === index ? "faq-item is-open" : "faq-item"}
              key={question}
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                aria-expanded={openFaq === index}
              >
                <span>{question}</span>
                <Icon name="chevron" />
              </button>
              {openFaq === index && <p>{answer}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="contact-cta" id="contact">
        <div>
          <span className="section-kicker">READY WHEN YOU ARE</span>
          <h2>Let&apos;s talk about your next stay.</h2>
          <p>
            Whether you are a tenant, landlord, or property agent, RentDeer is
            here to help.
          </p>
        </div>
        <button
          type="button"
          className="button button-primary"
          onClick={() =>
            (window.location.href = "mailto:hello.rentdeer@gmail.com")
          }
        >
          Contact RentDeer <Icon name="arrow" />
        </button>
      </section>

      <SiteFooter />
    </main>
  );
}
