"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { apiRequest } from "@/lib/api-client";
import type { ContentPageInput } from "@/lib/listing-schema";
import {
  type AreaDevelopment,
  areaConfig,
  buildLocalAreaCards,
  type LocalAreaInput,
  localAreas,
  resolveLocalArea,
} from "@/lib/local-areas";

type Section = ContentPageInput["sections"][number];

function AreaEditor({
  area,
  config,
  developments,
  assets,
  onChange,
}: {
  area: (typeof localAreas)[number];
  config: LocalAreaInput;
  developments: AreaDevelopment[];
  assets: Section["assets"];
  onChange: (value: LocalAreaInput) => void;
}) {
  const anchor = useComboboxAnchor();
  const matching = developments.filter(
    (property) => resolveLocalArea(property)?.key === area.key,
  );
  const sources = config.propertyIds.length
    ? matching.filter((property) => config.propertyIds.includes(property.id))
    : matching.slice(0, 3);
  const preview = buildLocalAreaCards(
    developments,
    [{ ...config, isVisible: true }],
    assets,
  ).find((card) => card.key === area.key);
  return (
    <article className="admin-local-area">
      <div className="admin-local-area-title">
        <div>
          <span>{area.region}</span>
          <h4>{area.name}</h4>
        </div>
        <label>
          <input
            type="checkbox"
            checked={config.isVisible}
            onChange={(event) =>
              onChange({ ...config, isVisible: event.target.checked })
            }
          />{" "}
          Show area
        </label>
      </div>
      <div className="admin-local-area-layout">
        <div className="admin-local-area-preview">
          {preview?.image ? (
            <Image
              src={preview.image}
              alt={preview.imageAlt}
              fill
              sizes="180px"
            />
          ) : (
            <span>Upload a development photo</span>
          )}
          <strong>{area.name}</strong>
        </div>
        <div className="admin-local-area-fields">
          <label htmlFor={`sources-${area.key}`}>
            Development sources · up to 3
          </label>
          <Combobox
            multiple
            items={matching.map((property) => property.id)}
            value={config.propertyIds}
            itemToStringLabel={(id) =>
              matching.find((property) => property.id === id)?.title ??
              "Unavailable development"
            }
            onValueChange={(ids) => {
              if (ids.length > 3) return;
              onChange({
                ...config,
                propertyIds: ids,
                coverPropertyId: ids.includes(config.coverPropertyId ?? "")
                  ? config.coverPropertyId
                  : null,
                galleryIndex: 0,
              });
            }}
          >
            <ComboboxChips ref={anchor}>
              <ComboboxValue>
                {(ids: string[]) =>
                  ids.map((id) => (
                    <ComboboxChip
                      key={id}
                      aria-label={`Remove ${matching.find((property) => property.id === id)?.title ?? "unavailable development"}`}
                    >
                      {matching.find((property) => property.id === id)?.title ??
                        "Unavailable development"}
                    </ComboboxChip>
                  ))
                }
              </ComboboxValue>
              <ComboboxChipsInput
                id={`sources-${area.key}`}
                placeholder="Automatic from published listings"
                disabled={!matching.length}
              />
            </ComboboxChips>
            <ComboboxContent anchor={anchor}>
              <ComboboxEmpty>No developments found.</ComboboxEmpty>
              <ComboboxList>
                {(id: string) => (
                  <ComboboxItem
                    key={id}
                    value={id}
                    disabled={
                      config.propertyIds.length >= 3 &&
                      !config.propertyIds.includes(id)
                    }
                  >
                    {matching.find((property) => property.id === id)?.title}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          <p>
            {!matching.length
              ? "Hidden on the homepage until a development is published in this area."
              : config.propertyIds.length
                ? "Selected developments supply this area's image."
                : `Automatic: ${sources.map((property) => property.title).join(", ")}.`}
          </p>
          {config.propertyIds.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onChange({
                  ...config,
                  propertyIds: [],
                  coverPropertyId: null,
                  galleryIndex: 0,
                })
              }
            >
              Use automatic sources
            </Button>
          )}
          <div className="admin-form-grid">
            <div>
              <label htmlFor={`photo-${area.key}`}>Listing photo</label>
              <select
                id={`photo-${area.key}`}
                value={
                  config.coverPropertyId
                    ? `${config.coverPropertyId}:${config.galleryIndex}`
                    : ""
                }
                onChange={(event) => {
                  const [id, index] = event.target.value.split(":");
                  onChange({
                    ...config,
                    coverPropertyId: id || null,
                    galleryIndex: Number(index ?? 0),
                  });
                }}
              >
                <option value="">First source photo</option>
                {sources.flatMap((property) =>
                  (property.gallery.length
                    ? property.gallery
                    : [property.image]
                  ).map((_, index) => (
                    <option
                      key={`${property.id}:${index}`}
                      value={`${property.id}:${index}`}
                    >
                      {property.title} · photo {index + 1}
                    </option>
                  )),
                )}
              </select>
            </div>
            <div>
              <label htmlFor={`override-${area.key}`}>
                Uploaded image override
              </label>
              <select
                id={`override-${area.key}`}
                value={config.imageAssetId ?? ""}
                onChange={(event) =>
                  onChange({
                    ...config,
                    imageAssetId: event.target.value || null,
                  })
                }
              >
                <option value="">Use listing photo</option>
                {assets.map((asset, index) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.alt || `Uploaded image ${index + 1}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function AdminLocalAreasEditor({
  section,
  onChange,
}: {
  section: Section;
  onChange: (configs: LocalAreaInput[]) => void;
}) {
  const query = useQuery({
    queryKey: ["admin", "area-developments"],
    queryFn: () =>
      apiRequest<{ data: AreaDevelopment[] }>("/api/admin/area-developments"),
  });
  return (
    <div className="admin-form-section">
      <div className="admin-form-section-heading">
        <h3>Local areas</h3>
        <p>
          Area and city labels are fixed. Choose up to three published
          developments for each area, or let listings supply them automatically.
          Upload images in Section assets below, then choose an override.
        </p>
      </div>
      {query.isPending ? (
        <p>Loading published developments...</p>
      ) : query.isError ? (
        <p role="alert">
          Unable to load developments.{" "}
          <Button variant="outline" onClick={() => query.refetch()}>
            Try again
          </Button>
        </p>
      ) : (
        <div className="admin-local-area-list">
          {localAreas.map((area) => (
            <AreaEditor
              key={area.key}
              area={area}
              config={areaConfig(area.key, section.content.localAreas)}
              developments={query.data.data}
              assets={section.assets}
              onChange={(value) =>
                onChange([
                  ...section.content.localAreas.filter(
                    (config) => config.areaKey !== area.key,
                  ),
                  value,
                ])
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
