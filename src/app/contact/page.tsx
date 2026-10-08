import ContactContent from "@/components/contact-content";
import { getEnquiryContext } from "@/lib/property-repository";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const property =
    typeof params.property === "string" ? params.property.slice(0, 120) : "";
  const unit = typeof params.unit === "string" ? params.unit.slice(0, 120) : "";
  let enquiry = null;
  if (property) {
    try {
      enquiry = await getEnquiryContext(property, unit);
    } catch (error) {
      console.error("Unable to prepare listing enquiry", error);
    }
  }
  return (
    <ContactContent
      key={`${enquiry?.propertySlug ?? ""}/${enquiry?.rentalOptionSlug ?? ""}`}
      enquiry={enquiry}
    />
  );
}
