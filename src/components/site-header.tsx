"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type SiteHeaderProps = {
  active?: "home" | "about" | "properties" | "services" | "contact";
};

const navigation = [
  ["home", "Home", "/"],
  ["about", "About Us", "/about"],
  ["properties", "Properties", "/properties"],
  ["services", "Services", "/services"],
] as const;

export default function SiteHeader({ active }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <Link
        className="brand"
        aria-label="Estatein home"
        href="/"
        onClick={() => setMenuOpen(false)}
      >
        <Image
          src="/estatein/logo.png"
          alt="Estatein"
          width={148}
          height={45}
          priority
        />
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
