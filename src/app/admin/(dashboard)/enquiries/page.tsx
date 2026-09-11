import { Download, Mail, Search, SlidersHorizontal } from "lucide-react";
import AdminPageHeader from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { adminEnquiries } from "@/lib/admin-mock-data";

export default function AdminEnquiriesPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Inbox"
        title="Contact enquiries"
        description="Review messages submitted through the RentDeer contact form."
        actions={
          <Button variant="outline">
            <Download aria-hidden="true" /> Export CSV
          </Button>
        }
      />
      <section className="admin-panel admin-enquiries-panel">
        <div className="admin-enquiry-tabs">
          <button type="button" className="is-active">
            All <span>{adminEnquiries.length}</span>
          </button>
          <button type="button">
            New <span>2</span>
          </button>
          <button type="button">In progress</button>
          <button type="button">Closed</button>
        </div>
        <div className="admin-listing-filters">
          <div>
            <Search aria-hidden="true" />
            <input
              placeholder="Search enquiries..."
              aria-label="Search enquiries"
            />
          </div>
          <select aria-label="Filter enquiry type" defaultValue="all">
            <option value="all">All enquiry types</option>
            <option value="tenant">Tenant</option>
            <option value="landlord">Landlord</option>
            <option value="agent">Property agent</option>
          </select>
          <Button variant="outline">
            <SlidersHorizontal aria-hidden="true" /> Filters
          </Button>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table admin-enquiry-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Contact</th>
                <th>Enquiry</th>
                <th>Property</th>
                <th>Received</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {adminEnquiries.map((enquiry) => (
                <tr key={enquiry.id}>
                  <td>{enquiry.id}</td>
                  <td>
                    <strong>{enquiry.name}</strong>
                    <span>{enquiry.email}</span>
                  </td>
                  <td>{enquiry.topic}</td>
                  <td>{enquiry.property}</td>
                  <td>{enquiry.received}</td>
                  <td>
                    <span
                      className={`admin-status admin-status-${enquiry.status.toLowerCase().replace(" ", "-")}`}
                    >
                      {enquiry.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="admin-icon-button"
                      aria-label={`Open ${enquiry.id}`}
                    >
                      <Mail aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-table-footer">
          <span>Showing {adminEnquiries.length} enquiries</span>
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
