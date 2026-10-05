"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  ImagePlus,
  LocateFixed,
  MapPin,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api-client";
import { facilityOptions, transitStations } from "@/lib/listing-reference-data";
import {
  type PropertyInput,
  type RentalOptionInput,
  slugify,
} from "@/lib/listing-schema";
import type { Property } from "@/lib/properties";
import { queryKeys } from "@/lib/query-keys";

const steps = ["Property details", "Location", "Rental options", "Media"];

const emptyOption = (): RentalOptionInput => ({
  slug: "",
  title: "",
  internalCode: "",
  variant: "",
  roomType: "master_bedroom",
  description: "",
  priceMin: 0,
  priceMax: null,
  priceNote: "",
  bedrooms: 1,
  bathrooms: 1,
  areaSqft: null,
  bedType: "",
  bathroomType: "private",
  furnished: true,
  availability: "available",
  quantityAvailable: 1,
  status: "draft",
  sortOrder: 0,
});

const emptyProperty = (): PropertyInput => ({
  slug: "",
  title: "",
  description: "",
  propertyType: "Managed residence",
  managedBy: "RentDeer Property Management",
  addressLine: "",
  postcode: "",
  city: "",
  area: "",
  state: "Selangor",
  latitude: null,
  longitude: null,
  status: "draft",
  isFeatured: false,
  facilities: [],
  transitConnections: [],
  rentalOptions: [emptyOption()],
});

export default function AdminListingForm({
  mode = "create",
  initialSlug,
}: {
  mode?: "create" | "edit";
  initialSlug?: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<PropertyInput>(emptyProperty);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [customFacility, setCustomFacility] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState("");

  const listingQuery = useQuery({
    queryKey: queryKeys.admin.property(initialSlug ?? "new"),
    queryFn: () =>
      apiRequest<{ data: PropertyInput }>(
        `/api/admin/properties/${initialSlug}`,
      ),
    enabled: mode === "edit" && Boolean(initialSlug),
  });

  useEffect(() => {
    if (listingQuery.data?.data) setForm(listingQuery.data.data);
  }, [listingQuery.data]);

  const saveMutation = useMutation({
    mutationFn: (payload: PropertyInput) =>
      apiRequest<{ data: Property }>(
        mode === "edit" && initialSlug
          ? `/api/admin/properties/${initialSlug}`
          : "/api/admin/properties",
        {
          method: mode === "edit" ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        },
      ),
    onSuccess: async ({ data }) => {
      setError("");
      setNotice("Listing saved successfully.");
      await queryClient.invalidateQueries({
        queryKey: ["admin", "properties"],
      });
      await queryClient.invalidateQueries({ queryKey: ["properties"] });
      window.setTimeout(() => setNotice(""), 2600);
      if (mode === "create") {
        router.replace(`/admin/listings/${data.slug}`);
        router.refresh();
      }
    },
    onError: (reason) => {
      setNotice("");
      setError(
        reason instanceof Error ? reason.message : "Unable to save listing.",
      );
    },
  });

  const setField = <K extends keyof PropertyInput>(
    field: K,
    value: PropertyInput[K],
  ) => setForm((current) => ({ ...current, [field]: value }));

  const setOption = <K extends keyof RentalOptionInput>(
    index: number,
    field: K,
    value: RentalOptionInput[K],
  ) => {
    setForm((current) => ({
      ...current,
      rentalOptions: current.rentalOptions.map((option, optionIndex) =>
        optionIndex === index ? { ...option, [field]: value } : option,
      ),
    }));
  };

  const toggleFacility = (facility: string) => {
    setField(
      "facilities",
      form.facilities.includes(facility)
        ? form.facilities.filter((item) => item !== facility)
        : [...form.facilities, facility],
    );
  };

  const addCustomFacility = () => {
    const facility = customFacility.trim();
    if (!facility || form.facilities.includes(facility)) return;
    setField("facilities", [...form.facilities, facility]);
    setCustomFacility("");
  };

  const useCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocationNotice("This browser does not support location access.");
      return;
    }

    setLocating(true);
    setLocationNotice("Requesting your current location...");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm((current) => ({
          ...current,
          latitude: Number(coords.latitude.toFixed(6)),
          longitude: Number(coords.longitude.toFixed(6)),
        }));
        setLocating(false);
        setLocationNotice(
          "Coordinates filled. Confirm that the map point is at the property before saving.",
        );
      },
      (reason) => {
        setLocating(false);
        setLocationNotice(
          reason.code === reason.PERMISSION_DENIED
            ? "Location permission was denied. You can still enter the coordinates manually."
            : "We could not detect the current location. Please try again or enter it manually.",
        );
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 12_000 },
    );
  };

  const openAddressInMaps = () => {
    const address = [
      form.addressLine,
      form.postcode,
      form.area,
      form.city,
      form.state,
      "Malaysia",
    ]
      .filter(Boolean)
      .join(", ");
    const query =
      form.latitude != null && form.longitude != null
        ? `${form.latitude},${form.longitude}`
        : address;
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const toggleTransitStation = (stationId: string) => {
    const selected = form.transitConnections.some(
      (connection) => connection.stationId === stationId,
    );
    setField(
      "transitConnections",
      selected
        ? form.transitConnections.filter(
            (connection) => connection.stationId !== stationId,
          )
        : [
            ...form.transitConnections,
            { stationId, accessMinutes: 10, accessMode: "walk" },
          ],
    );
  };

  const updateTransitStation = (
    stationId: string,
    patch: Partial<PropertyInput["transitConnections"][number]>,
  ) => {
    setField(
      "transitConnections",
      form.transitConnections.map((connection) =>
        connection.stationId === stationId
          ? { ...connection, ...patch }
          : connection,
      ),
    );
  };

  const save = (status?: PropertyInput["status"]) => {
    const nextForm = status
      ? {
          ...form,
          status,
          rentalOptions: form.rentalOptions.map((option) => ({
            ...option,
            status,
          })),
        }
      : form;
    setForm(nextForm);
    saveMutation.mutate(nextForm);
  };

  const uploadMedia = async (files: FileList | null) => {
    if (!files?.length || !form.id) return;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.set("ownerType", "property");
      body.set("ownerId", form.id);
      for (const file of Array.from(files)) body.append("files", file);
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Upload failed.");
      setNotice(
        `${files.length} image${files.length === 1 ? "" : "s"} uploaded.`,
      );
      await queryClient.invalidateQueries({
        queryKey: queryKeys.admin.property(initialSlug ?? "new"),
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  if (listingQuery.isPending && mode === "edit") {
    return <section className="admin-editor-panel">Loading listing...</section>;
  }
  if (listingQuery.isError) {
    return (
      <section className="admin-editor-panel">Unable to load listing.</section>
    );
  }

  return (
    <div className="admin-listing-flow">
      <div className="admin-listing-toolbar">
        <Link href="/admin/listings">
          <ArrowLeft aria-hidden="true" /> Back to listings
        </Link>
        <div>
          <Button
            variant="outline"
            onClick={() => save("draft")}
            disabled={saveMutation.isPending}
          >
            <Save aria-hidden="true" /> Save draft
          </Button>
          <Button
            className="admin-primary-button"
            onClick={() => save(form.status)}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending
              ? "Saving..."
              : mode === "edit"
                ? "Update listing"
                : "Create listing"}
          </Button>
        </div>
      </div>

      {notice && (
        <output className="admin-save-notice">
          <Check aria-hidden="true" /> {notice}
        </output>
      )}
      {error && <div className="admin-save-notice">{error}</div>}

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
                <p>Manage the main property renters see in search results.</p>
              </div>
            </div>
            <div className="admin-form-grid">
              <div className="admin-form-full">
                <Label htmlFor="property-name">Property name</Label>
                <Input
                  id="property-name"
                  value={form.title}
                  onChange={(event) => {
                    const title = event.target.value;
                    setForm((current) => ({
                      ...current,
                      title,
                      slug: mode === "create" ? slugify(title) : current.slug,
                    }));
                  }}
                />
              </div>
              <div className="admin-generated-url">
                <span>Public page address · generated automatically</span>
                <code>/properties/{form.slug || "property-name"}</code>
              </div>
              <div>
                <Label htmlFor="listing-status">Publication status</Label>
                <select
                  id="listing-status"
                  value={form.status}
                  onChange={(event) =>
                    setField(
                      "status",
                      event.target.value as PropertyInput["status"],
                    )
                  }
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <Label htmlFor="property-type">Property type</Label>
                <Input
                  id="property-type"
                  value={form.propertyType}
                  onChange={(event) =>
                    setField("propertyType", event.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="managed-by">Managed by</Label>
                <Input
                  id="managed-by"
                  value={form.managedBy}
                  onChange={(event) =>
                    setField("managedBy", event.target.value)
                  }
                />
              </div>
              <div className="admin-form-full">
                <Label htmlFor="property-description">Description</Label>
                <Textarea
                  id="property-description"
                  rows={5}
                  value={form.description}
                  onChange={(event) =>
                    setField("description", event.target.value)
                  }
                />
              </div>
              <div className="admin-form-full">
                <div className="admin-field-heading">
                  <div>
                    <Label>Facilities</Label>
                    <p>
                      Select every shared facility available at the property.
                    </p>
                  </div>
                  <span>{form.facilities.length} selected</span>
                </div>
                <div className="admin-choice-grid">
                  {[
                    ...facilityOptions,
                    ...form.facilities.filter(
                      (facility) => !facilityOptions.includes(facility),
                    ),
                  ].map((facility) => {
                    const selected = form.facilities.includes(facility);
                    return (
                      <label
                        className={selected ? "is-selected" : ""}
                        key={facility}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleFacility(facility)}
                        />
                        <span>{selected && <Check aria-hidden="true" />}</span>
                        {facility}
                      </label>
                    );
                  })}
                </div>
                <div className="admin-inline-add">
                  <Input
                    aria-label="Custom facility"
                    value={customFacility}
                    onChange={(event) => setCustomFacility(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addCustomFacility();
                      }
                    }}
                    placeholder="Add another facility"
                  />
                  <Button variant="outline" onClick={addCustomFacility}>
                    <Plus aria-hidden="true" /> Add
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="admin-editor-heading">
              <div>
                <span>Step 2 of 4</span>
                <h2>Location</h2>
                <p>Add the address and map coordinates shown to renters.</p>
              </div>
            </div>
            <div className="admin-form-grid">
              <div className="admin-form-full">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={form.addressLine ?? ""}
                  onChange={(event) =>
                    setField("addressLine", event.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(event) => setField("city", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="area">Area</Label>
                <Input
                  id="area"
                  value={form.area ?? ""}
                  onChange={(event) => setField("area", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="postcode">Postcode</Label>
                <Input
                  id="postcode"
                  value={form.postcode ?? ""}
                  onChange={(event) => setField("postcode", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(event) => setField("state", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={form.latitude ?? ""}
                  onChange={(event) =>
                    setField(
                      "latitude",
                      event.target.value ? Number(event.target.value) : null,
                    )
                  }
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={form.longitude ?? ""}
                  onChange={(event) =>
                    setField(
                      "longitude",
                      event.target.value ? Number(event.target.value) : null,
                    )
                  }
                />
              </div>
              <div className="admin-form-full admin-coordinate-tools">
                <div>
                  <Button
                    variant="outline"
                    onClick={useCurrentLocation}
                    disabled={locating}
                  >
                    <LocateFixed aria-hidden="true" />
                    {locating ? "Finding location..." : "Use current location"}
                  </Button>
                  <Button variant="outline" onClick={openAddressInMaps}>
                    <ExternalLink aria-hidden="true" /> Verify in Google Maps
                  </Button>
                </div>
                <p>
                  Use current location only while you are at the property. You
                  can always correct the coordinates manually.
                </p>
                {locationNotice && <output>{locationNotice}</output>}
              </div>
              <div className="admin-form-full admin-transit-selector">
                <div className="admin-field-heading">
                  <div>
                    <Label>Nearby public transport</Label>
                    <p>
                      Select stations from the fixed Klang Valley catalogue.
                      Their line and map-pin details are filled automatically.
                    </p>
                  </div>
                  <span>{form.transitConnections.length} connected</span>
                </div>
                <div className="admin-transit-grid">
                  {transitStations.map((station) => {
                    const connection = form.transitConnections.find(
                      (item) => item.stationId === station.id,
                    );
                    return (
                      <article
                        className={connection ? "is-selected" : ""}
                        key={station.id}
                      >
                        <label>
                          <input
                            type="checkbox"
                            checked={Boolean(connection)}
                            onChange={() => toggleTransitStation(station.id)}
                          />
                          <span
                            className="admin-transit-badge"
                            style={{
                              background: station.lineColor,
                              color: station.lineTextColor,
                            }}
                          >
                            {station.lineCode}
                          </span>
                          <span>
                            <strong>{station.station}</strong>
                            <small>{station.line}</small>
                          </span>
                          <MapPin aria-hidden="true" />
                        </label>
                        {connection && (
                          <div className="admin-transit-access">
                            <label htmlFor={`transit-minutes-${station.id}`}>
                              <span>Travel time</span>
                              <Input
                                id={`transit-minutes-${station.id}`}
                                aria-label={`Minutes to ${station.station}`}
                                type="number"
                                min="1"
                                max="180"
                                value={connection.accessMinutes}
                                onChange={(event) =>
                                  updateTransitStation(station.id, {
                                    accessMinutes: Number(event.target.value),
                                  })
                                }
                              />
                            </label>
                            <label htmlFor={`transit-mode-${station.id}`}>
                              <span>Access</span>
                              <select
                                id={`transit-mode-${station.id}`}
                                aria-label={`Access mode to ${station.station}`}
                                value={connection.accessMode}
                                onChange={(event) =>
                                  updateTransitStation(station.id, {
                                    accessMode: event.target
                                      .value as typeof connection.accessMode,
                                  })
                                }
                              >
                                <option value="walk">Walk</option>
                                <option value="drive">Drive</option>
                                <option value="shuttle">Shuttle</option>
                              </select>
                            </label>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
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
                <p>Create the sub-listings available inside this property.</p>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  setField("rentalOptions", [
                    ...form.rentalOptions,
                    { ...emptyOption(), sortOrder: form.rentalOptions.length },
                  ])
                }
              >
                <Plus aria-hidden="true" /> Add rental option
              </Button>
            </div>
            {form.rentalOptions.map((option, index) => (
              <div
                className="admin-rental-option-card"
                key={option.id ?? index}
              >
                <div>
                  <strong>
                    Rental option {String(index + 1).padStart(2, "0")}
                  </strong>
                  <span>{option.status}</span>
                  {form.rentalOptions.length > 1 && (
                    <Button
                      variant="outline"
                      aria-label={`Remove rental option ${index + 1}`}
                      onClick={() =>
                        setField(
                          "rentalOptions",
                          form.rentalOptions.filter(
                            (_, optionIndex) => optionIndex !== index,
                          ),
                        )
                      }
                    >
                      <Trash2 aria-hidden="true" /> Remove
                    </Button>
                  )}
                </div>
                <div className="admin-form-grid">
                  <div>
                    <Label htmlFor={`room-name-${index}`}>Display name</Label>
                    <Input
                      id={`room-name-${index}`}
                      value={option.title}
                      onChange={(event) => {
                        const title = event.target.value;
                        setOption(index, "title", title);
                        if (!option.id) {
                          setOption(index, "slug", slugify(title));
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`room-code-${index}`}>Internal code</Label>
                    <Input
                      id={`room-code-${index}`}
                      value={option.internalCode ?? ""}
                      onChange={(event) =>
                        setOption(index, "internalCode", event.target.value)
                      }
                      placeholder="e.g. Room A"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`room-variant-${index}`}>Variant</Label>
                    <Input
                      id={`room-variant-${index}`}
                      value={option.variant ?? ""}
                      onChange={(event) =>
                        setOption(index, "variant", event.target.value)
                      }
                      placeholder="e.g. Cosmo or Balcony"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`room-type-${index}`}>Room type</Label>
                    <select
                      id={`room-type-${index}`}
                      value={option.roomType}
                      onChange={(event) =>
                        setOption(
                          index,
                          "roomType",
                          event.target.value as RentalOptionInput["roomType"],
                        )
                      }
                    >
                      <option value="master_bedroom">Master Bedroom</option>
                      <option value="medium_bedroom">Medium Bedroom</option>
                      <option value="single_bedroom">Single Bedroom</option>
                      <option value="small_room">Small Room</option>
                      <option value="soho_studio">Soho / Studio</option>
                      <option value="whole_unit">Whole Unit</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor={`availability-${index}`}>
                      Availability
                    </Label>
                    <select
                      id={`availability-${index}`}
                      value={option.availability}
                      onChange={(event) =>
                        setOption(
                          index,
                          "availability",
                          event.target
                            .value as RentalOptionInput["availability"],
                        )
                      }
                    >
                      <option value="available">Available</option>
                      <option value="reserved">Reserved</option>
                      <option value="occupied">Occupied</option>
                      <option value="unavailable">Unavailable</option>
                      <option value="coming_soon">Coming soon</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor={`rent-min-${index}`}>Rent from (RM)</Label>
                    <Input
                      id={`rent-min-${index}`}
                      type="number"
                      min="0"
                      value={option.priceMin}
                      onChange={(event) =>
                        setOption(index, "priceMin", Number(event.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`rent-max-${index}`}>Rent to (RM)</Label>
                    <Input
                      id={`rent-max-${index}`}
                      type="number"
                      min="0"
                      value={option.priceMax ?? ""}
                      onChange={(event) =>
                        setOption(
                          index,
                          "priceMax",
                          event.target.value
                            ? Number(event.target.value)
                            : null,
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`bedrooms-${index}`}>Bedrooms</Label>
                    <Input
                      id={`bedrooms-${index}`}
                      type="number"
                      min="0"
                      step="0.5"
                      value={option.bedrooms}
                      onChange={(event) =>
                        setOption(index, "bedrooms", Number(event.target.value))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`bathrooms-${index}`}>Bathrooms</Label>
                    <Input
                      id={`bathrooms-${index}`}
                      type="number"
                      min="0"
                      step="0.5"
                      value={option.bathrooms}
                      onChange={(event) =>
                        setOption(
                          index,
                          "bathrooms",
                          Number(event.target.value),
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`bathroom-type-${index}`}>
                      Bathroom type
                    </Label>
                    <select
                      id={`bathroom-type-${index}`}
                      value={option.bathroomType}
                      onChange={(event) =>
                        setOption(
                          index,
                          "bathroomType",
                          event.target
                            .value as RentalOptionInput["bathroomType"],
                        )
                      }
                    >
                      <option value="private">Private</option>
                      <option value="shared">Shared</option>
                      <option value="unspecified">Unspecified</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor={`area-sqft-${index}`}>Size (sq. ft.)</Label>
                    <Input
                      id={`area-sqft-${index}`}
                      type="number"
                      min="1"
                      value={option.areaSqft ?? ""}
                      onChange={(event) =>
                        setOption(
                          index,
                          "areaSqft",
                          event.target.value
                            ? Number(event.target.value)
                            : null,
                        )
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`bed-type-${index}`}>Bed type</Label>
                    <Input
                      id={`bed-type-${index}`}
                      value={option.bedType ?? ""}
                      onChange={(event) =>
                        setOption(index, "bedType", event.target.value)
                      }
                      placeholder="Queen, single, super single"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`quantity-${index}`}>
                      Quantity available
                    </Label>
                    <Input
                      id={`quantity-${index}`}
                      type="number"
                      min="0"
                      value={option.quantityAvailable}
                      onChange={(event) =>
                        setOption(
                          index,
                          "quantityAvailable",
                          Number(event.target.value),
                        )
                      }
                    />
                  </div>
                  <label className="admin-switch-row">
                    <input
                      type="checkbox"
                      checked={option.furnished}
                      onChange={(event) =>
                        setOption(index, "furnished", event.target.checked)
                      }
                    />
                    <span>Fully furnished</span>
                  </label>
                  <div className="admin-form-full">
                    <Label htmlFor={`price-note-${index}`}>Price note</Label>
                    <Input
                      id={`price-note-${index}`}
                      value={option.priceNote ?? ""}
                      onChange={(event) =>
                        setOption(index, "priceNote", event.target.value)
                      }
                      placeholder="Optional context for renters"
                    />
                  </div>
                  <div className="admin-form-full">
                    <Label htmlFor={`room-description-${index}`}>
                      Description
                    </Label>
                    <Textarea
                      id={`room-description-${index}`}
                      rows={3}
                      value={option.description}
                      onChange={(event) =>
                        setOption(index, "description", event.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {step === 3 && (
          <>
            <div className="admin-editor-heading">
              <div>
                <span>Step 4 of 4</span>
                <h2>Property media</h2>
                <p>Upload property images to Supabase Storage.</p>
              </div>
            </div>
            {form.id ? (
              <label className="admin-upload-zone admin-listing-upload">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  disabled={uploading}
                  onChange={(event) => uploadMedia(event.target.files)}
                />
                <ImagePlus aria-hidden="true" />
                <strong>
                  {uploading ? "Uploading..." : "Upload listing images"}
                </strong>
                <span>JPG, PNG, WebP or AVIF · maximum 10MB each</span>
                <span className="admin-upload-action">Choose images</span>
              </label>
            ) : (
              <div className="admin-location-placeholder">
                Save the new property first, then return here to upload images.
              </div>
            )}
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
            <Button
              className="admin-primary-button"
              onClick={() => save(form.status)}
              disabled={saveMutation.isPending}
            >
              <Save aria-hidden="true" /> Save listing
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
