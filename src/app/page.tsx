"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  House,
  MapPinned,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import StoryScrollSection from "@/components/story-scroll-section";
import { apiRequest } from "@/lib/api-client";
import type { SiteSettingsInput } from "@/lib/listing-schema";
import { properties } from "@/lib/properties";

const areaCards = properties.map((property) => ({
  ...property,
  image: property.gallery[0] ?? property.image,
}));

const fallbackHeroSlides: SiteSettingsInput["homepageHeroSlides"] = [
  {
    path: "/estatein/property-villa.png",
    url: "/estatein/property-villa.png",
    alt: "A furnished RentDeer residence",
  },
  {
    path: "/estatein/property-campus.png",
    url: "/estatein/property-campus.png",
    alt: "A landscaped RentDeer residential community",
  },
  {
    path: "/estatein/property-tower.png",
    url: "/estatein/property-tower.png",
    alt: "A modern RentDeer residential tower",
  },
  {
    path: "/estatein/hero-building.png",
    url: "/estatein/hero-building.png",
    alt: "A contemporary home managed by RentDeer",
  },
];

const reasons = [
  ["Hassle free", "A clearer way to search, enquire, and move in.", House],
  [
    "Co-living style",
    "Comfortable spaces designed around everyday living.",
    UsersRound,
  ],
  [
    "Fully furnished",
    "Move into a home with the essentials already considered.",
    Building2,
  ],
  [
    "Affordable",
    "Options across Klang Valley for different budgets.",
    WalletCards,
  ],
  [
    "Strategic locations",
    "Find a home close to transit, work, and daily needs.",
    MapPinned,
  ],
  [
    "Free utilities",
    "Selected homes include practical utilities for simpler living.",
    Sparkles,
  ],
  [
    "Customer care",
    "A responsive team stays close after you move in.",
    ShieldCheck,
  ],
] as const;

const testimonials = [
  {
    name: "Zulyasih Normalasari",
    role: "Tenant",
    quote:
      "They are reliable and operate with integrity. I really recommend RentDeer to anyone who is looking for great renters.",
  },
  {
    name: "Hawa A",
    role: "Landlord",
    quote: "Helpful and responsive agent. The house is well maintained.",
  },
  {
    name: "Andy Slang",
    role: "Tenant",
    quote:
      "The RentDeer team provides excellent and immediate service whenever my unit has an issue.",
  },
  {
    name: "Nur Diana",
    role: "Tenant",
    quote:
      "I like their local interactions because the community is welcoming and the service feels personal.",
  },
  {
    name: "Del Lee",
    role: "Tenant",
    quote:
      "A smooth rental experience from viewing to move-in. The team is thoughtful, clear, and easy to reach.",
  },
];

function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    let frame = 0;
    const startTime = performance.now();
    const duration = 1100;

    const animate = (time: number) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplayValue(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [started, value]);

  return (
    <div ref={ref} className="rd-stat-value">
      <strong>
        {displayValue}
        <span>{suffix}</span>
      </strong>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const settingsQuery = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => apiRequest<{ data: SiteSettingsInput }>("/api/settings"),
    staleTime: 5 * 60_000,
  });
  const heroSlides = settingsQuery.data?.data.homepageHeroSlides.length
    ? settingsQuery.data.data.homepageHeroSlides.slice(0, 4)
    : fallbackHeroSlides;
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [discoveryQuery, setDiscoveryQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [locationIndex, setLocationIndex] = useState(0);
  const [storyIndex, setStoryIndex] = useState(0);
  const [reviewsPaused, setReviewsPaused] = useState(false);

  useEffect(() => {
    if (heroPaused || prefersReducedMotion || heroSlides.length < 2) return;
    const interval = window.setInterval(() => {
      setHeroSlideIndex((current) => (current + 1) % heroSlides.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [heroPaused, heroSlides.length, prefersReducedMotion]);

  useEffect(() => {
    if (heroSlideIndex >= heroSlides.length) setHeroSlideIndex(0);
  }, [heroSlideIndex, heroSlides.length]);

  useEffect(() => {
    if (reviewsPaused) return;

    const interval = window.setInterval(() => {
      setStoryIndex((currentIndex) => (currentIndex + 1) % testimonials.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [reviewsPaused]);

  const visibleAreas = useMemo(
    () =>
      areaCards.map(
        (_, offset) => areaCards[(locationIndex + offset) % areaCards.length],
      ),
    [locationIndex],
  );

  const moveArea = (direction: number) => {
    setLocationIndex(
      (locationIndex + direction + areaCards.length) % areaCards.length,
    );
  };

  const moveStory = (direction: number) => {
    setStoryIndex(
      (storyIndex + direction + testimonials.length) % testimonials.length,
    );
  };

  const submitDiscovery = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();

    if (discoveryQuery.trim()) params.set("query", discoveryQuery.trim());
    if (selectedCity) params.set("city", selectedCity);
    if (selectedBudget) params.set("budget", selectedBudget);

    const queryString = params.toString();
    router.push(queryString ? `/properties?${queryString}` : "/properties");
  };

  return (
    <main className="rd-home-page">
      <section
        className="rd-hero"
        aria-label="RentDeer featured homes"
        aria-roledescription="carousel"
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
        onFocusCapture={() => setHeroPaused(true)}
        onBlurCapture={() => setHeroPaused(false)}
      >
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            className="rd-hero-slide"
            key={heroSlides[heroSlideIndex]?.path ?? "fallback"}
            initial={{ opacity: 0, scale: 1.025 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.9,
              ease: "easeOut",
            }}
          >
            <Image
              src={heroSlides[heroSlideIndex]?.url ?? fallbackHeroSlides[0].url}
              alt={
                heroSlides[heroSlideIndex]?.alt ||
                `RentDeer featured home ${heroSlideIndex + 1}`
              }
              fill
              priority={heroSlideIndex === 0}
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>
        <div className="rd-hero-overlay" />
        <SiteHeader active="home" tone="dark" />
        <div className="rd-hero-content">
          <span className="rd-script-label">
            Redefining rentals in Klang Valley
          </span>
          <h1>
            Rent Smarter
            <span>Live Better</span>
          </h1>
          <p>
            Find a comfortable, well-managed space that fits your lifestyle and
            budget.
          </p>
          <form className="rd-search-wrap" onSubmit={submitDiscovery}>
            <div className="rd-search-bar">
              <Search aria-hidden="true" />
              <input
                aria-label="Discover a property"
                placeholder="Discover Property..."
                value={discoveryQuery}
                onChange={(event) => setDiscoveryQuery(event.target.value)}
                type="search"
              />
              <button
                type="button"
                aria-expanded={filtersOpen}
                aria-label="Toggle property filters"
                onClick={() => setFiltersOpen(!filtersOpen)}
              >
                <SlidersHorizontal aria-hidden="true" />
              </button>
              <button type="submit" aria-label="Search properties">
                <ArrowRight aria-hidden="true" />
              </button>
            </div>
            {filtersOpen && (
              <fieldset className="rd-filter-popover">
                <label>
                  <span>Budget</span>
                  <select
                    value={selectedBudget}
                    onChange={(event) => setSelectedBudget(event.target.value)}
                  >
                    <option value="">Choose budget...</option>
                    <option value="400-699">RM400 - RM699</option>
                    <option value="700-899">RM700 - RM899</option>
                    <option value="900-1499">RM900 - RM1499</option>
                    <option value="1500-1999">RM1500 - RM1999</option>
                    <option value="2000-3000">RM2000 - RM3000</option>
                  </select>
                </label>
                <label>
                  <span>City</span>
                  <select
                    value={selectedCity}
                    onChange={(event) => setSelectedCity(event.target.value)}
                  >
                    <option value="">Choose city...</option>
                    <option value="Kuala Lumpur">Kuala Lumpur</option>
                    <option value="Petaling Jaya">Petaling Jaya</option>
                    <option value="Puchong">Puchong</option>
                  </select>
                </label>
                <p>
                  Search covers rooms, studios, whole units, and homes around
                  Klang Valley.
                </p>
                <button type="submit" className="rd-filter-link">
                  Show matching properties <ArrowRight aria-hidden="true" />
                </button>
              </fieldset>
            )}
          </form>
        </div>
        {heroSlides.length > 1 && (
          <fieldset className="rd-hero-carousel-controls">
            <legend className="sr-only">Choose homepage background</legend>
            {heroSlides.map((slide, index) => (
              <button
                type="button"
                className={index === heroSlideIndex ? "is-active" : ""}
                key={slide.path}
                onClick={() => setHeroSlideIndex(index)}
                aria-label={`Show background ${index + 1}`}
                aria-current={index === heroSlideIndex ? "true" : undefined}
              />
            ))}
          </fieldset>
        )}
      </section>

      <StoryScrollSection />

      <section className="rd-areas-section" id="properties">
        <div className="rd-container">
          <div className="rd-section-heading rd-section-heading-light">
            <span className="rd-script-label">RentDeer in your area</span>
            <h2>Serving your local area.</h2>
            <p>
              Explore managed rooms and homes close to the places that matter to
              you.
            </p>
          </div>
          <div className="rd-area-carousel">
            {visibleAreas.map((property) => (
              <Link
                className="rd-area-card"
                href={`/properties/${property.slug}`}
                key={property.slug}
              >
                <Image
                  src={property.image}
                  alt={property.title}
                  fill
                  sizes="(max-width: 700px) 100vw, 28vw"
                />
                <div>
                  <span>{property.city}</span>
                  <strong>{property.title}</strong>
                </div>
              </Link>
            ))}
            <div className="rd-area-copy">
              <span className="rd-script-label">RentDeer</span>
              <p>
                We are committed to creating comfortable, convenient, and
                well-connected spaces that enhance everyday living.
              </p>
            </div>
          </div>
          <div className="rd-carousel-controls">
            <button
              type="button"
              onClick={() => moveArea(-1)}
              aria-label="Previous area"
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <span>
              0{locationIndex + 1} / 0{areaCards.length}
            </span>
            <button
              type="button"
              onClick={() => moveArea(1)}
              aria-label="Next area"
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <section className="rd-stats-section rd-container">
        <div className="rd-stats-heading">
          <span className="rd-script-label">Our footprint</span>
          <h2>Inside RentDeer</h2>
          <p>Trusted by Hundres, Choose by Thousands</p>
        </div>
        <div className="rd-stats-frame">
          <div className="rd-stats-frame-content">
            <p className="rd-stats-frame-copy">
              From helping landlords manage their properties to helping tenants
              find a place they can call home, we're growing a rental community
              built around quality, convenience and a peace of mind.
            </p>
            <div className="rd-stats-grid">
              <div className="rd-stat-item">
                <Building2 aria-hidden="true" />
                <CountUp value={129} />
                <span>Landlords</span>
              </div>
              <div className="rd-stat-item">
                <UsersRound aria-hidden="true" />
                <CountUp value={900} suffix="+" />
                <span>Tenants</span>
              </div>
              <div className="rd-stat-item">
                <Building2 aria-hidden="true" />
                <CountUp value={10} />
                <span>Developments</span>
              </div>
              <div className="rd-stat-item">
                <House aria-hidden="true" />
                <CountUp value={917} />
                <span>Rooms</span>
              </div>
              <div className="rd-stat-item">
                <BadgeCheck aria-hidden="true" />
                <CountUp value={203} />
                <span>Units</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rd-reasons-section">
        <div className="rd-container rd-reasons-layout">
          <div className="rd-reasons-intro">
            <span className="rd-script-label">Our difference</span>
            <h2>
              <span>WHY</span> RentDeer
            </h2>
            <p>A Better Rental Experience, Build Around you</p>
            <p>
              At Rentdeer, we make renting more comfortable, convenient, and
              hassle-free with the right support from the moment you move in.
            </p>
          </div>
          <div className="rd-reasons-grid">
            {reasons.map(([title, text, Icon]) => (
              <div className="rd-reason-item" key={title} title={text}>
                <div className="rd-reason-icon">
                  <Icon aria-hidden="true" />
                </div>
                <h3>{title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rd-stories-section" id="reviews">
        <div className="rd-container">
          <div className="rd-reviews-heading">
            <span className="rd-script-label">Stories that stay</span>
            <h2>
              The Reviews Speak <em>for Themselves</em>
            </h2>
          </div>
          <section
            className="rd-review-carousel"
            aria-live="polite"
            aria-label="RentDeer customer reviews"
            onMouseEnter={() => setReviewsPaused(true)}
            onMouseLeave={() => setReviewsPaused(false)}
            onFocus={() => setReviewsPaused(true)}
            onBlur={() => setReviewsPaused(false)}
          >
            <div className="rd-review-track">
              {[-2, -1, 0, 1, 2].map((offset) => {
                const index =
                  (storyIndex + offset + testimonials.length) %
                  testimonials.length;
                const testimonial = testimonials[index];
                const isActive = offset === 0;
                return (
                  <motion.article
                    className={`rd-review-card ${isActive ? "is-active" : ""}`}
                    key={offset}
                    layout
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0.82,
                      scale: 1,
                      y: 0,
                    }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                    whileHover={{ y: -6 }}
                  >
                    <span className="rd-review-role">{testimonial.role}</span>
                    <div className="rd-review-card-name">
                      {testimonial.name}
                    </div>
                    <div className="rd-review-card-body">
                      <p>{testimonial.quote}</p>
                      <div className="rd-review-footer">
                        <span
                          className="rd-stars"
                          role="img"
                          aria-label="5 out of 5 stars"
                        >
                          ★★★★★
                        </span>
                        {isActive ? (
                          <span
                            className="rd-review-quote-mark"
                            aria-hidden="true"
                          >
                            ”
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </section>
          <div className="rd-story-controls">
            <button
              type="button"
              onClick={() => moveStory(-1)}
              aria-label="Previous review"
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <div>
              {testimonials.map((testimonial, index) => (
                <button
                  type="button"
                  className={index === storyIndex ? "is-active" : ""}
                  key={testimonial.name}
                  onClick={() => setStoryIndex(index)}
                  aria-label={`Show review from ${testimonial.name}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => moveStory(1)}
              aria-label="Next review"
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <SiteFooter tone="dark" />
    </main>
  );
}
