"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useState } from "react";
import AdminPageHeader from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";
import type { Property } from "@/lib/properties";
import { queryKeys } from "@/lib/query-keys";

export default function AdminListingsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const deferredSearch = useDeferredValue(search);
  const filters = { query: deferredSearch, status, page: 1 };
  const propertiesQuery = useQuery({
    queryKey: queryKeys.admin.properties(filters),
    queryFn: () => {
      const params = new URLSearchParams({
        page: "1",
        pageSize: "25",
        status,
      });
      if (deferredSearch) params.set("query", deferredSearch);
      return apiRequest<{ data: Property[]; total: number }>(
        `/api/admin/properties?${params}`,
      );
    },
  });
  const properties = propertiesQuery.data?.data ?? [];

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
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <select
            aria-label="Filter listing status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
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
              {propertiesQuery.isPending && (
                <tr>
                  <td colSpan={7}>Loading listings...</td>
                </tr>
              )}
              {propertiesQuery.isError && (
                <tr>
                  <td colSpan={7}>Unable to load listings.</td>
                </tr>
              )}
              {properties.map((property) => {
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
                        className={`admin-status admin-status-${property.status ?? "published"}`}
                      >
                        {(property.status ?? "published").replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      {property.updatedAt
                        ? new Intl.DateTimeFormat("en-MY", {
                            dateStyle: "medium",
                          }).format(new Date(property.updatedAt))
                        : "—"}
                    </td>
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
          <span>
            Showing {properties.length} of {propertiesQuery.data?.total ?? 0}{" "}
            properties
          </span>
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
