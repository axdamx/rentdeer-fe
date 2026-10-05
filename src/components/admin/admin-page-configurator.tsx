"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Eye,
  GripVertical,
  ImagePlus,
  Monitor,
  Plus,
  Save,
  Smartphone,
  Star,
  Trash2,
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

type TeamMemberInput =
  ContentPageInput["sections"][number]["content"]["teamMembers"][number];

const defaultTeamMembers: TeamMemberInput[] = [
  {
    id: "haziq",
    name: "Mr. Haziq",
    title: "CEO",
    description:
      "Helping shape RentDeer's journey through better living and smarter property solutions.",
    imageAssetId: null,
  },
  {
    id: "syafiq",
    name: "Mr. Syafiq",
    title: "CFO",
    description:
      "Building a stable and sustainable future for RentDeer's tenants and property partners.",
    imageAssetId: null,
  },
];

export default function AdminPageConfigurator({
  page,
}: {
  page: ContentPageInput;
}) {
  const queryClient = useQueryClient();
  const [draftPage, setDraftPage] = useState(() => ({
    ...page,
    sections: page.sections.map((section) =>
      section.sectionKey === "team" && !section.content.teamMembers.length
        ? {
            ...section,
            content: { ...section.content, teamMembers: defaultTeamMembers },
          }
        : section,
    ),
  }));
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
  const isTeamSection = selectedSection?.sectionKey === "team";
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
    key: "eyebrow" | "heading" | "description",
    value: string,
  ) => {
    if (!selectedSection) return;
    updateSelectedSection({
      content: { ...selectedSection.content, [key]: value },
    });
  };

  const uploadAssets = async (
    files: FileList | null,
    teamMemberId?: string,
  ) => {
    if (!files?.length || !selectedSection) return;
    setUploading(true);
    try {
      const result = await withAdminFeedback(
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
          return result as {
            data: ContentPageInput["sections"][number]["assets"];
          };
        },
        {
          loadingMessage: `Uploading ${files.length} asset${files.length === 1 ? "" : "s"}...`,
          successMessage: `${files.length} asset${files.length === 1 ? "" : "s"} uploaded.`,
          errorMessage: "Unable to upload the selected assets.",
        },
      );
      const firstAsset = result.data[0];
      const teamMembers = teamMemberId
        ? selectedSection.content.teamMembers.map((member) =>
            member.id === teamMemberId && firstAsset
              ? { ...member, imageAssetId: firstAsset.id }
              : member,
          )
        : selectedSection.content.teamMembers;
      updateSelectedSection({
        assets: [...selectedSection.assets, ...result.data],
        assetCount: selectedSection.assetCount + files.length,
        content: { ...selectedSection.content, teamMembers },
      });
    } catch {
      // The shared admin feedback layer presents the error toast.
    } finally {
      setUploading(false);
    }
  };

  const removeAsset = async (assetId: string) => {
    if (!selectedSection) return;
    try {
      await withAdminFeedback(
        () =>
          apiRequest<{ success: boolean }>(`/api/admin/media/${assetId}`, {
            method: "DELETE",
          }),
        {
          loadingMessage: "Removing image...",
          successMessage: "Image removed.",
          errorMessage: "Unable to remove this image.",
        },
      );
      const assets = selectedSection.assets.filter(
        (asset) => asset.id !== assetId,
      );
      updateSelectedSection({
        assets,
        assetCount: assets.length,
        content: {
          ...selectedSection.content,
          teamMembers: selectedSection.content.teamMembers.map((member) =>
            member.imageAssetId === assetId
              ? { ...member, imageAssetId: null }
              : member,
          ),
        },
      });
    } catch {
      // The shared admin feedback layer presents the error toast.
    }
  };

  const updateAsset = (
    assetId: string,
    update: Partial<ContentPageInput["sections"][number]["assets"][number]>,
  ) => {
    if (!selectedSection) return;
    updateSelectedSection({
      assets: selectedSection.assets.map((asset) =>
        asset.id === assetId ? { ...asset, ...update } : asset,
      ),
    });
  };

  const makeCover = (assetId: string) => {
    if (!selectedSection) return;
    updateSelectedSection({
      assets: selectedSection.assets.map((asset) => ({
        ...asset,
        isCover: asset.id === assetId,
      })),
    });
  };

  const updateTeamMember = (
    memberId: string,
    update: Partial<TeamMemberInput>,
  ) => {
    if (!selectedSection) return;
    updateSelectedSection({
      content: {
        ...selectedSection.content,
        teamMembers: selectedSection.content.teamMembers.map((member) =>
          member.id === memberId ? { ...member, ...update } : member,
        ),
      },
    });
  };

  const addTeamMember = () => {
    if (!selectedSection || selectedSection.content.teamMembers.length >= 3)
      return;
    const nextNumber = selectedSection.content.teamMembers.length + 1;
    updateSelectedSection({
      content: {
        ...selectedSection.content,
        teamMembers: [
          ...selectedSection.content.teamMembers,
          {
            id: crypto.randomUUID(),
            name: `Team member ${nextNumber}`,
            title: "Title",
            description: "",
            imageAssetId: null,
          },
        ],
      },
    });
  };

  const removeTeamMember = (memberId: string) => {
    if (!selectedSection || selectedSection.content.teamMembers.length <= 1)
      return;
    updateSelectedSection({
      content: {
        ...selectedSection.content,
        teamMembers: selectedSection.content.teamMembers.filter(
          (member) => member.id !== memberId,
        ),
      },
    });
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

          {isTeamSection && selectedSection && (
            <div className="admin-form-section">
              <div className="admin-form-section-heading admin-team-heading">
                <div>
                  <h3>Team profiles</h3>
                  <p>
                    Configure up to three people. Their order controls the
                    animation sequence.
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-team-add"
                  onClick={addTeamMember}
                  disabled={selectedSection.content.teamMembers.length >= 3}
                >
                  <Plus aria-hidden="true" /> Add person
                </button>
              </div>
              <div className="admin-team-profiles">
                {selectedSection.content.teamMembers.map((member, index) => {
                  const portrait = selectedSection.assets.find(
                    (asset) => asset.id === member.imageAssetId,
                  );

                  return (
                    <article className="admin-team-profile" key={member.id}>
                      <div className="admin-team-profile-top">
                        <strong>Person {index + 1}</strong>
                        <button
                          type="button"
                          onClick={() => removeTeamMember(member.id)}
                          aria-label={`Remove ${member.name}`}
                          disabled={
                            selectedSection.content.teamMembers.length <= 1
                          }
                        >
                          <Trash2 aria-hidden="true" />
                        </button>
                      </div>
                      <div className="admin-team-portrait-row">
                        <div className="admin-team-portrait">
                          {portrait ? (
                            <Image
                              src={portrait.url}
                              alt={portrait.alt}
                              fill
                              sizes="100px"
                            />
                          ) : (
                            <ImagePlus aria-hidden="true" />
                          )}
                        </div>
                        <div>
                          <Label htmlFor={`team-image-${member.id}`}>
                            Portrait image
                          </Label>
                          <select
                            id={`team-image-${member.id}`}
                            value={member.imageAssetId ?? ""}
                            onChange={(event) =>
                              updateTeamMember(member.id, {
                                imageAssetId: event.target.value || null,
                              })
                            }
                          >
                            <option value="">Use fallback image</option>
                            {selectedSection.assets.map((asset, assetIndex) => (
                              <option value={asset.id} key={asset.id}>
                                {asset.alt ||
                                  `Uploaded image ${assetIndex + 1}`}
                              </option>
                            ))}
                          </select>
                          <label className="admin-team-upload">
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/avif"
                              disabled={uploading}
                              onChange={(event) =>
                                uploadAssets(event.target.files, member.id)
                              }
                            />
                            <Upload aria-hidden="true" />
                            {uploading ? "Uploading..." : "Upload portrait"}
                          </label>
                        </div>
                      </div>
                      <div className="admin-form-grid">
                        <div>
                          <Label htmlFor={`team-name-${member.id}`}>Name</Label>
                          <Input
                            id={`team-name-${member.id}`}
                            value={member.name}
                            onChange={(event) =>
                              updateTeamMember(member.id, {
                                name: event.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor={`team-title-${member.id}`}>
                            Title
                          </Label>
                          <Input
                            id={`team-title-${member.id}`}
                            value={member.title}
                            onChange={(event) =>
                              updateTeamMember(member.id, {
                                title: event.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="admin-form-full">
                          <Label htmlFor={`team-description-${member.id}`}>
                            Description
                          </Label>
                          <Textarea
                            id={`team-description-${member.id}`}
                            rows={4}
                            value={member.description}
                            onChange={(event) =>
                              updateTeamMember(member.id, {
                                description: event.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          <div className="admin-form-section">
            <div className="admin-form-section-heading">
              <h3>{isTeamSection ? "Portrait library" : "Section assets"}</h3>
              <p>
                {isTeamSection
                  ? "Uploaded portraits are available to every team profile above."
                  : "Upload and describe images used by this section. The cover image is displayed first on the public page."}
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
              {selectedSection?.assets.map((asset, index) => (
                <article key={asset.id}>
                  <div>
                    <Image
                      src={asset.url}
                      alt={asset.alt}
                      fill
                      sizes="(max-width: 700px) 50vw, 180px"
                    />
                    <span>{asset.isCover ? "Cover" : `0${index + 1}`}</span>
                    <div className="admin-asset-actions">
                      {!asset.isCover && (
                        <button
                          type="button"
                          onClick={() => makeCover(asset.id)}
                          aria-label="Use as cover image"
                          title="Use as cover image"
                        >
                          <Star aria-hidden="true" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeAsset(asset.id)}
                        aria-label="Remove image"
                        title="Remove image"
                      >
                        <Trash2 aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <Input
                    aria-label={`Alt text for asset ${index + 1}`}
                    value={asset.alt}
                    onChange={(event) =>
                      updateAsset(asset.id, { alt: event.target.value })
                    }
                  />
                </article>
              ))}
            </div>
            {selectedSection?.assets.length === 0 && (
              <p className="admin-empty-assets">
                No uploaded images yet. The public page will use its default
                image until one is added.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
