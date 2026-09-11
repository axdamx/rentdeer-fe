import {
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { properties } from "@/lib/properties";

export default function AdminListingsPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Inventory"
        title="Property listings"
        description="Create properties, manage rental options and control listing availability."
        actions={
          <Button
            className="admin-primary-button"
            nativeButton={false}
            render={<Link href="/admin/listings/new" />}
          >
            <Plus aria-hidden="true" /> Add new listing
          </Button>
        }
      />

      <section className="admin-panel admin-listings-panel">
        <div className="admin-listing-filters">
          <div>
            <Search aria-hidden="true" />
            <input
              placeholder="Search properties..."
              aria-label="Search listings"
            />
          </div>
          <select aria-label="Filter listing status" defaultValue="all">
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
          <Button variant="outline">
            <SlidersHorizontal aria-hidden="true" /> More filters
          </Button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table admin-listings-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Location</th>
                <th>Rental options</th>
                <th>From</th>
                <th>Status</th>
                <th>Updated</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {properties.map((property, index) => {
                const available = property.units.filter(
                  (unit) => unit.available,
                ).length;
                const minimumRent = Math.min(
                  ...property.units.map((unit) => unit.monthlyRent),
                );

                return (
                  <tr key={property.slug}>
                    <td>
                      <strong>{property.title}</strong>
                      <span>{property.propertyType}</span>
                    </td>
                    <td>{property.location}</td>
                    <td>
                      {available} available / {property.units.length} total
                    </td>
                    <td>RM{minimumRent.toLocaleString()}</td>
                    <td>
                      <span
                        className={`admin-status ${index === 2 ? "admin-status-draft" : "admin-status-published"}`}
                      >
                        {index === 2 ? "Draft" : "Published"}
                      </span>
                    </td>
                    <td>{index === 0 ? "Today" : `${index + 2} days ago`}</td>
                    <td>
                      <div className="admin-row-actions">
                        <Link
                          href={`/properties/${property.slug}`}
                          target="_blank"
                          aria-label={`Preview ${property.title}`}
                        >
                          <Eye aria-hidden="true" />
                        </Link>
                        <Link
                          href={`/admin/listings/${property.slug}`}
                          aria-label={`Edit ${property.title}`}
                        >
                          <MoreHorizontal aria-hidden="true" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="admin-table-footer">
          <span>Showing {properties.length} properties</span>
          <div>
            <button type="button" disabled>
              Previous
            </button>
            <button type="button" className="is-active">
              1
            </button>
            <button type="button" disabled>
              Next
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
