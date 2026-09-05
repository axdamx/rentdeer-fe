"use client";

import Link from "next/link";
import { useState } from "react";

type SiteHeaderProps = {
  active?:
    | "home"
    | "about"
    | "properties"
    | "services"
    | "faq"
    | "bulletin"
    | "contact";
};

const navigation = [
  ["home", "Home", "/"],
  ["about", "About Us", "/about"],
  ["properties", "Properties", "/properties"],
  ["services", "Services", "/services"],
  ["faq", "FAQ", "/faq"],
  ["bulletin", "Bulletin", "/bulletin"],
] as const;

export default function SiteHeader({ active }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
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
        {navigation.map(([key, label, href]) => (
          <Link
            className={active === key ? "nav-link active" : "nav-link"}
            href={href}
            key={key}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </Link>
        ))}
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
        <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
      </button>
    </header>
  );
}
