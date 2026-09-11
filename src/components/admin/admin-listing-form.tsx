"use client";

import { ArrowLeft, ArrowRight, Check, ImagePlus, Save } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const steps = ["Property details", "Location", "Rental options", "Media"];

export default function AdminListingForm({
  mode = "create",
  initialTitle = "",
}: {
  mode?: "create" | "edit";
  initialTitle?: string;
}) {
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);

  const saveListing = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  };

  return (
    <div className="admin-listing-flow">
      <div className="admin-listing-toolbar">
        <Link href="/admin/listings">
          <ArrowLeft aria-hidden="true" /> Back to listings
        </Link>
        <div>
          <Button variant="outline" onClick={saveListing}>
            <Save aria-hidden="true" /> Save draft
          </Button>
          <Button className="admin-primary-button" onClick={saveListing}>
            {mode === "edit" ? "Update listing" : "Create listing"}
          </Button>
        </div>
      </div>

      {saved && (
        <output className="admin-save-notice">
          <Check aria-hidden="true" /> Listing draft saved locally.
        </output>
      )}

      <div className="admin-listing-stepper">
        {steps.map((label, index) => (
          <button
            type="button"
            className={step === index ? "is-active" : ""}
            key={label}
            onClick={() => setStep(index)}
          >
            <span>{index + 1}</span>
            {label}
          </button>
        ))}
      </div>

      <section className="admin-editor-panel admin-listing-editor">
        {step === 0 && (
          <>
            <div className="admin-editor-heading">
              <div>
                <span>Step 1 of 4</span>
                <h2>Property details</h2>
                <p>Start with the information renters see in search results.</p>
              </div>
            </div>
            <div className="admin-form-grid">
              <div className="admin-form-full">
                <Label htmlFor="property-name">Property name</Label>
                <Input
                  id="property-name"
                  placeholder="e.g. Seasons Square Residence"
                  defaultValue={initialTitle}
                />
              </div>
              <div>
                <Label htmlFor="property-type">Property type</Label>
                <select id="property-type" defaultValue="residence">
                  <option value="residence">Managed residence</option>
                  <option value="studio">Studio residence</option>
                  <option value="whole-unit">Whole unit</option>
                </select>
              </div>
              <div>
                <Label htmlFor="managed-by">Managed by</Label>
                <Input
                  id="managed-by"
                  defaultValue="RentDeer Property Management"
                />
              </div>
              <div className="admin-form-full">
                <Label htmlFor="property-description">Description</Label>
                <Textarea
                  id="property-description"
                  rows={5}
                  placeholder="Describe the property, lifestyle and ideal renter..."
                />
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="admin-editor-heading">
              <div>
                <span>Step 2 of 4</span>
                <h2>Location & nearby amenities</h2>
                <p>Add the address and map coordinates shown to renters.</p>
              </div>
            </div>
            <div className="admin-form-grid">
              <div className="admin-form-full">
                <Label htmlFor="address">Full address</Label>
                <Input
                  id="address"
                  placeholder="Building, street, postcode and city"
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" placeholder="Petaling Jaya" />
              </div>
              <div>
                <Label htmlFor="area">Area</Label>
                <Input id="area" placeholder="Damansara Damai" />
              </div>
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input id="latitude" placeholder="3.1579" />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input id="longitude" placeholder="101.7116" />
              </div>
              <div className="admin-form-full admin-location-placeholder">
                <span>Interactive map preview</span>
                <strong>
                  Pin will appear here after coordinates are added.
                </strong>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="admin-editor-heading">
              <div>
                <span>Step 3 of 4</span>
                <h2>Rental options</h2>
                <p>Add the individual rooms or units available here.</p>
              </div>
              <Button variant="outline">+ Add rental option</Button>
            </div>
            <div className="admin-rental-option-card">
              <div>
                <strong>Rental option 01</strong>
                <span>Draft</span>
              </div>
              <div className="admin-form-grid">
                <div>
                  <Label htmlFor="room-name">Room name</Label>
                  <Input
                    id="room-name"
                    placeholder="Fully Furnished Master Room"
                  />
                </div>
                <div>
                  <Label htmlFor="room-type">Room type</Label>
                  <select id="room-type" defaultValue="master">
                    <option value="master">Master Bedroom</option>
                    <option value="medium">Medium Bedroom</option>
                    <option value="single">Single Bedroom</option>
                    <option value="studio">Soho / Studio</option>
                    <option value="unit">Whole Unit</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="rent">Monthly rent</Label>
                  <Input id="rent" type="number" placeholder="850" />
                </div>
                <div>
                  <Label htmlFor="size">Room size</Label>
                  <Input id="size" placeholder="220 sq. ft." />
                </div>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="admin-editor-heading">
              <div>
                <span>Step 4 of 4</span>
                <h2>Property media</h2>
                <p>Upload the cover image and gallery shown on the listing.</p>
              </div>
            </div>
            <label className="admin-upload-zone admin-listing-upload">
              <input type="file" accept="image/*" multiple />
              <ImagePlus aria-hidden="true" />
              <strong>Upload listing images</strong>
              <span>Drag to reorder after upload · maximum 12 images</span>
              <span className="admin-upload-action">Choose images</span>
            </label>
            <div className="admin-media-guidance">
              <div>
                <strong>Cover image</strong>
                <span>Recommended ratio: 4:3</span>
              </div>
              <div>
                <strong>Image quality</strong>
                <span>At least 1600px wide</span>
              </div>
              <div>
                <strong>Accessibility</strong>
                <span>Add meaningful alt text</span>
              </div>
            </div>
          </>
        )}

        <div className="admin-step-actions">
          <Button
            variant="outline"
            disabled={step === 0}
            onClick={() => setStep((current) => Math.max(0, current - 1))}
          >
            <ArrowLeft aria-hidden="true" /> Previous
          </Button>
          {step < steps.length - 1 ? (
            <Button
              className="admin-primary-button"
              onClick={() =>
                setStep((current) => Math.min(steps.length - 1, current + 1))
              }
            >
              Continue <ArrowRight aria-hidden="true" />
            </Button>
          ) : (
            <Button className="admin-primary-button" onClick={saveListing}>
              <Save aria-hidden="true" /> Save listing
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
