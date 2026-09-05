import Link from "next/link";
import { notFound } from "next/navigation";
import PropertyGallery from "@/components/property-gallery";
import PropertyLocationMap from "@/components/property-location-map";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { properties } from "@/lib/properties";

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
  return properties.flatMap((property) =>
    property.units.map((unit) => ({
      slug: property.slug,
      unitSlug: unit.slug,
    })),
  );
}

export default async function RentalUnitPage({
  params,
}: {
  params: Promise<{ slug: string; unitSlug: string }>;
}) {
  const { slug, unitSlug } = await params;
  const property = properties.find((item) => item.slug === slug);
  const unit = property?.units.find((item) => item.slug === unitSlug);

  if (!property || !unit) {
    notFound();
  }

  return (
    <main className="property-detail-page unit-detail-page">
      <div className="announcement-bar">
        <span>✨ Rent smarter. Live better with RentDeer.</span>
        <Link href={`/properties/${property.slug}`}>
          Back to Property <ArrowIcon />
        </Link>
      </div>
      <SiteHeader active="properties" />
      <div className="detail-breadcrumb">
        <Link href="/properties">Properties</Link>
        <span>/</span>
        <Link href={`/properties/${property.slug}`}>{property.title}</Link>
        <span>/</span>
        <span>{unit.title}</span>
      </div>

      <section className="detail-hero content-section">
        <PropertyGallery
          className="detail-image"
          images={[unit.image, ...property.gallery]}
          alt={unit.title}
          label={unit.roomType}
          priority
        />
        <div className="detail-copy">
          <span className="property-location">
            {unit.roomType} · {property.city}
          </span>
          <h1>{unit.title}</h1>
          <p>{unit.description}</p>
          <div className="detail-price">
            <span>Monthly rent</span>
            <strong>RM{unit.monthlyRent.toLocaleString()} / month</strong>
            <small>
              {unit.available
                ? "Available to enquire"
                : "Currently rented — ask about similar options"}
            </small>
          </div>
          <Link
            className="button button-primary"
            href={`/contact?property=${property.slug}&unit=${unit.slug}`}
          >
            Enquire About This Unit <ArrowIcon />
          </Link>
        </div>
      </section>

      <section className="detail-content content-section">
        <div className="detail-specs">
          <div>
            <span>Bedrooms</span>
            <strong>{unit.bedrooms}</strong>
          </div>
          <div>
            <span>Toilets</span>
            <strong>{unit.toilets}</strong>
          </div>
          <div>
            <span>Property size</span>
            <strong>{unit.area}</strong>
          </div>
          <div>
            <span>Furnished</span>
            <strong>{unit.furnished ? "Yes" : "No"}</strong>
          </div>
        </div>
        <div className="detail-lower">
          <div>
            <span className="section-kicker">ABOUT THIS UNIT</span>
            <h2>A clearer view before you decide.</h2>
            <p>
              {unit.description} This unit is part of{" "}
              <Link
                className="inline-link"
                href={`/properties/${property.slug}`}
              >
                {property.title}
              </Link>
              , a RentDeer-managed residence with shared facilities and support.
            </p>
          </div>
          <div className="detail-feature-box">
            <span className="section-kicker">SHARED WITH THIS PROPERTY</span>
            {property.facilities.map((facility) => (
              <div key={facility}>
                <span className="detail-check">✓</span>
                {facility}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="unit-detail-info-grid content-section">
        <div className="detail-panel">
          <span className="section-kicker">RENTAL CHECKLIST</span>
          <h2>What to expect next.</h2>
          <div className="detail-bullet-list">
            <div>
              <span className="detail-check">✓</span>
              <span>Viewing can be arranged with the RentDeer team</span>
            </div>
            <div>
              <span className="detail-check">✓</span>
              <span>Deposit is required upon booking confirmation</span>
            </div>
            <div>
              <span className="detail-check">✓</span>
              <span>Minimum rental period is 6 months</span>
            </div>
            <div>
              <span className="detail-check">✓</span>
              <span>Review terms before signing</span>
            </div>
          </div>
        </div>
        <div className="detail-panel">
          <span className="section-kicker">PART OF THE RESIDENCE</span>
          <h2>See the other options.</h2>
          <p>
            Compare this unit with the other rooms and homes available at{" "}
            {property.title}.
          </p>
          <Link
            className="button button-secondary"
            href={`/properties/${property.slug}`}
          >
            View All Units <ArrowIcon />
          </Link>
        </div>
      </section>

      <section className="property-location-section content-section">
        <div className="section-heading">
          <div>
            <span className="section-kicker">LOCATION</span>
            <h2>Understand the neighbourhood.</h2>
          </div>
          <p>
            This is a temporary viewing point near KLCC. Replace the mock
            coordinates with the real property coordinates when available.
          </p>
        </div>
        <PropertyLocationMap
          propertyTitle={unit.title}
          address={`Mock viewing point for ${property.title} near KLCC, Kuala Lumpur`}
          coordinates={[3.1579, 101.7116]}
        />
      </section>
      <section className="contact-cta detail-cta">
        <div>
          <span className="section-kicker">READY TO ASK?</span>
          <h2>Make this unit your next step.</h2>
          <p>
            Send an enquiry with your preferred move-in date and the RentDeer
            team will guide you from there.
          </p>
        </div>
        <Link
          className="button button-primary"
          href={`/contact?property=${property.slug}&unit=${unit.slug}`}
        >
          Start Enquiry <ArrowIcon />
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
