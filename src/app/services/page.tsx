import Link from "next/link";
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

const services = [
  [
    "01",
    "Valuation Mastery",
    "Understand what your property is worth with market context, local expertise, and a clear plan for what comes next.",
  ],
  [
    "02",
    "Strategic Marketing",
    "Give your property the attention it deserves through thoughtful positioning, compelling storytelling, and the right audience.",
  ],
  [
    "03",
    "Negotiation Wizardry",
    "Protect your interests with a steady, experienced partner who knows how to move conversations forward.",
  ],
  [
    "04",
    "Property Management",
    "Make ownership feel effortless with reliable support for the details that keep your investment moving.",
  ],
  [
    "05",
    "Investment Advisory",
    "Turn opportunity into strategy with practical guidance for building a property portfolio around your goals.",
  ],
  [
    "06",
    "Relocation Support",
    "Settle into a new city with a local partner who understands the practical and personal side of moving.",
  ],
];

export default function ServicesPage() {
  return (
    <main className="services-page">
      <div className="announcement-bar">
        <span>✨ Discover Your Dream Property with Estatein</span>
        <Link href="/about">
          Learn More <ArrowIcon />
        </Link>
      </div>
      <SiteHeader active="services" />
      <section className="services-hero">
        <div>
          <span className="section-kicker">ESTATEIN SERVICES</span>
          <h1>
            More than a property search.{" "}
            <span>A partner for what&apos;s next.</span>
          </h1>
          <p>
            From your first question to the moment the keys are yours, our
            services are designed to make real estate feel clearer, calmer, and
            more rewarding.
          </p>
        </div>
        <div className="services-hero-stat">
          <strong>360°</strong>
          <span>Property support</span>
          <small>One considered experience, built around you.</small>
        </div>
      </section>
      <section className="about-section services-list">
        <div className="section-heading">
          <div>
            <span className="section-kicker">HOW WE HELP</span>
            <h2>Expertise that meets you where you are.</h2>
          </div>
          <p>
            Choose the support that fits your current chapter. Our services work
            together, so you can move from an idea to a confident decision.
          </p>
        </div>
        <div className="services-grid">
          {services.map(([number, title, text]) => (
            <article className="service-card" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <Link href="/contact">
                Learn more <ArrowIcon />
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="process-section">
        <div className="process-copy">
          <span className="section-kicker">OUR APPROACH</span>
          <h2>A process that feels as considered as the property.</h2>
          <p>
            We keep the experience focused, honest, and easy to navigate. That
            means fewer surprises, better questions, and a plan you can trust.
          </p>
        </div>
        <div className="process-steps">
          <div>
            <strong>01</strong>
            <h3>Listen first</h3>
            <p>We start with your goals, not a sales pitch.</p>
          </div>
          <div>
            <strong>02</strong>
            <h3>Make it clear</h3>
            <p>We turn options and market details into useful direction.</p>
          </div>
          <div>
            <strong>03</strong>
            <h3>Move with you</h3>
            <p>We stay close through every important decision.</p>
          </div>
        </div>
      </section>
      <section className="contact-cta services-cta">
        <div>
          <span className="section-kicker">LET&apos;S TALK</span>
          <h2>Have a property question?</h2>
          <p>
            Our team is ready to help you find the right service for your next
            move.
          </p>
        </div>
        <Link className="button button-primary" href="/contact">
          Contact Estatein <ArrowIcon />
        </Link>
      </section>
    </main>
  );
}
