"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PropertyInput } from "@/lib/listing-schema";

type ListingInformation = Pick<
  PropertyInput,
  | "highlights"
  | "houseRules"
  | "rentalTerms"
  | "bookingSteps"
  | "availabilityLabel"
  | "responseTime"
>;

function TextList({
  title,
  id,
  items,
  limit = 20,
  onChange,
}: {
  title: string;
  id: string;
  items: string[];
  limit?: number;
  onChange: (items: string[]) => void;
}) {
  return (
    <section className="admin-form-full admin-information-section">
      <h3>{title}</h3>
      {items.map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: Rows are fully controlled and have no local state or persisted IDs.
        <div className="admin-information-row" key={`${id}-${index}`}>
          <div>
            <Label htmlFor={`${id}-${index}`}>
              {title} · {index + 1}
            </Label>
            <Textarea
              id={`${id}-${index}`}
              rows={2}
              maxLength={500}
              value={item}
              onChange={(event) =>
                onChange(
                  items.map((value, itemIndex) =>
                    itemIndex === index ? event.target.value : value,
                  ),
                )
              }
            />
          </div>
          <Button
            variant="outline"
            disabled={items.length === 1}
            aria-label={`Remove ${title.toLowerCase()} item ${index + 1}`}
            onClick={() =>
              onChange(items.filter((_, itemIndex) => itemIndex !== index))
            }
          >
            <Trash2 aria-hidden="true" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        disabled={items.length >= limit}
        onClick={() => onChange([...items, ""])}
      >
        <Plus aria-hidden="true" /> Add item
      </Button>
    </section>
  );
}

export default function AdminListingInformation({
  value,
  onChange,
}: {
  value: ListingInformation;
  onChange: (update: Partial<ListingInformation>) => void;
}) {
  return (
    <div className="admin-form-grid admin-listing-information">
      <TextList
        title="Good to know"
        id="listing-highlight"
        items={value.highlights}
        onChange={(highlights) => onChange({ highlights })}
      />
      <section className="admin-form-full admin-information-section">
        <h3>Rental terms</h3>
        {value.rentalTerms.map((term, index) => (
          <div
            className="admin-information-row admin-information-term"
            // biome-ignore lint/suspicious/noArrayIndexKey: Rows are fully controlled and have no local state or persisted IDs.
            key={`term-${index}`}
          >
            <div>
              <Label htmlFor={`term-label-${index}`}>Label {index + 1}</Label>
              <Input
                id={`term-label-${index}`}
                maxLength={120}
                placeholder="e.g. Deposit"
                value={term.label}
                onChange={(event) =>
                  onChange({
                    rentalTerms: value.rentalTerms.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, label: event.target.value }
                        : item,
                    ),
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor={`term-value-${index}`}>Details {index + 1}</Label>
              <Textarea
                id={`term-value-${index}`}
                rows={2}
                maxLength={1000}
                value={term.value}
                onChange={(event) =>
                  onChange({
                    rentalTerms: value.rentalTerms.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, value: event.target.value }
                        : item,
                    ),
                  })
                }
              />
            </div>
            <Button
              variant="outline"
              disabled={value.rentalTerms.length === 1}
              aria-label={`Remove rental term ${index + 1}`}
              onClick={() =>
                onChange({
                  rentalTerms: value.rentalTerms.filter(
                    (_, itemIndex) => itemIndex !== index,
                  ),
                })
              }
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        ))}
        <Button
          variant="outline"
          disabled={value.rentalTerms.length >= 20}
          onClick={() =>
            onChange({
              rentalTerms: [...value.rentalTerms, { label: "", value: "" }],
            })
          }
        >
          <Plus aria-hidden="true" /> Add rental term
        </Button>
      </section>
      <TextList
        title="House rules"
        id="listing-rule"
        items={value.houseRules}
        onChange={(houseRules) => onChange({ houseRules })}
      />
      <TextList
        title="How it works"
        id="listing-step"
        items={value.bookingSteps}
        limit={12}
        onChange={(bookingSteps) => onChange({ bookingSteps })}
      />
      <div>
        <Label htmlFor="availability-label">Availability heading</Label>
        <Input
          id="availability-label"
          maxLength={160}
          value={value.availabilityLabel}
          onChange={(event) =>
            onChange({ availabilityLabel: event.target.value })
          }
        />
      </div>
      <div>
        <Label htmlFor="response-time">Response time</Label>
        <Input
          id="response-time"
          maxLength={200}
          value={value.responseTime}
          onChange={(event) => onChange({ responseTime: event.target.value })}
        />
      </div>
      <p className="admin-form-full admin-map-help">
        Tenant experience currently displays a labelled sample review.
      </p>
    </div>
  );
}
