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
import { hasSupabaseEnv } from "@/lib/env";
import { listProperties } from "@/lib/property-repository";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const propertyResult = await listProperties({ admin: true, pageSize: 100 });
  const properties = propertyResult.data;
  let enquiries = adminEnquiries;
  let newEnquiryCount = adminEnquiries.filter(
    (enquiry) => enquiry.status === "New",
  ).length;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("enquiries")
      .select(
        "reference, first_name, last_name, email, topic, status, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(4);
    enquiries = (data ?? []).map((enquiry) => ({
      id: enquiry.reference,
      name: `${enquiry.first_name} ${enquiry.last_name}`,
      email: enquiry.email,
      topic: enquiry.topic,
      property: "—",
      received: new Intl.DateTimeFormat("en-MY", {
        dateStyle: "medium",
      }).format(new Date(enquiry.created_at)),
      status:
        enquiry.status === "in_progress"
          ? "In progress"
          : `${enquiry.status.charAt(0).toUpperCase()}${enquiry.status.slice(1)}`,
    }));
    const { count } = await supabase
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "new");
    newEnquiryCount = count ?? 0;
  }

  const rentalOptionCount = properties.reduce(
    (total, property) => total + property.units.length,
    0,
  );
  const availableCount = properties.reduce(
    (total, property) =>
      total + property.units.filter((unit) => unit.available).length,
    0,
  );
  const stats = [
    [
      "Published properties",
      properties
        .filter((property) => property.status !== "draft")
        .length.toString(),
      `${properties.length} total records`,
      Building2,
    ],
    [
      "Rental options",
      rentalOptionCount.toString(),
      `${availableCount} currently available`,
      FileText,
    ],
    ["New enquiries", newEnquiryCount.toString(), "Awaiting review", Inbox],
    ["Website visitors", "—", "Connect analytics later", UsersRound],
  ] as const;

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
                {enquiries.slice(0, 4).map((enquiry) => (
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
