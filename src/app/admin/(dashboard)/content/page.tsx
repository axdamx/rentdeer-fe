import { ArrowRight, Eye, ImageIcon, PanelsTopLeft } from "lucide-react";
import Link from "next/link";
import AdminPageHeader from "@/components/admin/admin-page-header";
import { adminContentPages } from "@/lib/admin-mock-data";

export default function AdminContentPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Website"
        title="Website content"
        description="Configure the copy, images and visibility of each public page."
      />
      <section className="admin-content-summary">
        <div>
          <PanelsTopLeft aria-hidden="true" />
          <span>
            <strong>{adminContentPages.length} managed pages</strong>
            <small>Page-level configuration with contextual assets</small>
          </span>
        </div>
        <div>
          <ImageIcon aria-hidden="true" />
          <span>
            <strong>18 website assets</strong>
            <small>Images are managed inside their relevant sections</small>
          </span>
        </div>
      </section>
      <section className="admin-content-grid">
        {adminContentPages.map((page) => {
          const assetCount = page.sections.reduce(
            (total, section) => total + section.assetCount,
            0,
          );

          return (
            <article className="admin-content-card" key={page.slug}>
              <div className="admin-content-card-top">
                <span
                  className={`admin-status admin-status-${page.status.toLowerCase()}`}
                >
                  {page.status}
                </span>
                <Link
                  href={page.route}
                  target="_blank"
                  aria-label={`Preview ${page.name}`}
                >
                  <Eye aria-hidden="true" />
                </Link>
              </div>
              <h2>{page.name}</h2>
              <p>{page.description}</p>
              <div className="admin-content-meta">
                <span>{page.sections.length} sections</span>
                <span>{assetCount} assets</span>
                <span>Updated {page.lastUpdated}</span>
              </div>
              <Link
                className="admin-content-edit"
                href={`/admin/content/${page.slug}`}
              >
                Configure page <ArrowRight aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </section>
    </>
  );
}
