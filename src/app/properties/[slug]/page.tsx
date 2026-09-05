import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/site-header";
import { getProperty, properties } from "@/lib/properties";

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

export function generateStaticParams() {
  return properties.map((property) => ({ slug: property.slug }));
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = getProperty(slug);
  if (!property) notFound();

  return (
    <main className="property-detail-page">
      <div className="announcement-bar">
        <span>✨ Rent smarter. Live better with RentDeer.</span>
        <Link href="/about">
          Our Story <ArrowIcon />
        </Link>
      </div>
      <SiteHeader active="properties" />
      <div className="detail-breadcrumb">
        <Link href="/properties">Properties</Link>
        <span>/</span>
        <span>{property.title}</span>
      </div>
      <section className="detail-hero content-section">
        <div className="detail-image">
          <Image
            src={property.image}
            alt={property.title}
            fill
            priority
            sizes="(max-width: 700px) 100vw, 55vw"
          />
        </div>
        <div className="detail-copy">
          <span className="property-location">
            {property.city} · {property.roomType}
          </span>
          <h1>{property.title}</h1>
          <p>{property.description}</p>
          <div className="detail-price">
            <span>Monthly rent</span>
            <strong>RM{property.monthlyRent.toLocaleString()} / month</strong>
          </div>
          <Link className="button button-primary" href="/contact">
            Enquire About This Stay <ArrowIcon />
          </Link>
        </div>
      </section>
      <section className="detail-content content-section">
        <div className="detail-specs">
          <div>
            <span>Bedrooms</span>
            <strong>{property.bedrooms}</strong>
          </div>
          <div>
            <span>Toilets</span>
            <strong>{property.toilets}</strong>
          </div>
          <div>
            <span>Property size</span>
            <strong>{property.area}</strong>
          </div>
          <div>
            <span>Room type</span>
            <strong>{property.roomType}</strong>
          </div>
        </div>
        <div className="detail-lower">
          <div>
            <span className="section-kicker">RENTAL OVERVIEW</span>
            <h2>Everything you need before you move in.</h2>
            <p>
              {property.description} Review the amenities, facilities, rental
              terms, and support available before sending your enquiry.
            </p>
          </div>
          <div className="detail-feature-box">
            <span className="section-kicker">AMENITIES &amp; FACILITIES</span>
            {[...property.amenities, ...property.facilities].map((feature) => (
              <div key={feature}>
                <span className="detail-check">✓</span>
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="contact-cta detail-cta">
        <div>
          <span className="section-kicker">TAKE THE NEXT STEP</span>
          <h2>Ready to make this your next stay?</h2>
          <p>
            Our tenant enquiry team can answer your questions and help you
            understand the booking process.
          </p>
        </div>
        <Link className="button button-primary" href="/contact">
          Submit Enquiry <ArrowIcon />
        </Link>
      </section>
    </main>
  );
}
