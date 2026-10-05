"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
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
import { withAdminFeedback } from "@/lib/admin-feedback";
import { apiRequest } from "@/lib/api-client";
import type { ContentPageInput } from "@/lib/listing-schema";

const previewImages = [
  "/estatein/property-villa.png",
  "/estatein/property-tower.png",
  "/estatein/property-campus.png",
];

export default function AdminPageConfigurator({
  page,
}: {
  page: ContentPageInput;
}) {
  const queryClient = useQueryClient();
  const [draftPage, setDraftPage] = useState(page);
  const [activeSection, setActiveSection] = useState(
    page.sections[0]?.id ?? "",
  );
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop",
  );
  const [uploading, setUploading] = useState(false);
  const selectedSection = draftPage.sections.find(
    (section) => section.id === activeSection,
  );
  const saveMutation = useMutation({
    mutationFn: () =>
      withAdminFeedback(
        () =>
          apiRequest<{ data: ContentPageInput }>(
            `/api/admin/content/${draftPage.slug}`,
            { method: "PATCH", body: JSON.stringify(draftPage) },
          ),
        {
          loadingMessage: `Saving ${draftPage.name}...`,
          successMessage: `${draftPage.name} updated successfully.`,
          errorMessage: `Unable to update ${draftPage.name}.`,
        },
      ),
    onSuccess: async ({ data }) => {
      setDraftPage(data);
      await queryClient.invalidateQueries({ queryKey: ["admin", "content"] });
    },
  });

  const saveDraft = () => {
    saveMutation.mutate();
  };

  const updateSelectedSection = (
    update: Partial<ContentPageInput["sections"][number]>,
  ) => {
    setDraftPage((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === activeSection ? { ...section, ...update } : section,
      ),
    }));
  };

  const updateSelectedContent = (
    key: keyof ContentPageInput["sections"][number]["content"],
    value: string,
  ) => {
    if (!selectedSection) return;
    updateSelectedSection({
      content: { ...selectedSection.content, [key]: value },
    });
  };

  const uploadAssets = async (files: FileList | null) => {
    if (!files?.length || !selectedSection) return;
    setUploading(true);
    try {
      await withAdminFeedback(
        async () => {
          const body = new FormData();
          body.set("ownerType", "contentSection");
          body.set("ownerId", selectedSection.id);
          for (const file of Array.from(files)) body.append("files", file);
          const response = await fetch("/api/admin/media", {
            method: "POST",
            body,
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error ?? "Upload failed.");
          return result;
        },
        {
          loadingMessage: `Uploading ${files.length} asset${files.length === 1 ? "" : "s"}...`,
          successMessage: `${files.length} asset${files.length === 1 ? "" : "s"} uploaded.`,
          errorMessage: "Unable to upload the selected assets.",
        },
      );
      updateSelectedSection({
        assetCount: selectedSection.assetCount + files.length,
      });
    } catch {
      // The shared admin feedback layer presents the error toast.
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-configurator">
      <div className="admin-configurator-toolbar">
        <div>
          <Link href="/admin/content">Website Content</Link>
          <span>/</span>
          <strong>{draftPage.name}</strong>
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
            render={<Link href={draftPage.route} target="_blank" />}
          >
            <Eye aria-hidden="true" /> Preview
          </Button>
          <Button
            className="admin-primary-button"
            onClick={saveDraft}
            disabled={saveMutation.isPending}
          >
            <Save aria-hidden="true" />
            {saveMutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>

      <div className="admin-configurator-layout">
        <aside className="admin-section-list">
          <div>
            <span>Page sections</span>
            <small>{draftPage.sections.length} sections</small>
          </div>
          {draftPage.sections.map((section) => (
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
              <p>{selectedSection?.content.description}</p>
            </div>
            <label className="admin-switch-row">
              <input
                type="checkbox"
                checked={selectedSection?.isVisible ?? false}
                onChange={(event) =>
                  updateSelectedSection({ isVisible: event.target.checked })
                }
              />
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
                <Input
                  id="eyebrow"
                  value={selectedSection?.content.eyebrow ?? ""}
                  onChange={(event) =>
                    updateSelectedContent("eyebrow", event.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="heading">Section heading</Label>
                <Input
                  id="heading"
                  value={selectedSection?.content.heading ?? ""}
                  onChange={(event) =>
                    updateSelectedContent("heading", event.target.value)
                  }
                />
              </div>
              <div className="admin-form-full">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={selectedSection?.content.description ?? ""}
                  onChange={(event) =>
                    updateSelectedContent("description", event.target.value)
                  }
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
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                disabled={uploading}
                onChange={(event) => uploadAssets(event.target.files)}
              />
              <ImagePlus aria-hidden="true" />
              <strong>
                {uploading ? "Uploading..." : "Drop images here or browse"}
              </strong>
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
