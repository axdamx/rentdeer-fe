import PropertyLocationMap from "@/components/property-location-map";
import type { Property } from "@/lib/properties";
import { propertyLocation } from "@/lib/property-location";

export default function PropertyLocationSection({
  property,
}: {
  property: Property;
}) {
  const { address, coordinates } = propertyLocation(property);

  return (
    <section className="property-location-section content-section">
      <div className="section-heading">
        <div>
          <span className="rd-script-label">Location</span>
          <h2>Where you’ll be.</h2>
        </div>
        <p>
          Explore the neighbourhood around <strong>{property.title}</strong>.
        </p>
      </div>
      <PropertyLocationMap
        propertyTitle={property.title}
        address={address}
        coordinates={coordinates}
      />
    </section>
  );
}
