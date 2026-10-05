"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Search, SlidersHorizontal } from "lucide-react";
import { useDeferredValue, useState } from "react";
import AdminPageHeader from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { withAdminFeedback } from "@/lib/admin-feedback";
import { apiRequest } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

type AdminEnquiry = {
  id: string;
  reference: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  topic: string;
  message: string;
  status: "new" | "in_progress" | "replied" | "closed";
  created_at: string;
  properties: { title: string; slug: string } | null;
  rental_options: { title: string; slug: string } | null;
};

const statuses = ["all", "new", "in_progress", "replied", "closed"] as const;

export default function AdminEnquiriesPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<(typeof statuses)[number]>("all");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const filters = { status, query: deferredSearch, page: 1 };
  const enquiriesQuery = useQuery({
    queryKey: queryKeys.admin.enquiries(filters),
    queryFn: () => {
      const params = new URLSearchParams({ status, page: "1", pageSize: "50" });
      if (deferredSearch) params.set("query", deferredSearch);
      return withAdminFeedback(
        () =>
          apiRequest<{ data: AdminEnquiry[]; total: number }>(
            `/api/admin/enquiries?${params}`,
          ),
        { loadingMessage: "Loading enquiries..." },
      );
    },
    retry: false,
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: string }) =>
      withAdminFeedback(
        () =>
          apiRequest(`/api/admin/enquiries/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ status: nextStatus }),
          }),
        {
          loadingMessage: "Updating enquiry status...",
          successMessage: "Enquiry status updated.",
          errorMessage: "Unable to update the enquiry status.",
        },
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "enquiries"] }),
  });
  const enquiries = enquiriesQuery.data?.data ?? [];

  const exportCsv = () => {
    const header = [
      "Reference",
      "Name",
      "Email",
      "Topic",
      "Property",
      "Status",
      "Received",
    ];
    const rows = enquiries.map((enquiry) => [
      enquiry.reference,
      `${enquiry.first_name} ${enquiry.last_name}`,
      enquiry.email,
      enquiry.topic,
      enquiry.properties?.title ?? "",
      enquiry.status,
      enquiry.created_at,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => JSON.stringify(cell)).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "rentdeer-enquiries.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Inbox"
        title="Contact enquiries"
        description="Review messages submitted through the RentDeer contact form."
        actions={
          <Button
            variant="outline"
            onClick={exportCsv}
            disabled={!enquiries.length}
          >
            <Download aria-hidden="true" /> Export CSV
          </Button>
        }
      />
      <section className="admin-panel admin-enquiries-panel">
        <div className="admin-enquiry-tabs">
          {statuses.map((value) => (
            <button
              type="button"
              className={status === value ? "is-active" : ""}
              onClick={() => setStatus(value)}
              key={value}
            >
              {value.replace("_", " ")}
              {value === "all" && (
                <span>{enquiriesQuery.data?.total ?? 0}</span>
              )}
            </button>
          ))}
        </div>
        <div className="admin-listing-filters">
          <div>
            <Search aria-hidden="true" />
            <input
              placeholder="Search enquiries..."
              aria-label="Search enquiries"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
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
              </tr>
            </thead>
            <tbody>
              {enquiriesQuery.isPending && (
                <tr>
                  <td colSpan={6}>Loading enquiries...</td>
                </tr>
              )}
              {enquiriesQuery.isError && (
                <tr>
                  <td colSpan={6}>Unable to load enquiries.</td>
                </tr>
              )}
              {enquiries.map((enquiry) => (
                <tr key={enquiry.id}>
                  <td>{enquiry.reference}</td>
                  <td>
                    <strong>
                      {enquiry.first_name} {enquiry.last_name}
                    </strong>
                    <span>{enquiry.email}</span>
                  </td>
                  <td title={enquiry.message}>{enquiry.topic}</td>
                  <td>
                    {enquiry.properties?.title ?? "—"}
                    {enquiry.rental_options && (
                      <span>{enquiry.rental_options.title}</span>
                    )}
                  </td>
                  <td>
                    {new Intl.DateTimeFormat("en-MY", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(enquiry.created_at))}
                  </td>
                  <td>
                    <select
                      aria-label={`Status for ${enquiry.reference}`}
                      value={enquiry.status}
                      disabled={statusMutation.isPending}
                      onChange={(event) =>
                        statusMutation.mutate({
                          id: enquiry.id,
                          nextStatus: event.target.value,
                        })
                      }
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In progress</option>
                      <option value="replied">Replied</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="admin-table-footer">
          <span>
            Showing {enquiries.length} of {enquiriesQuery.data?.total ?? 0}{" "}
            enquiries
          </span>
        </div>
      </section>
    </>
  );
}
