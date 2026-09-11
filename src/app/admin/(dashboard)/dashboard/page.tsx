import {
  ArrowRight,
  Building2,
  Eye,
  FileText,
  Inbox,
  Plus,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { adminEnquiries } from "@/lib/admin-mock-data";
import { properties } from "@/lib/properties";

const stats = [
  [
    "Published properties",
    properties.length.toString(),
    "+1 this month",
    Building2,
  ],
  [
    "Rental options",
    properties
      .reduce((total, property) => total + property.units.length, 0)
      .toString(),
    "6 currently available",
    FileText,
  ],
  ["New enquiries", "12", "+18% from last week", Inbox],
  ["Website visitors", "2,418", "+9.4% this month", UsersRound],
] as const;

export default function AdminDashboardPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Overview"
        title="Good morning, Adam."
        description="Here is what is happening across RentDeer today."
        actions={
          <Button
            className="admin-primary-button"
            nativeButton={false}
            render={<Link href="/admin/listings/new" />}
          >
            <Plus aria-hidden="true" /> Add listing
          </Button>
        }
      />

      <section className="admin-stats-grid" aria-label="Admin statistics">
        {stats.map(([label, value, trend, Icon]) => (
          <article className="admin-stat-card" key={label}>
            <div>
              <span>{label}</span>
              <Icon aria-hidden="true" />
            </div>
            <strong>{value}</strong>
            <small>{trend}</small>
          </article>
        ))}
      </section>

      <div className="admin-dashboard-grid">
        <section className="admin-panel admin-recent-enquiries">
          <div className="admin-panel-heading">
            <div>
              <h2>Recent enquiries</h2>
              <p>Latest messages submitted through the website.</p>
            </div>
            <Link href="/admin/enquiries">
              View all <ArrowRight aria-hidden="true" />
            </Link>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Enquirer</th>
                  <th>Topic</th>
                  <th>Status</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {adminEnquiries.slice(0, 4).map((enquiry) => (
                  <tr key={enquiry.id}>
                    <td>
                      <strong>{enquiry.name}</strong>
                      <span>{enquiry.email}</span>
                    </td>
                    <td>{enquiry.topic}</td>
                    <td>
                      <span
                        className={`admin-status admin-status-${enquiry.status.toLowerCase().replace(" ", "-")}`}
                      >
                        {enquiry.status}
                      </span>
                    </td>
                    <td>{enquiry.received}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="admin-panel admin-quick-actions">
          <div className="admin-panel-heading">
            <div>
              <h2>Quick actions</h2>
              <p>Common tasks for the RentDeer team.</p>
            </div>
          </div>
          <Link href="/admin/content/home">
            <FileText aria-hidden="true" />
            <span>
              <strong>Edit homepage</strong>
              <small>Update content and hero assets</small>
            </span>
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link href="/admin/listings/new">
            <Building2 aria-hidden="true" />
            <span>
              <strong>Create a listing</strong>
              <small>Add property details and rooms</small>
            </span>
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link href="/" target="_blank">
            <Eye aria-hidden="true" />
            <span>
              <strong>Preview website</strong>
              <small>Open the public RentDeer site</small>
            </span>
            <ArrowRight aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </>
  );
}
