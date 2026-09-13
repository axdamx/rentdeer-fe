import Image from "next/image";
import Link from "next/link";
import AboutParallaxIntro from "@/components/about-parallax-intro";
import RentalBeliefParallax from "@/components/rental-belief-parallax";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

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
    "A local beginning",
    "RentDeer began in Damansara during the pandemic, when a group of property professionals saw a better way to support renters and landlords.",
  ],
  [
    "02",
    "Bridging the rental gap",
    "We built a rental experience around ready-to-move-in homes, reliable management, and communication people can trust.",
  ],
  [
    "03",
    "Growing the community",
    "From rooms to whole units, RentDeer keeps building a more connected rental community across Klang Valley.",
  ],
  [
    "04",
    "Making renting better",
    "We are continuing to improve the search, enquiry, agreement, and move-in journey for everyone involved.",
  ],
];

const team = [
  [
    "Dr. Irfan",
    "Chief Executive Officer",
    "/estatein/property-villa.png",
    "At RentDeer, Dr. Irfan is realising a vision in which rental living and property ownership in Malaysia become simple, secure, and attainable for every individual who aspires to a stable home or a sustainable investment.",
    "He is committed to shaping a future where young Malaysians can build wealth with confidence, and where tenants can live with dignity, stability, and peace of mind.",
  ],
  [
    "En Haziq",
    "Chief Operating Officer",
    "/estatein/property-tower.png",
    "At RentDeer, En Haziq is helping realise a vision in which rental living and property ownership in Malaysia become simple, secure, and attainable for every individual who aspires to a stable home or a sustainable investment.",
    "He is committed to shaping a future where young Malaysians can build wealth with confidence, and where tenants can live with dignity, stability, and peace of mind.",
  ],
  [
    "En Syafiq",
    "Chief Financial Officer",
    "/estatein/property-campus.png",
    "At RentDeer, Syafiq is realising a vision in which rental living and property ownership in Malaysia become simple, secure, and attainable for every individual who aspires to a stable home or a sustainable investment.",
    "He is committed to shaping a future where young Malaysians can build wealth with confidence, and where tenants can live with dignity, stability, and peace of mind.",
  ],
];

export default function AboutPage() {
  return (
    <main className="about-page">
      <section className="about-hero" id="about-hero">
        <SiteHeader active="about" tone="dark" />
        <div className="about-hero-inner">
          <div className="about-hero-copy">
            <span className="rd-script-label">About RentDeer</span>
            <h1>
              We Are <span>RentDeer.</span>
            </h1>
            <p>
              Better rental living begins with a home you can trust and a team
              that genuinely cares about the people inside it.
            </p>
          </div>
          <div className="about-hero-art" aria-hidden="true">
            <Image src="/estatein/about-pattern-lines.png" alt="" fill />
          </div>
        </div>
      </section>
      <AboutParallaxIntro />
      <section
        className="about-section about-section-green rental-belief"
        id="rental-belief"
      >
        <div className="about-section-inner">
          <div className="about-belief-layout">
            <div className="about-section-heading">
              <span className="rd-script-label">Our belief</span>
              <h2>We live and breathe rental.</h2>
            </div>
            <div className="about-belief-copy">
              <p>
                From the beginning, we have aimed to improve the standard of
                rental living for both tenants and landlords. We believe that
                better homes come from proper management, clear communication,
                and sincere care for the people who live in our spaces.
              </p>
              <p>
                For renters, this means rooms that are clean, move-in ready, and
                supported by a responsive team. For landlords, this means
                dependable tenants, consistent property upkeep, and a management
                system that protects the value of their investment.
              </p>
              <p>
                We continue to refine our services, enhance our processes, and
                listen to feedback from both tenants and property owners. Our
                goal is simple: to build a rental ecosystem where everyone
                benefits—where renters feel truly at home, and landlords feel
                confident with every unit they place under our care.
              </p>
            </div>
          </div>
          <RentalBeliefParallax />
        </div>
      </section>
      <section className="about-section" id="journey">
        <div className="about-section-inner">
          <div className="about-section-heading">
            <span className="rd-script-label">Our journey</span>
            <h2>Built locally. Growing with purpose.</h2>
            <p>
              RentDeer is creating a rental experience that feels transparent,
              reliable, and simple across Klang Valley.
            </p>
          </div>
          <div className="journey-grid">
            {milestones.map(([number, title, text]) => (
              <article className="journey-item" key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="about-section about-section-green" id="team">
        <div className="about-section-inner">
          <div className="about-team">
            <div className="about-section-heading">
              <span className="rd-script-label">Our team</span>
              <h2>People behind a better rental experience.</h2>
            </div>
          </div>
          <div className="team-grid">
            {team.map(([name, role, image, firstBio, secondBio]) => (
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
                  <div className="team-card-bio">
                    <p>{firstBio}</p>
                    <p>{secondBio}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="about-cta-section" id="about-contact">
        <div className="about-cta">
          <div>
            <span className="rd-script-label">Start your journey</span>
            <h2>Find your place with RentDeer.</h2>
            <p>Browse current rentals or tell our team what you need next.</p>
          </div>
          <Link className="rd-yellow-button" href="/properties">
            Explore Properties <ArrowIcon />
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
