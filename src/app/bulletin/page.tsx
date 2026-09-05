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

const updates = [
  [
    "Renting guide",
    "Before you book a room",
    "A practical checklist for comparing locations, room types, deposits, facilities, and rental terms before you enquire.",
  ],
  [
    "Community",
    "Settling into shared living",
    "Small habits make shared spaces better: keep the kitchen clean, respect quiet hours, and communicate early when something needs attention.",
  ],
  [
    "For landlords",
    "Preparing a property for tenants",
    "The details that help a listing perform: accurate information, move-in-ready spaces, and a clear handover experience.",
  ],
];

export default function BulletinPage() {
  return (
    <main className="bulletin-page">
      <div className="announcement-bar">
        <span>✨ Rent smarter. Live better with RentDeer.</span>
        <Link href="/properties">
          Find a stay <ArrowIcon />
        </Link>
      </div>
      <SiteHeader active="bulletin" />
      <section className="bulletin-hero">
        <span className="section-kicker">RENTDEER BULLETIN</span>
        <h1>
          Useful ideas for the <span>rental journey.</span>
        </h1>
        <p>
          Guides, community notes, and practical updates for tenants, landlords,
          and property agents.
        </p>
      </section>
      <section className="content-section bulletin-content">
        <div className="section-heading">
          <div>
            <span className="section-kicker">LATEST NOTES</span>
            <h2>Small details make moving easier.</h2>
          </div>
          <p>
            We are building a rental experience that keeps people informed at
            every stage.
          </p>
        </div>
        <div className="bulletin-grid">
          {updates.map(([category, title, text], index) => (
            <article className="bulletin-card" key={title}>
              <span className="bulletin-number">0{index + 1}</span>
              <span className="section-kicker">{category}</span>
              <h3>{title}</h3>
              <p>{text}</p>
              <Link href="/contact">
                Ask RentDeer <ArrowIcon />
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section className="contact-cta bulletin-cta">
        <div>
          <span className="section-kicker">KEEP EXPLORING</span>
          <h2>Ready to find your next stay?</h2>
          <p>
            Browse current listings and submit an enquiry when you find a good
            fit.
          </p>
        </div>
        <Link className="button button-primary" href="/properties">
          View Properties <ArrowIcon />
        </Link>
      </section>
    </main>
  );
}
