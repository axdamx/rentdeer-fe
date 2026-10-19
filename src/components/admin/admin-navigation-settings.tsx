"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { withAdminFeedback } from "@/lib/admin-feedback";
import { apiRequest } from "@/lib/api-client";
import type { ContentPageInput } from "@/lib/listing-schema";
import { type NavigationVisibility, navigationItems } from "@/lib/navigation";

export default function AdminNavigationSettings({
  pages,
}: {
  pages: ContentPageInput[];
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<NavigationVisibility | null>(null);
  const query = useQuery({
    queryKey: ["admin", "navigation"],
    queryFn: () =>
      apiRequest<{ data: NavigationVisibility }>("/api/admin/navigation"),
  });
  const visibility = draft ?? query.data?.data;
  const save = useMutation({
    mutationFn: () =>
      withAdminFeedback(
        () =>
          apiRequest<{ data: NavigationVisibility }>("/api/admin/navigation", {
            method: "PATCH",
            body: JSON.stringify(visibility),
          }),
        {
          loadingMessage: "Saving navigation…",
          successMessage: "Navigation updated.",
        },
      ),
    onSuccess: async ({ data }) => {
      queryClient.setQueryData(["admin", "navigation"], { data });
      setDraft(null);
      await queryClient.invalidateQueries({ queryKey: ["site-navigation"] });
    },
  });
  return (
    <section className="admin-navigation-settings">
      <div className="admin-editor-heading">
        <div>
          <h2>Navigation visibility</h2>
          <p>
            Choose which links appear in the desktop and mobile navbar. Matching
            footer links follow these settings. Published pages stay accessible
            when their menu link is hidden.
          </p>
        </div>
        <Button
          onClick={() => save.mutate()}
          disabled={!draft || save.isPending}
        >
          Save navigation
        </Button>
      </div>
      {query.isPending && <p>Loading navigation settings…</p>}
      {query.isError && <p role="alert">Unable to load navigation settings.</p>}
      {visibility && (
        <div className="admin-navigation-grid">
          {navigationItems.map((item) => {
            const page = pages.find((page) => page.slug === item.pageSlug);
            const published =
              item.pageSlug === null || page?.status === "published";
            return (
              <label key={item.id} className="admin-switch-row">
                <input
                  type="checkbox"
                  checked={visibility[item.id]}
                  disabled={save.isPending}
                  onChange={(event) =>
                    setDraft({ ...visibility, [item.id]: event.target.checked })
                  }
                />
                <span>
                  {item.label}
                  <small>
                    {published
                      ? visibility[item.id]
                        ? "Shown in navigation"
                        : "Hidden from navigation"
                      : "Hidden while page is draft or archived"}
                  </small>
                </span>
              </label>
            );
          })}
        </div>
      )}
    </section>
  );
}
