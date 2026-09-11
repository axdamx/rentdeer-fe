"use client";

import { Check, ImagePlus, Save } from "lucide-react";
import { useState } from "react";
import AdminPageHeader from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);

  const saveSettings = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  };

  return (
    <>
      <AdminPageHeader
        eyebrow="Configuration"
        title="Site settings"
        description="Manage global brand assets, contact details, social links and defaults."
        actions={
          <Button className="admin-primary-button" onClick={saveSettings}>
            <Save aria-hidden="true" /> Save settings
          </Button>
        }
      />
      {saved && (
        <output className="admin-save-notice">
          <Check aria-hidden="true" /> Site settings saved locally.
        </output>
      )}
      <div className="admin-settings-layout">
        <nav className="admin-settings-nav" aria-label="Settings sections">
          <button type="button" className="is-active">
            Brand identity
          </button>
          <button type="button">Contact details</button>
          <button type="button">Social channels</button>
          <button type="button">SEO defaults</button>
          <button type="button">Administrator accounts</button>
        </nav>
        <div className="admin-settings-content">
          <section className="admin-editor-panel">
            <div className="admin-editor-heading">
              <div>
                <span>Global settings</span>
                <h2>Brand identity</h2>
                <p>Assets used throughout the public RentDeer website.</p>
              </div>
            </div>
            <div className="admin-brand-upload-row">
              <div className="admin-logo-preview">
                <span>R</span>
                <strong>RentDeer</strong>
              </div>
              <div>
                <strong>Primary logo</strong>
                <p>SVG or transparent PNG recommended.</p>
                <label>
                  <input type="file" accept="image/*" />
                  <ImagePlus aria-hidden="true" /> Replace logo
                </label>
              </div>
            </div>
            <div className="admin-form-grid">
              <div>
                <Label htmlFor="site-name">Site name</Label>
                <Input id="site-name" defaultValue="RentDeer" />
              </div>
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input id="tagline" defaultValue="Rent Smarter. Live Better." />
              </div>
              <div>
                <Label htmlFor="primary-colour">Primary colour</Label>
                <div className="admin-colour-input">
                  <span style={{ background: "#185519" }} />
                  <Input id="primary-colour" defaultValue="#185519" />
                </div>
              </div>
              <div>
                <Label htmlFor="accent-colour">Accent colour</Label>
                <div className="admin-colour-input">
                  <span style={{ background: "#F5CF3F" }} />
                  <Input id="accent-colour" defaultValue="#F5CF3F" />
                </div>
              </div>
            </div>
          </section>

          <section className="admin-editor-panel">
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
                  defaultValue="hello.rentdeer@gmail.com"
                />
              </div>
              <div>
                <Label htmlFor="tenant-phone">Tenant phone</Label>
                <Input id="tenant-phone" defaultValue="+6019 252 3804" />
              </div>
              <div>
                <Label htmlFor="tenant-whatsapp">Tenant WhatsApp</Label>
                <Input id="tenant-whatsapp" defaultValue="+6019 343 3804" />
              </div>
              <div>
                <Label htmlFor="landlord-whatsapp">Landlord WhatsApp</Label>
                <Input id="landlord-whatsapp" defaultValue="+6011 3928 2804" />
              </div>
              <div className="admin-form-full">
                <Label htmlFor="company-address">Office address</Label>
                <Textarea
                  id="company-address"
                  rows={3}
                  defaultValue="S-036 & S-042, Seasons Square, Jalan PJU 10/3C, Damansara Damai, 47380 Petaling Jaya, Selangor, Malaysia"
                />
              </div>
            </div>
          </section>

          <section className="admin-editor-panel">
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
                  defaultValue="https://www.instagram.com/rent.deer/"
                />
              </div>
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  defaultValue="https://www.facebook.com/people/Rentdeercom/61557446064027/"
                />
              </div>
              <div>
                <Label htmlFor="tiktok">TikTok</Label>
                <Input
                  id="tiktok"
                  defaultValue="https://www.tiktok.com/@rentdeer.com"
                />
              </div>
              <div>
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  defaultValue="https://www.youtube.com/@RentDeer_Channel"
                />
              </div>
              <div className="admin-form-full">
                <Label htmlFor="threads">Threads</Label>
                <Input
                  id="threads"
                  defaultValue="https://www.threads.com/@rent.deer"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
