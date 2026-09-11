"use client";

import {
  Check,
  Eye,
  GripVertical,
  ImagePlus,
  Monitor,
  Save,
  Smartphone,
  Upload,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AdminContentPage } from "@/lib/admin-mock-data";

const previewImages = [
  "/estatein/property-villa.png",
  "/estatein/property-tower.png",
  "/estatein/property-campus.png",
];

export default function AdminPageConfigurator({
  page,
}: {
  page: AdminContentPage;
}) {
  const [activeSection, setActiveSection] = useState(
    page.sections[0]?.id ?? "",
  );
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop",
  );
  const [saved, setSaved] = useState(false);
  const selectedSection = page.sections.find(
    (section) => section.id === activeSection,
  );

  const saveDraft = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  };

  return (
    <div className="admin-configurator">
      <div className="admin-configurator-toolbar">
        <div>
          <Link href="/admin/content">Website Content</Link>
          <span>/</span>
          <strong>{page.name}</strong>
        </div>
        <div>
          <div className="admin-preview-toggle">
            <button
              type="button"
              className={previewMode === "desktop" ? "is-active" : ""}
              onClick={() => setPreviewMode("desktop")}
              aria-label="Desktop preview"
            >
              <Monitor aria-hidden="true" />
            </button>
            <button
              type="button"
              className={previewMode === "mobile" ? "is-active" : ""}
              onClick={() => setPreviewMode("mobile")}
              aria-label="Mobile preview"
            >
              <Smartphone aria-hidden="true" />
            </button>
          </div>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={page.route} target="_blank" />}
          >
            <Eye aria-hidden="true" /> Preview
          </Button>
          <Button className="admin-primary-button" onClick={saveDraft}>
            <Save aria-hidden="true" /> Save draft
          </Button>
        </div>
      </div>

      {saved && (
        <output className="admin-save-notice">
          <Check aria-hidden="true" /> Mock changes saved locally.
        </output>
      )}

      <div className="admin-configurator-layout">
        <aside className="admin-section-list">
          <div>
            <span>Page sections</span>
            <small>{page.sections.length} sections</small>
          </div>
          {page.sections.map((section) => (
            <button
              type="button"
              className={activeSection === section.id ? "is-active" : ""}
              key={section.id}
              onClick={() => setActiveSection(section.id)}
            >
              <GripVertical aria-hidden="true" />
              <span>
                <strong>{section.name}</strong>
                <small>{section.assetCount} assets</small>
              </span>
            </button>
          ))}
          <button type="button" className="admin-add-section">
            + Add section
          </button>
        </aside>

        <section className="admin-editor-panel">
          <div className="admin-editor-heading">
            <div>
              <span>Editing section</span>
              <h2>{selectedSection?.name}</h2>
              <p>{selectedSection?.description}</p>
            </div>
            <label className="admin-switch-row">
              <input type="checkbox" defaultChecked />
              <span>Visible</span>
            </label>
          </div>

          <div className="admin-form-section">
            <div className="admin-form-section-heading">
              <h3>Content</h3>
              <p>Update the text displayed in this section.</p>
            </div>
            <div className="admin-form-grid">
              <div>
                <Label htmlFor="eyebrow">Eyebrow label</Label>
                <Input id="eyebrow" defaultValue={selectedSection?.name} />
              </div>
              <div>
                <Label htmlFor="heading">Section heading</Label>
                <Input
                  id="heading"
                  defaultValue={
                    page.slug === "about"
                      ? "Comfortable, quality living should be accessible to everyone."
                      : `A better ${page.name.toLowerCase()} experience.`
                  }
                />
              </div>
              <div className="admin-form-full">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  defaultValue={selectedSection?.description}
                />
              </div>
            </div>
          </div>

          <div className="admin-form-section">
            <div className="admin-form-section-heading">
              <h3>Section assets</h3>
              <p>
                Upload, reorder and describe images used by this section. Files
                will connect to cloud storage later.
              </p>
            </div>
            <label className="admin-upload-zone">
              <input type="file" accept="image/*" multiple />
              <ImagePlus aria-hidden="true" />
              <strong>Drop images here or browse</strong>
              <span>PNG, JPG or WebP · up to 10MB each</span>
              <span className="admin-upload-action">
                <Upload aria-hidden="true" /> Choose files
              </span>
            </label>
            <div className="admin-asset-grid">
              {previewImages.map((image, index) => (
                <article key={image}>
                  <div>
                    <Image
                      src={image}
                      alt="Mock page asset"
                      fill
                      sizes="(max-width: 700px) 50vw, 180px"
                    />
                    <span>{index === 0 ? "Cover" : `0${index + 1}`}</span>
                  </div>
                  <Input
                    aria-label={`Alt text for asset ${index + 1}`}
                    defaultValue={`RentDeer ${selectedSection?.name.toLowerCase()} image`}
                  />
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
