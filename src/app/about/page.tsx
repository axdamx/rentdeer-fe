"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

function CheckIcon() {
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
      <path d="m5 12 4.5 4.5L19 7" />
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

const milestones = [
  [
    "01",
    "The beginning",
    "Estatein starts with a simple idea: finding a great property should feel personal, clear, and inspiring.",
  ],
  [
    "02",
    "Growing together",
    "We built a community of homeowners, investors, and experts who believe in making better decisions together.",
  ],
  [
    "03",
    "A wider view",
    "Today, our work spans homes, investments, and the long-term relationships that make a place feel like yours.",
  ],
  [
    "04",
    "What comes next",
    "We keep raising the bar for property discovery with thoughtful technology and human support.",
  ],
];

const team = [
  ["Sophia Turner", "Chief Executive Officer", "/estatein/property-villa.png"],
  ["Daniel Ramirez", "Head of Property", "/estatein/property-tower.png"],
  ["Emily Johnson", "Client Experience Lead", "/estatein/property-campus.png"],
];

export default function AboutPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="about-page">
      <div className="announcement-bar">
        <span>✨ Discover Your Dream Property with Estatein</span>
        <Link href="/#properties" onClick={closeMenu}>
          Learn More <ArrowIcon />
        </Link>
      </div>

      <header className="site-header">
        <Link
          className="brand"
          href="/"
          aria-label="Estatein home"
          onClick={closeMenu}
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
          <Link className="nav-link" href="/" onClick={closeMenu}>
            Home
          </Link>
          <Link className="nav-link active" href="/about" onClick={closeMenu}>
            About Us
          </Link>
          <Link className="nav-link" href="/properties" onClick={closeMenu}>
            Properties
          </Link>
          <Link className="nav-link" href="/services" onClick={closeMenu}>
            Services
          </Link>
        </nav>
        <Link className="contact-button" href="/contact" onClick={closeMenu}>
          Contact Us
        </Link>
        <button
          type="button"
          className="menu-toggle"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <span aria-hidden="true">×</span>
          ) : (
            <span aria-hidden="true">☰</span>
          )}
        </button>
      </header>

      <section className="about-hero" id="about-hero">
        <div className="about-hero-copy">
          <span className="section-kicker">ABOUT ESTATEIN</span>
          <h1>
            Our story is rooted in <span>better beginnings.</span>
          </h1>
          <p>
            We believe finding the right property is more than a transaction. It
            is the start of a new chapter, a new idea, or a place where life can
            unfold.
          </p>
        </div>
        <div className="about-hero-art" aria-hidden="true">
          <Image src="/estatein/about-pattern-lines.png" alt="" fill />
        </div>
      </section>

      <section className="content-section about-intro" id="story">
        <div className="about-intro-image">
          <Image
            src="/estatein/property-tower.png"
            alt="Modern glass building at dusk"
            fill
            sizes="(max-width: 700px) 100vw, 50vw"
          />
        </div>
        <div className="about-intro-copy">
          <span className="section-kicker">OUR PURPOSE</span>
          <h2>Property decisions deserve a human point of view.</h2>
          <p>
            Estatein brings together a considered collection of properties,
            practical expertise, and a team who listens. We make the process
            feel less like a search and more like a confident next step.
          </p>
          <div className="about-points">
            <div className="about-point">
              <span className="about-point-icon">
                <CheckIcon />
              </span>
              <div>
                <strong>Trusted perspective</strong>
                <span>Clear advice for meaningful decisions.</span>
              </div>
            </div>
            <div className="about-point">
              <span className="about-point-icon">
                <CheckIcon />
              </span>
              <div>
                <strong>Curated quality</strong>
                <span>Properties selected with intention.</span>
              </div>
            </div>
            <div className="about-point">
              <span className="about-point-icon">
                <CheckIcon />
              </span>
              <div>
                <strong>Built for people</strong>
                <span>Support that stays with you.</span>
              </div>
            </div>
            <div className="about-point">
              <span className="about-point-icon">
                <CheckIcon />
              </span>
              <div>
                <strong>Always evolving</strong>
                <span>Better tools for a changing market.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="about-section" id="journey">
        <span className="section-kicker">OUR JOURNEY</span>
        <h2>A little history. A lot of intention.</h2>
        <p>
          From one thoughtful idea to a growing property community, every
          chapter has sharpened what we stand for: making space for better
          decisions.
        </p>
        <div className="journey-grid">
          {milestones.map(([number, title, text]) => (
            <article className="journey-item" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section" id="team">
        <div className="about-team">
          <div>
            <span className="section-kicker">OUR TEAM</span>
            <h2>People who make the process feel possible.</h2>
          </div>
          <p>
            Our team combines local knowledge, strategic thinking, and a genuine
            love for helping people find their place.
          </p>
        </div>
        <div className="team-grid">
          {team.map(([name, role, image]) => (
            <article className="team-card" key={name}>
              <div className="team-card-image">
                <Image
                  src={image}
                  alt={name}
                  fill
                  sizes="(max-width: 700px) 100vw, 33vw"
                />
              </div>
              <div className="team-card-content">
                <h3>{name}</h3>
                <p>{role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="contact-cta about-cta" id="about-contact">
        <div>
          <span className="section-kicker">START YOUR JOURNEY</span>
          <h2>Let&apos;s find what&apos;s next.</h2>
          <p>
            Whether you are looking for a home or your next investment, we are
            ready to help.
          </p>
        </div>
        <Link className="button button-primary" href="/properties">
          Explore Properties <ArrowIcon />
        </Link>
      </section>

      <footer className="site-footer about-footer">
        <div>
          <Link className="brand footer-brand" href="/">
            <Image
              src="/estatein/logo.png"
              alt="Estatein"
              width={148}
              height={45}
            />
          </Link>
          <p>Building better beginnings, one property at a time.</p>
        </div>
        <div className="footer-links">
          <div>
            <strong>Explore</strong>
            <Link href="/">Home</Link>
            <Link href="/about">About Us</Link>
          </div>
          <div>
            <strong>Discover</strong>
            <Link href="/properties">Properties</Link>
            <Link href="/services">Services</Link>
          </div>
          <div>
            <strong>Connect</strong>
            <a href="mailto:hello@estatein.com">Email Us</a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
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
