import Image from "next/image";
import Link from "next/link";
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

const values = [
  [
    "Transparency",
    "Clear listings, honest conversations, and no unnecessary surprises.",
  ],
  [
    "Community",
    "Better homes start with better relationships between tenants and owners.",
  ],
  [
    "Simplicity",
    "Every step should be easy to understand, from search to signing.",
  ],
  [
    "Empowerment",
    "Useful information helps every renter and property partner decide with confidence.",
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
      <div className="announcement-bar">
        <span>✨ Rent smarter. Live better with RentDeer.</span>
        <Link href="/properties">
          Find a stay <ArrowIcon />
        </Link>
      </div>
      <SiteHeader active="about" />
      <section className="about-hero" id="about-hero">
        <div className="about-hero-copy">
          <span className="section-kicker">ABOUT RENTDEER</span>
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
      </section>
      <section className="content-section about-intro" id="story">
        <div className="about-intro-image">
          <Image
            src="/estatein/property-tower.png"
            alt="Modern residential building"
            fill
            sizes="(max-width: 700px) 100vw, 50vw"
          />
        </div>
        <div className="about-intro-copy">
          <span className="section-kicker">BEHIND RENTDEER</span>
          <h2>Comfortable, quality living should be accessible to everyone.</h2>
          <p>
            In the heart of Damansara, during the difficult days of the COVID-19
            pandemic, RentDeer Sdn Bhd was founded with a simple but meaningful
            purpose. A group of real estate agents came together with a shared
            belief: that comfortable, quality living should be accessible to
            everyone, no matter their budget.
          </p>
          <p>
            Through our work with both renters and landlords, we saw firsthand
            the challenges they faced. Many renters struggled to find clean,
            affordable rooms they could trust. At the same time, landlords were
            dealing with property maintenance issues, unreliable tenants, and a
            lack of dependable management support.
          </p>
          <p>
            RentDeer was created to bridge this gap. We aim to provide renters
            with well-managed, ready-to-move-in homes, while giving landlords a
            reliable and transparent team to help care for their properties. At
            the heart of RentDeer is a sincere commitment to make renting
            easier, fairer, and more worry-free for everyone involved.
          </p>
          <div className="about-points">
            {values.map(([title, text]) => (
              <div className="about-point" key={title}>
                <span className="about-point-icon">
                  <CheckIcon />
                </span>
                <div>
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="about-section rental-belief" id="rental-belief">
        <span className="section-kicker">OUR BELIEF</span>
        <h2>We live and breathe rental.</h2>
        <p>
          From the beginning, we have aimed to improve the standard of rental
          living for both tenants and landlords. We believe that better homes
          come from proper management, clear communication, and sincere care for
          the people who live in our spaces.
        </p>
        <p>
          For renters, this means rooms that are clean, move-in ready, and
          supported by a responsive team. For landlords, this means dependable
          tenants, consistent property upkeep, and a management system that
          protects the value of their investment.
        </p>
        <p>
          We continue to refine our services, enhance our processes, and listen
          to feedback from both tenants and property owners. Our goal is simple:
          to build a rental ecosystem where everyone benefits—where renters feel
          truly at home, and landlords feel confident with every unit they place
          under our care.
        </p>
      </section>
      <section className="about-section" id="journey">
        <span className="section-kicker">OUR JOURNEY</span>
        <h2>Built locally. Growing with purpose.</h2>
        <p>
          RentDeer is creating a rental experience that feels transparent,
          reliable, and simple across Klang Valley.
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
      </section>
      <section className="contact-cta about-cta" id="about-contact">
        <div>
          <span className="section-kicker">START YOUR JOURNEY</span>
          <h2>Find your place with RentDeer.</h2>
          <p>Browse current rentals or tell our team what you need next.</p>
        </div>
        <Link className="button button-primary" href="/properties">
          Explore Properties <ArrowIcon />
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
