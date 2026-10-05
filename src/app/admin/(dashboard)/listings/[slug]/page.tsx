import { notFound } from "next/navigation";
import AdminListingForm from "@/components/admin/admin-listing-form";
import AdminPageHeader from "@/components/admin/admin-page-header";
import { getPropertyBySlug } from "@/lib/property-repository";

export default async function AdminEditListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug, true);

  if (!property) notFound();

  return (
    <>
      <AdminPageHeader
        eyebrow="Listings"
        title={`Edit ${property.title}`}
        description="Update property details, rental options, location and media."
      />
      <AdminListingForm mode="edit" initialSlug={property.slug} />
    </>
  );
}
