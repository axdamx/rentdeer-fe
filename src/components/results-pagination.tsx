"use client";

import type { MouseEvent } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { paginationItems } from "@/lib/property-search";

export default function ResultsPagination({
  page,
  total,
  pageSize,
  noun = "properties",
  label = "Listing pages",
  className = "",
  pageHref,
  onNavigate,
}: {
  page: number;
  total: number;
  pageSize: number;
  noun?: string;
  label?: string;
  className?: string;
  pageHref: (page: number) => string;
  onNavigate: (page: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  const clickPage =
    (target: number, disabled = false) =>
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      event.preventDefault();
      onNavigate(target);
    };
  if (!total) return null;
  return (
    <div className={`listing-pagination ${className}`}>
      <p className="listing-page-count" aria-live="polite">
        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}{" "}
        of {total} {noun}
      </p>
      {totalPages > 1 && (
        <Pagination aria-label={label}>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href={page > 1 ? pageHref(page - 1) : undefined}
                aria-disabled={page === 1}
                tabIndex={page === 1 ? -1 : undefined}
                onClick={clickPage(page - 1, page === 1)}
              />
            </PaginationItem>
            {paginationItems(page, totalPages).map((item) => (
              <PaginationItem key={item}>
                {typeof item === "number" ? (
                  <PaginationLink
                    href={pageHref(item)}
                    isActive={page === item}
                    aria-label={`Page ${item}`}
                    onClick={clickPage(item)}
                  >
                    {item}
                  </PaginationLink>
                ) : (
                  <PaginationEllipsis />
                )}
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href={page < totalPages ? pageHref(page + 1) : undefined}
                aria-disabled={page === totalPages}
                tabIndex={page === totalPages ? -1 : undefined}
                onClick={clickPage(page + 1, page === totalPages)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
