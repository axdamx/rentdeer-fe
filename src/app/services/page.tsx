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
    "Find your next stay",
    "Search by city, room type, and monthly budget, then review the details that matter before you enquire.",
  ],
  [
    "02",
    "Tenant support",
    "Get help with viewing, booking, deposits, rental terms, maintenance, and the move-in journey.",
  ],
  [
    "03",
    "Landlord management",
    "List your property, keep it ready for tenants, and rely on a team that supports the day-to-day rental experience.",
  ],
  [
    "04",
    "Digital agreements",
    "Enter property details, customise the agreement, secure CTC and stamp duty, then generate and share it.",
  ],
  [
    "05",
    "Property agent partnership",
    "Register under your company, close deals, track commission management, and redeem points to cash.",
  ],
  [
    "06",
    "Reliable aftercare",
    "Keep communication moving with practical support for tenants, owners, and partners after the keys change hands.",
  ],
];

const flows = [
  [
    "For tenants",
    "Transparent & convenient",
    "Simple & secure",
    "Preview before signing",
    "Digitally sign anywhere",
  ],
  [
    "For landlords",
    "Enter property details",
    "Customise agreement",
    "Secure CTC & stamp duty",
    "Generate & share",
  ],
  [
    "For property agents",
    "Register under company",
    "Close the deal",
    "Manage commission",
    "Redeem points to cash",
  ],
];

export default function ServicesPage() {
  return (
    <main className="services-page">
      <div className="announcement-bar">
        <span>✨ Rent smarter. Live better with RentDeer.</span>
        <Link href="/about">
          Our Story <ArrowIcon />
        </Link>
      </div>
      <SiteHeader active="services" />
      <section className="services-hero">
        <div>
          <span className="section-kicker">RENTDEER SERVICES</span>
          <h1>
            One rental journey, with support for <span>everyone.</span>
          </h1>
          <p>
            RentDeer makes it easier for tenants to find a home, landlords to
            manage a property, and agents to move deals forward.
          </p>
        </div>
        <div className="services-hero-stat">
          <strong>3</strong>
          <span>Connected rental flows</span>
          <small>
            Tenant, landlord, and agent support in one considered experience.
          </small>
        </div>
      </section>
      <section className="about-section services-list">
        <div className="section-heading">
          <div>
            <span className="section-kicker">HOW WE HELP</span>
            <h2>Practical support for every side of renting.</h2>
          </div>
          <p>
            Choose the service that fits your current chapter. RentDeer keeps
            the next step clear, from first search to signed agreement and
            beyond.
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
          <span className="section-kicker">ROLE-BASED FLOWS</span>
          <h2>Clear steps make better rental decisions.</h2>
          <p>
            Our flow is designed around what each participant needs to do next,
            with useful information and fewer handoffs.
          </p>
        </div>
        <div className="process-steps">
          {flows.map(([role, first, second, third, fourth]) => (
            <div key={role}>
              <strong>{role}</strong>
              <h3>{first}</h3>
              <p>
                {second} · {third} · {fourth}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="contact-cta services-cta">
        <div>
          <span className="section-kicker">LET&apos;S TALK</span>
          <h2>Need help choosing your next step?</h2>
          <p>
            Tell RentDeer whether you are looking for a stay, managing a
            property, or exploring a partnership.
          </p>
        </div>
        <Link className="button button-primary" href="/contact">
          Contact RentDeer <ArrowIcon />
        </Link>
      </section>
    </main>
  );
}
