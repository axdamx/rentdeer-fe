import Image from "next/image";
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

  if (!property) {
    notFound();
  }

  const startingPrice = Math.min(
    ...property.units.map((unit) => unit.monthlyRent),
  );
  const availableUnits = property.units.filter((unit) => unit.available);

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
          images={property.gallery}
          alt={property.title}
          label={`${property.units.length} rental options`}
          priority
        />
        <div className="detail-copy">
          <span className="property-location">
            {property.city} · {property.propertyType}
          </span>
          <h1>{property.title}</h1>
          <p>{property.description}</p>
          <div className="detail-price">
            <span>Rental options from</span>
            <strong>RM{startingPrice.toLocaleString()} / month</strong>
            <small>
              {availableUnits.length} of {property.units.length} options
              currently available
            </small>
          </div>
          <div className="detail-managed-by">
            <span>Managed by</span>
            <strong>{property.managedBy}</strong>
          </div>
          <Link className="button button-primary" href="#rental-options">
            Choose a Rental Option <ArrowIcon />
          </Link>
        </div>
      </section>

      <section className="detail-content content-section">
        <div className="detail-specs">
          <div>
            <span>Rental options</span>
            <strong>{property.units.length}</strong>
          </div>
          <div>
            <span>Available now</span>
            <strong>{availableUnits.length}</strong>
          </div>
          <div>
            <span>Facilities</span>
            <strong>{property.facilities.length}</strong>
          </div>
          <div>
            <span>Area</span>
            <strong>{property.city}</strong>
          </div>
        </div>
        <div className="detail-lower">
          <div>
            <span className="section-kicker">ABOUT THIS PROPERTY</span>
            <h2>Everything you need before you move in.</h2>
            <p>
              {property.description} Explore the residence, compare the
              available rooms or units, and review the rental terms before
              sending your enquiry.
            </p>
          </div>
          <div className="detail-feature-box">
            <span className="section-kicker">PROPERTY FACILITIES</span>
            {property.facilities.map((facility) => (
              <div key={facility}>
                <span className="detail-check">✓</span>
                {facility}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="detail-units-section content-section"
        id="rental-options"
      >
        <div className="section-heading">
          <div>
            <span className="section-kicker">RENTAL OPTIONS</span>
            <h2>Choose the way you want to live here.</h2>
          </div>
          <p>
            Compare the room or unit options within this residence. Availability
            and pricing are mock data for now.
          </p>
        </div>
        <div className="unit-grid">
          {property.units.map((unit) => (
            <article className="unit-card" key={unit.slug}>
              <div className="unit-card-image">
                <Image
                  src={unit.image}
                  alt={unit.title}
                  fill
                  sizes="(max-width: 700px) 100vw, 33vw"
                />
                <span
                  className={
                    unit.available
                      ? "unit-status"
                      : "unit-status is-unavailable"
                  }
                >
                  {unit.available ? "Available" : "Currently rented"}
                </span>
              </div>
              <div className="unit-card-content">
                <span className="property-location">{unit.roomType}</span>
                <h3>{unit.title}</h3>
                <p>{unit.description}</p>
                <div className="unit-card-meta">
                  <span>{unit.bedrooms} bedroom</span>
                  <span>{unit.toilets} toilet</span>
                  <span>{unit.area}</span>
                </div>
                <div className="unit-card-bottom">
                  <strong>
                    RM{unit.monthlyRent.toLocaleString()} <small>/ month</small>
                  </strong>
                  <div className="unit-card-actions">
                    <Link
                      className="unit-card-view"
                      href={`/properties/${property.slug}/units/${unit.slug}`}
                    >
                      View details <ArrowIcon />
                    </Link>
                    <Link
                      className="button button-secondary"
                      href={`/contact?property=${property.slug}&unit=${unit.slug}`}
                    >
                      Enquire <ArrowIcon />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          ))}
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
          <h2>Ready to find your room here?</h2>
          <p>
            Our tenant enquiry team can answer your questions and help you
            compare the available rental options.
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
