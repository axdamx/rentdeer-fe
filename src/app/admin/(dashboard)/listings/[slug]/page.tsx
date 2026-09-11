import { notFound } from "next/navigation";
import AdminListingForm from "@/components/admin/admin-listing-form";
import AdminPageHeader from "@/components/admin/admin-page-header";
import { properties } from "@/lib/properties";

export function generateStaticParams() {
  return properties.map((property) => ({ slug: property.slug }));
}

export default async function AdminEditListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = properties.find((item) => item.slug === slug);

  if (!property) notFound();

  return (
    <>
      <AdminPageHeader
        eyebrow="Listings"
        title={`Edit ${property.title}`}
        description="Update property details, rental options, location and media."
      />
      <AdminListingForm mode="edit" initialTitle={property.title} />
    </>
  );
}
