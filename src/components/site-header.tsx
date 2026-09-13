"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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

export default function SiteHeader({ active, tone = "dark" }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<
    "properties" | "services" | null
  >(null);
  const headerRef = useRef<HTMLElement>(null);
  const dropdownCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const MotionButton = motion.button;

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) {
        setOpenDropdown(null);
        setMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDropdown(null);
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      if (dropdownCloseTimerRef.current) {
        clearTimeout(dropdownCloseTimerRef.current);
      }
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const cancelDropdownClose = () => {
    if (dropdownCloseTimerRef.current) {
      clearTimeout(dropdownCloseTimerRef.current);
      dropdownCloseTimerRef.current = null;
    }
  };

  const openNavigationDropdown = (dropdown: "properties" | "services") => {
    cancelDropdownClose();
    setOpenDropdown(dropdown);
  };

  const scheduleDropdownClose = () => {
    cancelDropdownClose();
    dropdownCloseTimerRef.current = setTimeout(() => {
      setOpenDropdown(null);
      dropdownCloseTimerRef.current = null;
    }, 650);
  };

  const closeNavigation = () => {
    cancelDropdownClose();
    setMenuOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (dropdown: "properties" | "services") => {
    setOpenDropdown((current) => (current === dropdown ? null : dropdown));
  };

  return (
    <header
      ref={headerRef}
      className={
        tone === "dark" ? "site-header site-header-dark" : "site-header"
      }
    >
      <Link
        className="brand"
        aria-label="RentDeer home"
        href="/"
        onClick={closeNavigation}
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
          onClick={closeNavigation}
        >
          Home
        </Link>
        <Link
          className={active === "about" ? "nav-link active" : "nav-link"}
          href="/about"
          onClick={closeNavigation}
        >
          About Us
        </Link>
        <menu
          className={
            openDropdown === "properties" ? "nav-menu is-open" : "nav-menu"
          }
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") {
              openNavigationDropdown("properties");
            }
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") scheduleDropdownClose();
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setOpenDropdown(null);
            }
          }}
        >
          <div
            className={
              active === "properties"
                ? "nav-menu-trigger active"
                : "nav-menu-trigger"
            }
          >
            <Link
              className={
                active === "properties" ? "nav-link active" : "nav-link"
              }
              href="/properties"
              onClick={closeNavigation}
            >
              Property
            </Link>
            <button
              type="button"
              className="nav-menu-toggle"
              aria-label="Show property locations"
              aria-expanded={openDropdown === "properties"}
              onClick={() => toggleDropdown("properties")}
            >
              <span aria-hidden="true">⌄</span>
            </button>
          </div>
          {openDropdown === "properties" && (
            <div className="nav-menu-panel">
              <Link href="/properties" onClick={closeNavigation}>
                All properties
              </Link>
              {propertyLocations.map(([region, locations]) => (
                <div key={region}>
                  <strong>{region}</strong>
                  {locations.map((location) => (
                    <Link
                      href={`/properties?city=${encodeURIComponent(location)}`}
                      key={location}
                      onClick={closeNavigation}
                    >
                      {location}
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </menu>
        <menu
          className={
            openDropdown === "services" ? "nav-menu is-open" : "nav-menu"
          }
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") {
              openNavigationDropdown("services");
            }
          }}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") scheduleDropdownClose();
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setOpenDropdown(null);
            }
          }}
        >
          <div
            className={
              active === "services"
                ? "nav-menu-trigger active"
                : "nav-menu-trigger"
            }
          >
            <Link
              className={active === "services" ? "nav-link active" : "nav-link"}
              href="/services"
              onClick={closeNavigation}
            >
              Services
            </Link>
            <button
              type="button"
              className="nav-menu-toggle"
              aria-label="Show service options"
              aria-expanded={openDropdown === "services"}
              onClick={() => toggleDropdown("services")}
            >
              <span aria-hidden="true">⌄</span>
            </button>
          </div>
          {openDropdown === "services" && (
            <div className="nav-menu-panel nav-menu-panel-compact">
              <Link href="/services?role=tenant" onClick={closeNavigation}>
                For tenants
              </Link>
              <Link href="/services?role=landlord" onClick={closeNavigation}>
                For landlords
              </Link>
            </div>
          )}
        </menu>
        <Link
          className={active === "story" ? "nav-link active" : "nav-link"}
          href="/about#story"
          onClick={closeNavigation}
        >
          Our Story
        </Link>
        <Link
          className={active === "faq" ? "nav-link active" : "nav-link"}
          href="/faq"
          onClick={closeNavigation}
        >
          FAQ
        </Link>
        <Link
          className={active === "bulletin" ? "nav-link active" : "nav-link"}
          href="/bulletin"
          onClick={closeNavigation}
        >
          Bulletin
        </Link>
      </nav>
      <Link
        className="contact-button"
        href="/contact"
        onClick={closeNavigation}
      >
        Contact Us
      </Link>
      <MotionButton
        type="button"
        className="menu-toggle"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        onClick={() => {
          setMenuOpen(!menuOpen);
          setOpenDropdown(null);
        }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.94 }}
      >
        <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
      </MotionButton>
    </header>
  );
}
