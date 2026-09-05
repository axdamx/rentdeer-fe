"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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
    title: "Seaside Serenity Villa",
    location: "Malibu, California",
    type: "Villas",
    image: "/estatein/property-villa.png",
    price: "$2,850,000",
    beds: "4",
    baths: "3",
  },
  {
    title: "Metropolitan Haven",
    location: "New York, New York",
    type: "Apartments",
    image: "/estatein/property-tower.png",
    price: "$1,650,000",
    beds: "2",
    baths: "2",
  },
  {
    title: "Rustic Retreat Cottage",
    location: "Austin, Texas",
    type: "Houses",
    image: "/estatein/property-campus.png",
    price: "$850,000",
    beds: "3",
    baths: "2",
  },
];

const features = [
  {
    icon: "building" as IconName,
    title: "Find Your Dream Home",
    text: "Explore our curated selection of properties.",
  },
  {
    icon: "search" as IconName,
    title: "Unlock Property Value",
    text: "Discover opportunities that work for you.",
  },
  {
    icon: "building" as IconName,
    title: "Effortless Property Management",
    text: "Let us handle the details with care.",
  },
  {
    icon: "spark" as IconName,
    title: "Smart Investments, Informed Decisions",
    text: "Build your future with expert guidance.",
  },
];

const faqs = [
  [
    "How do I search for properties on Estatein?",
    "Use our search tools to explore properties by location, price, property type, and more. Our team is also available to help you find the right fit.",
  ],
  [
    "What documents do I need to buy a property?",
    "Requirements vary by location, but our advisors guide you through every document and step before you make an offer.",
  ],
  [
    "Can I schedule a property viewing?",
    "Absolutely. Open any listing and contact our team to choose a convenient time for an in-person or virtual tour.",
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
        <span>✨ Discover Your Dream Property with Estatein</span>
        <button type="button" onClick={() => scrollTo("properties")}>
          Learn More <Icon name="arrow" />
        </button>
      </div>

      <header className="site-header">
        <button
          type="button"
          className="brand"
          aria-label="Estatein home"
          onClick={() => scrollTo("home")}
        >
          <Image
            src="/estatein/logo.png"
            alt="Estatein"
            width={148}
            height={45}
            priority
          />
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
            Discover Your Dream <span>Property</span> with Estatein
          </h1>
          <p>
            Your journey to finding the perfect property begins here. Explore
            our listings to find the home that matches your dreams.
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
              Browse Properties
            </button>
          </div>
          <div className="stats-grid">
            <div>
              <strong>
                200<span>+</span>
              </strong>
              <small>Happy Customers</small>
            </div>
            <div>
              <strong>
                10k<span>+</span>
              </strong>
              <small>Properties For Clients</small>
            </div>
            <div>
              <strong>
                16<span>+</span>
              </strong>
              <small>Years of Experience</small>
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
            At Estatein, we combine a refined property experience with personal
            guidance. Wherever you are in your journey, our experts are here to
            make the next step simple.
          </p>
        </div>
        <div className="values-grid">
          <div className="value-panel">
            <span className="value-number">01</span>
            <h3>Curated listings</h3>
            <p>
              Every home is selected for its quality, character, and long-term
              value.
            </p>
          </div>
          <div className="value-panel">
            <span className="value-number">02</span>
            <h3>Expert guidance</h3>
            <p>
              Move forward with a partner who understands both the market and
              your goals.
            </p>
          </div>
          <div className="value-panel">
            <span className="value-number">03</span>
            <h3>Human support</h3>
            <p>
              From first search to final signature, you never have to navigate
              alone.
            </p>
          </div>
        </div>
      </section>

      <section className="content-section properties-section" id="properties">
        <div className="section-heading">
          <div>
            <span className="section-kicker">FEATURED PROPERTIES</span>
            <h2>Find the place that feels like home</h2>
          </div>
          <button
            type="button"
            className="button button-secondary desktop-only"
            onClick={() => scrollTo("contact")}
          >
            View All Properties
          </button>
        </div>
        <div
          className="property-tabs"
          role="tablist"
          aria-label="Filter properties"
        >
          {["All", "Villas", "Apartments", "Houses"].map((type) => (
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
                  Spacious interiors and thoughtful details designed for the way
                  you live.
                </p>
                <div className="property-details">
                  <span>
                    <Icon name="building" /> {property.beds} Beds
                  </span>
                  <span>
                    <Icon name="spark" /> {property.baths} Baths
                  </span>
                  <strong>{property.price}</strong>
                </div>
                <button
                  type="button"
                  className="property-button"
                  onClick={() => scrollTo("contact")}
                >
                  View Property Details <Icon name="arrow" />
                </button>
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
            Estatein turned what felt like an overwhelming search into a clear
            and exciting journey. We found a home that truly feels like ours.
          </blockquote>
          <p className="quote-author">— Olivia Martinez, New York</p>
        </div>
      </section>

      <section className="content-section faq-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">FREQUENTLY ASKED QUESTIONS</span>
            <h2>Answers for every step of the journey</h2>
          </div>
          <p>
            Have a question? Explore our answers or reach out to the Estatein
            team for personal guidance.
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
          <h2>Your dream property is just a click away.</h2>
          <p>
            Tell us what you are looking for and our experts will help you take
            the next step.
          </p>
        </div>
        <button
          type="button"
          className="button button-primary"
          onClick={() => (window.location.href = "mailto:hello@estatein.com")}
        >
          Get Started <Icon name="arrow" />
        </button>
      </section>

      <footer className="site-footer">
        <div>
          <button
            type="button"
            className="brand footer-brand"
            onClick={() => scrollTo("home")}
          >
            <Image
              src="/estatein/logo.png"
              alt="Estatein"
              width={148}
              height={45}
            />
          </button>
          <p>Building better beginnings, one property at a time.</p>
        </div>
        <div className="footer-links">
          <div>
            <strong>Explore</strong>
            <button type="button" onClick={() => scrollTo("about")}>
              About Us
            </button>
            <button type="button" onClick={() => scrollTo("properties")}>
              Properties
            </button>
          </div>
          <div>
            <strong>Services</strong>
            <button type="button" onClick={() => scrollTo("services")}>
              Property Management
            </button>
            <button type="button" onClick={() => scrollTo("contact")}>
              Contact Us
            </button>
          </div>
          <div>
            <strong>Connect</strong>
            <button
              type="button"
              onClick={() =>
                (window.location.href = "mailto:hello@estatein.com")
              }
            >
              Email Us
            </button>
            <button
              type="button"
              onClick={() =>
                window.open(
                  "https://www.instagram.com",
                  "_blank",
                  "noopener,noreferrer",
                )
              }
            >
              Instagram
            </button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Estatein. All Rights Reserved.</span>
          <span>Privacy Policy&nbsp;&nbsp; · &nbsp;&nbsp;Terms of Use</span>
        </div>
      </footer>
    </main>
  );
}
