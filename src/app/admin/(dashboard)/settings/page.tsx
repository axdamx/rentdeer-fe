"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ImagePlus, Save, Trash2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { withAdminFeedback } from "@/lib/admin-feedback";
import { apiRequest } from "@/lib/api-client";
import type { SiteSettingsInput } from "@/lib/listing-schema";

const initialSettings: SiteSettingsInput = {
  siteName: "RentDeer",
  tagline: "Rent Smarter. Live Better.",
  primaryColour: "#185519",
  accentColour: "#F5CF3F",
  companyEmail: "",
  tenantPhone: "",
  tenantWhatsapp: "",
  landlordWhatsapp: "",
  companyAddress: "",
  logo: null,
  homepageHeroSlides: [
    {
      path: "/estatein/property-villa.png",
      url: "/estatein/property-villa.png",
      alt: "A furnished RentDeer residence",
    },
    {
      path: "/estatein/property-campus.png",
      url: "/estatein/property-campus.png",
      alt: "A landscaped RentDeer residential community",
    },
    {
      path: "/estatein/property-tower.png",
      url: "/estatein/property-tower.png",
      alt: "A modern RentDeer residential tower",
    },
    {
      path: "/estatein/hero-building.png",
      url: "/estatein/hero-building.png",
      alt: "A contemporary home managed by RentDeer",
    },
  ],
  socialLinks: ["Instagram", "Facebook", "TikTok", "YouTube", "Threads"].map(
    (platform, index) => ({
      platform,
      url: "",
      isVisible: true,
      sortOrder: index + 1,
    }),
  ),
};

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState<"logo" | number | null>(null);
  const [form, setForm] = useState<SiteSettingsInput>(initialSettings);
  const settingsQuery = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () =>
      withAdminFeedback(
        () => apiRequest<{ data: SiteSettingsInput }>("/api/admin/settings"),
        { loadingMessage: "Loading site settings..." },
      ),
    retry: false,
  });
  useEffect(() => {
    if (settingsQuery.data?.data) setForm(settingsQuery.data.data);
  }, [settingsQuery.data]);
  const saveMutation = useMutation({
    mutationFn: () =>
      withAdminFeedback(
        () =>
          apiRequest<{ data: SiteSettingsInput }>("/api/admin/settings", {
            method: "PATCH",
            body: JSON.stringify(form),
          }),
        {
          loadingMessage: "Saving site settings...",
          successMessage: "Site settings saved.",
          errorMessage: "Unable to save site settings.",
        },
      ),
    onSuccess: async ({ data }) => {
      setForm(data);
      await queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
  });

  const saveSettings = () => {
    saveMutation.mutate();
  };

  const setField = <K extends keyof SiteSettingsInput>(
    key: K,
    value: SiteSettingsInput[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const socialUrl = (platform: string) =>
    form.socialLinks.find((link) => link.platform === platform)?.url ?? "";
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  const setSocialUrl = (platform: string, url: string) =>
    setField(
      "socialLinks",
      form.socialLinks.map((link) =>
        link.platform === platform ? { ...link, url } : link,
      ),
    );

  const uploadSiteImage = async (
    kind: "logo" | "hero",
    file: File | undefined,
    slideIndex?: number,
  ) => {
    if (!file) return;
    setUploading(kind === "logo" ? "logo" : (slideIndex ?? 0));
    try {
      const result = await withAdminFeedback(
        async () => {
          const body = new FormData();
          body.set("kind", kind);
          body.set("file", file);
          const response = await fetch("/api/admin/site-media", {
            method: "POST",
            body,
          });
          const uploadResult = (await response.json()) as {
            data?: { path: string; url: string };
            error?: string;
          };
          if (!response.ok || !uploadResult.data) {
            throw new Error(uploadResult.error ?? "Upload failed.");
          }
          return uploadResult as {
            data: { path: string; url: string };
          };
        },
        {
          loadingMessage:
            kind === "logo" ? "Uploading logo..." : "Uploading hero image...",
          successMessage:
            kind === "logo" ? "Logo uploaded." : "Hero image uploaded.",
          errorMessage: "Unable to upload the selected image.",
        },
      );
      const image = {
        ...result.data,
        alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
      };
      if (kind === "logo") {
        setField("logo", image);
      } else {
        setField(
          "homepageHeroSlides",
          form.homepageHeroSlides.map((slide, index) =>
            index === slideIndex ? image : slide,
          ),
        );
      }
    } catch {
      // The shared admin feedback layer presents the error toast.
    } finally {
      setUploading(null);
    }
  };

  const updateHeroAlt = (index: number, alt: string) => {
    setField(
      "homepageHeroSlides",
      form.homepageHeroSlides.map((slide, slideIndex) =>
        slideIndex === index ? { ...slide, alt } : slide,
      ),
    );
  };

  const moveHeroSlide = (index: number, direction: -1 | 1) => {
    const destination = index + direction;
    if (destination < 0 || destination >= form.homepageHeroSlides.length)
      return;
    const slides = [...form.homepageHeroSlides];
    [slides[index], slides[destination]] = [slides[destination], slides[index]];
    setField("homepageHeroSlides", slides);
  };

  const removeHeroSlide = (index: number) => {
    setField(
      "homepageHeroSlides",
      form.homepageHeroSlides.filter((_, slideIndex) => slideIndex !== index),
    );
  };

  const appendHeroSlide = async (file: File | undefined) => {
    if (!file || form.homepageHeroSlides.length >= 4) return;
    const slideIndex = form.homepageHeroSlides.length;
    setUploading(slideIndex);
    try {
      const result = await withAdminFeedback(
        async () => {
          const body = new FormData();
          body.set("kind", "hero");
          body.set("file", file);
          const response = await fetch("/api/admin/site-media", {
            method: "POST",
            body,
          });
          const uploadResult = (await response.json()) as {
            data?: { path: string; url: string };
            error?: string;
          };
          if (!response.ok || !uploadResult.data) {
            throw new Error(uploadResult.error ?? "Upload failed.");
          }
          return uploadResult as {
            data: { path: string; url: string };
          };
        },
        {
          loadingMessage: "Uploading hero image...",
          successMessage: "Hero slide uploaded.",
          errorMessage: "Unable to upload the selected image.",
        },
      );
      setField("homepageHeroSlides", [
        ...form.homepageHeroSlides,
        {
          ...result.data,
          alt: file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
        },
      ]);
    } catch {
      // The shared admin feedback layer presents the error toast.
    } finally {
      setUploading(null);
    }
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Configuration"
        title="Site settings"
        description="Manage global brand assets, contact details, social links and defaults."
        actions={
          <Button
            className="admin-primary-button"
            onClick={saveSettings}
            disabled={saveMutation.isPending}
          >
            <Save aria-hidden="true" />
            {saveMutation.isPending ? "Saving..." : "Save settings"}
          </Button>
        }
      />
      <div className="admin-settings-layout">
        <nav className="admin-settings-nav" aria-label="Settings sections">
          <button
            type="button"
            className="is-active"
            onClick={() => scrollToSection("brand-identity")}
          >
            Brand identity
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("homepage-hero")}
          >
            Homepage hero
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("contact-details")}
          >
            Contact details
          </button>
          <button
            type="button"
            onClick={() => scrollToSection("social-channels")}
          >
            Social channels
          </button>
        </nav>
        <div className="admin-settings-content">
          <section className="admin-editor-panel" id="brand-identity">
            <div className="admin-editor-heading">
              <div>
                <span>Global settings</span>
                <h2>Brand identity</h2>
                <p>Assets used throughout the public RentDeer website.</p>
              </div>
            </div>
            <div className="admin-brand-upload-row">
              <div className="admin-logo-preview">
                {form.logo ? (
                  <Image
                    src={form.logo.url}
                    alt={form.logo.alt || `${form.siteName} logo`}
                    width={220}
                    height={80}
                    unoptimized
                  />
                ) : (
                  <>
                    <span>R</span>
                    <strong>RentDeer</strong>
                  </>
                )}
              </div>
              <div>
                <strong>Primary logo</strong>
                <p>
                  Used in the public header and footer. SVG or transparent PNG
                  recommended.
                </p>
                <label>
                  <input
                    type="file"
                    accept="image/svg+xml,image/jpeg,image/png,image/webp,image/avif"
                    disabled={uploading !== null}
                    onChange={(event) => {
                      void uploadSiteImage("logo", event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                  <ImagePlus aria-hidden="true" />
                  {uploading === "logo"
                    ? "Uploading logo..."
                    : form.logo
                      ? "Replace logo"
                      : "Upload logo"}
                </label>
                {form.logo && (
                  <button
                    type="button"
                    className="admin-inline-danger"
                    onClick={() => setField("logo", null)}
                  >
                    <Trash2 aria-hidden="true" /> Use default wordmark
                  </button>
                )}
              </div>
            </div>
            <div className="admin-form-grid">
              <div>
                <Label htmlFor="site-name">Site name</Label>
                <Input
                  id="site-name"
                  value={form.siteName}
                  onChange={(event) => setField("siteName", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={form.tagline}
                  onChange={(event) => setField("tagline", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="primary-colour">Primary colour</Label>
                <div className="admin-colour-input">
                  <span style={{ background: form.primaryColour }} />
                  <Input
                    id="primary-colour"
                    value={form.primaryColour}
                    onChange={(event) =>
                      setField("primaryColour", event.target.value)
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="accent-colour">Accent colour</Label>
                <div className="admin-colour-input">
                  <span style={{ background: form.accentColour }} />
                  <Input
                    id="accent-colour"
                    value={form.accentColour}
                    onChange={(event) =>
                      setField("accentColour", event.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="admin-editor-panel" id="homepage-hero">
            <div className="admin-editor-heading">
              <div>
                <span>Homepage</span>
                <h2>Hero image carousel</h2>
                <p>
                  These are the large background images at the top of the
                  homepage. Add four landscape images; the website rotates them
                  automatically.
                </p>
              </div>
              <strong className="admin-slot-counter">
                {form.homepageHeroSlides.length} / 4 images
              </strong>
            </div>
            <div className="admin-hero-slide-grid">
              {form.homepageHeroSlides.map((slide, index) => (
                <article key={`${slide.path}-${index}`}>
                  <div className="admin-hero-slide-preview">
                    <Image
                      src={slide.url}
                      alt={slide.alt || `Homepage hero slide ${index + 1}`}
                      fill
                      sizes="(max-width: 900px) 100vw, 40vw"
                      unoptimized
                    />
                    <span>Slide {index + 1}</span>
                  </div>
                  <div className="admin-hero-slide-fields">
                    <Label htmlFor={`hero-slide-alt-${index}`}>
                      Image description
                    </Label>
                    <Input
                      id={`hero-slide-alt-${index}`}
                      value={slide.alt}
                      onChange={(event) =>
                        updateHeroAlt(index, event.target.value)
                      }
                    />
                  </div>
                  <div className="admin-hero-slide-actions">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveHeroSlide(index, -1)}
                      aria-label={`Move slide ${index + 1} earlier`}
                    >
                      <ArrowLeft aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={index === form.homepageHeroSlides.length - 1}
                      onClick={() => moveHeroSlide(index, 1)}
                      aria-label={`Move slide ${index + 1} later`}
                    >
                      <ArrowRight aria-hidden="true" />
                    </button>
                    <label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        disabled={uploading !== null}
                        onChange={(event) => {
                          void uploadSiteImage(
                            "hero",
                            event.target.files?.[0],
                            index,
                          );
                          event.target.value = "";
                        }}
                      />
                      <ImagePlus aria-hidden="true" />
                      {uploading === index ? "Uploading..." : "Replace"}
                    </label>
                    <button
                      type="button"
                      className="is-danger"
                      onClick={() => removeHeroSlide(index)}
                      aria-label={`Remove slide ${index + 1}`}
                    >
                      <Trash2 aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
              {form.homepageHeroSlides.length < 4 && (
                <label className="admin-hero-slide-add">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    disabled={uploading !== null}
                    onChange={(event) => {
                      void appendHeroSlide(event.target.files?.[0]);
                      event.target.value = "";
                    }}
                  />
                  <ImagePlus aria-hidden="true" />
                  <strong>
                    {uploading === form.homepageHeroSlides.length
                      ? "Uploading..."
                      : `Add slide ${form.homepageHeroSlides.length + 1}`}
                  </strong>
                  <span>Landscape JPG, PNG, WebP or AVIF · up to 10MB</span>
                </label>
              )}
            </div>
          </section>

          <section className="admin-editor-panel" id="contact-details">
            <div className="admin-editor-heading">
              <div>
                <span>Company information</span>
                <h2>Contact details</h2>
                <p>Shared across the Contact page and website footer.</p>
              </div>
            </div>
            <div className="admin-form-grid">
              <div>
                <Label htmlFor="company-email">Email</Label>
                <Input
                  id="company-email"
                  type="email"
                  value={form.companyEmail}
                  onChange={(event) =>
                    setField("companyEmail", event.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="tenant-phone">Tenant phone</Label>
                <Input
                  id="tenant-phone"
                  value={form.tenantPhone}
                  onChange={(event) =>
                    setField("tenantPhone", event.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="tenant-whatsapp">Tenant WhatsApp</Label>
                <Input
                  id="tenant-whatsapp"
                  value={form.tenantWhatsapp}
                  onChange={(event) =>
                    setField("tenantWhatsapp", event.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="landlord-whatsapp">Landlord WhatsApp</Label>
                <Input
                  id="landlord-whatsapp"
                  value={form.landlordWhatsapp}
                  onChange={(event) =>
                    setField("landlordWhatsapp", event.target.value)
                  }
                />
              </div>
              <div className="admin-form-full">
                <Label htmlFor="company-address">Office address</Label>
                <Textarea
                  id="company-address"
                  rows={3}
                  value={form.companyAddress}
                  onChange={(event) =>
                    setField("companyAddress", event.target.value)
                  }
                />
              </div>
            </div>
          </section>

          <section className="admin-editor-panel" id="social-channels">
            <div className="admin-editor-heading">
              <div>
                <span>Channels</span>
                <h2>Social links</h2>
                <p>Used by the global footer and social callouts.</p>
              </div>
            </div>
            <div className="admin-form-grid">
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={socialUrl("Instagram")}
                  onChange={(event) =>
                    setSocialUrl("Instagram", event.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={socialUrl("Facebook")}
                  onChange={(event) =>
                    setSocialUrl("Facebook", event.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="tiktok">TikTok</Label>
                <Input
                  id="tiktok"
                  value={socialUrl("TikTok")}
                  onChange={(event) =>
                    setSocialUrl("TikTok", event.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  value={socialUrl("YouTube")}
                  onChange={(event) =>
                    setSocialUrl("YouTube", event.target.value)
                  }
                />
              </div>
              <div className="admin-form-full">
                <Label htmlFor="threads">Threads</Label>
                <Input
                  id="threads"
                  value={socialUrl("Threads")}
                  onChange={(event) =>
                    setSocialUrl("Threads", event.target.value)
                  }
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
