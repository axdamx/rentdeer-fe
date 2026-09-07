"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

type SiteHeaderProps = {
  tone?: "default" | "dark";
  active?:
    | "home"
    | "about"
    | "properties"
    | "services"
    | "story"
    | "faq"
    | "bulletin"
    | "contact";
};

const propertyLocations = [
  ["Kuala Lumpur", ["Cheras", "Kepong", "Sentul"]],
  [
    "Petaling Jaya",
    ["Ara Damansara", "Damansara Damai", "Kelana Jaya", "Kota Damansara"],
  ],
  ["Puchong", ["Seri Kembangan"]],
] as const;

export default function SiteHeader({
  active,
  tone = "default",
}: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const MotionButton = motion.button;

  return (
    <header
      className={
        tone === "dark" ? "site-header site-header-dark" : "site-header"
      }
    >
      <Link
        className="brand"
        aria-label="RentDeer home"
        href="/"
        onClick={() => setMenuOpen(false)}
      >
        <span className="brand-wordmark">
          <span className="brand-symbol">R</span>RentDeer
        </span>
      </Link>
      <nav
        className={menuOpen ? "main-nav is-open" : "main-nav"}
        aria-label="Main navigation"
      >
        <Link
          className={active === "home" ? "nav-link active" : "nav-link"}
          href="/"
          onClick={() => setMenuOpen(false)}
        >
          Home
        </Link>
        <Link
          className={active === "about" ? "nav-link active" : "nav-link"}
          href="/about"
          onClick={() => setMenuOpen(false)}
        >
          About Us
        </Link>
        <details className="nav-menu">
          <summary
            className={active === "properties" ? "nav-link active" : "nav-link"}
          >
            Property <span aria-hidden="true">⌄</span>
          </summary>
          <div className="nav-menu-panel">
            <Link href="/properties" onClick={() => setMenuOpen(false)}>
              All properties
            </Link>
            {propertyLocations.map(([region, locations]) => (
              <div key={region}>
                <strong>{region}</strong>
                {locations.map((location) => (
                  <Link
                    href={`/properties?city=${encodeURIComponent(location)}`}
                    key={location}
                    onClick={() => setMenuOpen(false)}
                  >
                    {location}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </details>
        <details className="nav-menu">
          <summary
            className={active === "services" ? "nav-link active" : "nav-link"}
          >
            Services <span aria-hidden="true">⌄</span>
          </summary>
          <div className="nav-menu-panel nav-menu-panel-compact">
            <Link
              href="/services?role=tenant"
              onClick={() => setMenuOpen(false)}
            >
              For tenants
            </Link>
            <Link
              href="/services?role=landlord"
              onClick={() => setMenuOpen(false)}
            >
              For landlords
            </Link>
          </div>
        </details>
        <Link
          className={active === "story" ? "nav-link active" : "nav-link"}
          href="/about#story"
          onClick={() => setMenuOpen(false)}
        >
          Our Story
        </Link>
        <Link
          className={active === "faq" ? "nav-link active" : "nav-link"}
          href="/faq"
          onClick={() => setMenuOpen(false)}
        >
          FAQ
        </Link>
        <Link
          className={active === "bulletin" ? "nav-link active" : "nav-link"}
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
      <MotionButton
        type="button"
        className="menu-toggle"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        onClick={() => setMenuOpen(!menuOpen)}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.94 }}
      >
        <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
      </MotionButton>
    </header>
  );
}
