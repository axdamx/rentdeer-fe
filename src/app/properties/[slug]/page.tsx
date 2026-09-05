import Link from "next/link";
import { notFound } from "next/navigation";
import PropertyGallery from "@/components/property-gallery";
import PropertyLocationMap from "@/components/property-location-map";
import SiteFooter from "@/components/site-footer";
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
        <PropertyGallery
          className="detail-image"
          images={[property.image]}
          alt={property.title}
          priority
        />
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
      <section className="detail-discovery-grid content-section">
        <div className="detail-panel">
          <span className="section-kicker">GOOD TO KNOW</span>
          <h2>Highlights at a glance.</h2>
          <div className="detail-bullet-list">
            {property.details.highlights.map((highlight) => (
              <div key={highlight}>
                <span className="detail-check">✓</span>
                <span>{highlight}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="detail-panel">
          <span className="section-kicker">RENTAL TERMS</span>
          <h2>Know the important details.</h2>
          <div className="detail-term-list">
            {property.details.rentalTerms.map(({ label, value }) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="detail-discovery-grid detail-rules-grid content-section">
        <div className="detail-panel">
          <span className="section-kicker">HOUSE RULES</span>
          <h2>Know what shared living feels like.</h2>
          <div className="detail-bullet-list">
            {property.details.houseRules.map((rule) => (
              <div key={rule}>
                <span className="detail-check">✓</span>
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="detail-panel detail-availability-panel">
          <span className="section-kicker">AVAILABILITY</span>
          <h2>{property.details.availability}</h2>
          <p>{property.details.responseTime}</p>
          <div className="detail-nearby-list">
            {property.details.nearby.map(({ label, distance }) => (
              <div key={label}>
                <span>{label}</span>
                <strong>{distance}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="detail-review-section content-section">
        <div className="detail-review-copy">
          <span className="section-kicker">TENANT EXPERIENCE</span>
          <h2>What moving in can feel like.</h2>
          <p>
            Mock review data for now. Later, this can be connected to verified
            tenant feedback and property-level ratings.
          </p>
        </div>
        <div className="detail-review-card">
          <strong className="detail-review-rating">
            {property.details.review.rating} <span>★</span>
          </strong>
          <blockquote>&ldquo;{property.details.review.quote}&rdquo;</blockquote>
          <p>
            {property.details.review.author} · {property.details.review.role}
          </p>
        </div>
      </section>
      <section className="detail-booking-section content-section">
        <div>
          <span className="section-kicker">HOW IT WORKS</span>
          <h2>From enquiry to move-in.</h2>
          <p>
            Keep the next step visible so renters know what happens after they
            find a place they like.
          </p>
        </div>
        <ol className="detail-booking-steps">
          {property.details.bookingSteps.map((step, index) => (
            <li key={step}>
              <span>0{index + 1}</span>
              <strong>{step}</strong>
            </li>
          ))}
        </ol>
      </section>
      <section className="property-location-section content-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">LOCATION</span>
            <h2>See the area before you enquire.</h2>
          </div>
          <p>
            This is a temporary viewing point near KLCC. We can replace it with
            the property&apos;s real address or latitude and longitude when the
            listing data is ready.
          </p>
        </div>
        <PropertyLocationMap
          propertyTitle={property.title}
          address="Mock RentDeer viewing point near KLCC, Kuala Lumpur"
          coordinates={[3.1579, 101.7116]}
        />
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
      <SiteFooter />
    </main>
  );
}
