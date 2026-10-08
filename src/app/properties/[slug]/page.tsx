import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import PropertyGallery from "@/components/property-gallery";
import PropertyLocationMap from "@/components/property-location-map";
import RentalOptionsBrowser from "@/components/rental-options-browser";
import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";
import { transitStationById } from "@/lib/listing-reference-data";
import { getPropertyOverviewBySlug } from "@/lib/property-repository";
import { enquiryHref } from "@/lib/rental-options";

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

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const overview = await getPropertyOverviewBySlug(slug);

  if (!overview) {
    notFound();
  }

  const {
    property,
    startingPrice,
    total: totalOptions,
    available: availableOptions,
  } = overview;
  const transitConnections = property.transitConnections.flatMap(
    (connection) => {
      const station = transitStationById.get(connection.stationId);
      return station ? [{ ...connection, station }] : [];
    },
  );
  const propertyAddress = [
    property.addressLine,
    property.postcode,
    property.area,
    property.city,
    property.state,
  ]
    .filter(Boolean)
    .join(", ");
  const coordinates: [number, number] | null =
    property.latitude != null && property.longitude != null
      ? [property.latitude, property.longitude]
      : null;

  return (
    <main className="property-detail-page">
      <section className="detail-top-shell">
        <SiteHeader active="properties" tone="dark" />
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
            label={`${totalOptions} rental options`}
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
              <strong>
                {startingPrice == null
                  ? "Pricing on request"
                  : `RM${startingPrice.toLocaleString()} / month`}
              </strong>
              <small>
                {availableOptions} of {totalOptions} options currently available
              </small>
            </div>
            <div className="detail-managed-by">
              <span>Managed by</span>
              <strong>{property.managedBy}</strong>
            </div>
            <Link className="rd-yellow-button" href="#rental-options">
              Choose a Rental Option <ArrowIcon />
            </Link>
          </div>
        </section>
      </section>

      <section className="detail-content content-section">
        <div className="detail-specs">
          <div>
            <span>Rental options</span>
            <strong>{totalOptions}</strong>
          </div>
          <div>
            <span>Available now</span>
            <strong>{availableOptions}</strong>
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
            <span className="rd-script-label">About this property</span>
            <h2>Everything you need before you move in.</h2>
            <p>
              {property.description} Explore the residence, compare the
              available rooms or units, and review the rental terms before
              sending your enquiry.
            </p>
          </div>
          <div className="detail-feature-box">
            <span className="rd-script-label">Property facilities</span>
            {property.facilities.map((facility) => (
              <div key={facility}>
                <span className="detail-check">✓</span>
                {facility}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Suspense
        fallback={
          <section
            className="detail-units-section rd-detail-green-section content-section"
            id="rental-options"
          >
            <p>Loading rental options...</p>
          </section>
        }
      >
        <RentalOptionsBrowser
          propertySlug={property.slug}
          propertyTitle={property.title}
          totalOptions={totalOptions}
        />
      </Suspense>

      <section className="detail-discovery-grid content-section">
        <div className="detail-panel">
          <span className="rd-script-label">Good to know</span>
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
          <span className="rd-script-label">Rental terms</span>
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

      <section className="detail-discovery-grid detail-rules-grid rd-detail-green-section content-section">
        <div className="detail-panel">
          <span className="rd-script-label">House rules</span>
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
          <span className="rd-script-label">Availability</span>
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
          {transitConnections.length > 0 && (
            <div className="detail-transit-connections">
              <strong>Nearby public transport</strong>
              {transitConnections.map((connection) => (
                <div key={connection.stationId}>
                  <span
                    style={{
                      background: connection.station.lineColor,
                      color: connection.station.lineTextColor,
                    }}
                  >
                    {connection.station.lineCode}
                  </span>
                  <div>
                    <strong>{connection.station.station}</strong>
                    <small>
                      {connection.accessMinutes} min {connection.accessMode}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="detail-review-section content-section">
        <div className="detail-review-copy">
          <span className="rd-script-label">Tenant experience</span>
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

      <section className="detail-booking-section rd-detail-green-section content-section">
        <div>
          <span className="rd-script-label">How it works</span>
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
            <span className="rd-script-label">Location</span>
            <h2>See the area before you enquire.</h2>
          </div>
          <p>
            {coordinates
              ? propertyAddress
              : "Map coordinates have not been added for this property yet."}
          </p>
        </div>
        {coordinates ? (
          <PropertyLocationMap
            propertyTitle={property.title}
            address={propertyAddress || property.location}
            coordinates={coordinates}
          />
        ) : (
          <div className="property-map-empty">
            Add the property coordinates in Admin to display its exact map
            location.
          </div>
        )}
      </section>
      <section className="rd-page-cta-section">
        <div className="about-cta detail-cta">
          <div>
            <span className="rd-script-label">Take the next step</span>
            <h2>Ready to find your room here?</h2>
            <p>
              Our tenant enquiry team can answer your questions and help you
              compare the available rental options.
            </p>
          </div>
          <Link className="rd-yellow-button" href={enquiryHref(property.slug)}>
            Submit Enquiry <ArrowIcon />
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
