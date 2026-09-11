import AdminListingForm from "@/components/admin/admin-listing-form";
import AdminPageHeader from "@/components/admin/admin-page-header";

export default function AdminNewListingPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Listings"
        title="Create a new listing"
        description="Add the property first, then create its individual room or unit options."
      />
      <AdminListingForm />
    </>
  );
}
