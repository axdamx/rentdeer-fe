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
        <span>✨ Discover Your Dream Property with Estatein</span>
        <Link href="/about">
          Learn More <ArrowIcon />
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
          <span className="property-location">{property.location}</span>
          <h1>{property.title}</h1>
          <p>{property.description}</p>
          <div className="detail-price">
            <span>Price</span>
            <strong>${property.price.toLocaleString()}</strong>
          </div>
          <Link className="button button-primary" href="/contact">
            Inquire About This Property <ArrowIcon />
          </Link>
        </div>
      </section>
      <section className="detail-content content-section">
        <div className="detail-specs">
          <div>
            <span>Bedrooms</span>
            <strong>{property.beds}</strong>
          </div>
          <div>
            <span>Bathrooms</span>
            <strong>{property.baths}</strong>
          </div>
          <div>
            <span>Property size</span>
            <strong>{property.area}</strong>
          </div>
          <div>
            <span>Property type</span>
            <strong>{property.type}</strong>
          </div>
        </div>
        <div className="detail-lower">
          <div>
            <span className="section-kicker">PROPERTY OVERVIEW</span>
            <h2>Designed for how you want to live.</h2>
            <p>
              {property.description} Every detail has been considered to create
              a home that feels effortlessly yours, from the first step through
              the front door.
            </p>
          </div>
          <div className="detail-feature-box">
            <span className="section-kicker">HIGHLIGHTS</span>
            {property.features.map((feature) => (
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
          <h2>Could this be your next chapter?</h2>
          <p>
            Our property team can answer your questions and arrange a private
            viewing.
          </p>
        </div>
        <Link className="button button-primary" href="/contact">
          Request a Viewing <ArrowIcon />
        </Link>
      </section>
    </main>
  );
}
