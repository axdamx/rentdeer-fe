import { z } from "zod";

export const localAreas = [
  { key: "cheras", name: "Cheras", region: "Kuala Lumpur" },
  { key: "kepong", name: "Kepong", region: "Kuala Lumpur" },
  { key: "sentul", name: "Sentul", region: "Kuala Lumpur" },
  { key: "semarak", name: "Semarak", region: "Kuala Lumpur" },
  { key: "ara-damansara", name: "Ara Damansara", region: "Petaling Jaya" },
  { key: "damansara-damai", name: "Damansara Damai", region: "Petaling Jaya" },
  { key: "kota-damansara", name: "Kota Damansara", region: "Petaling Jaya" },
  { key: "kelana-jaya", name: "Kelana Jaya", region: "Petaling Jaya" },
  { key: "seri-kembangan", name: "Seri Kembangan", region: "Puchong" },
] as const;

export type LocalAreaKey = (typeof localAreas)[number]["key"];
export const localAreaInputSchema = z.object({
  areaKey: z.enum(localAreas.map((area) => area.key)),
  propertyIds: z
    .array(z.uuid())
    .max(3)
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "Choose each development once.",
    )
    .default([]),
  coverPropertyId: z.uuid().nullable().default(null),
  galleryIndex: z.number().int().min(0).max(100).default(0),
  imageAssetId: z.uuid().nullable().default(null),
  isVisible: z.boolean().default(true),
});
export const localAreaListSchema = z
  .array(localAreaInputSchema)
  .max(9)
  .refine(
    (items) => new Set(items.map((item) => item.areaKey)).size === items.length,
    "Each area can only appear once.",
  );
export type LocalAreaInput = z.infer<typeof localAreaInputSchema>;
export type AreaDevelopment = {
  id: string;
  title: string;
  city: string;
  area?: string | null;
  image: string;
  gallery: string[];
};
export type LocalAreaCard = (typeof localAreas)[number] & {
  image: string | null;
  imageAlt: string;
  developmentCount: number;
};
export type LocalAreasResponse = {
  data: LocalAreaCard[];
  enabled: boolean;
  eyebrow: string;
  heading: string;
  description: string;
};

const normalized = (value?: string | null) => value?.trim().toLowerCase() ?? "";
export function resolveLocalArea(property: {
  city: string;
  area?: string | null;
}) {
  return (
    localAreas.find(
      (area) => normalized(area.name) === normalized(property.area),
    ) ??
    localAreas.find(
      (area) => normalized(area.name) === normalized(property.city),
    )
  );
}

export function matchesPropertyLocation(
  property: { city: string; area?: string | null },
  selected: string,
) {
  if (selected === "All locations") return true;
  const area = resolveLocalArea(property);
  const selectedArea = localAreas.find(
    (item) => item.name === selected || item.key === selected,
  );
  if (selectedArea) return area?.key === selectedArea.key;
  if (["Kuala Lumpur", "Petaling Jaya", "Puchong"].includes(selected)) {
    return area
      ? area.region === selected
      : normalized(property.city) === normalized(selected);
  }
  return (
    normalized(property.city) === normalized(selected) ||
    normalized(property.area) === normalized(selected)
  );
}

export function areaConfig(
  areaKey: LocalAreaKey,
  configs: LocalAreaInput[],
): LocalAreaInput {
  return (
    configs.find((config) => config.areaKey === areaKey) ??
    localAreaInputSchema.parse({ areaKey })
  );
}

export function validLocalAreaSources(
  config: LocalAreaInput,
  publishedDevelopments: AreaDevelopment[],
  assetIds: string[],
) {
  const matching = publishedDevelopments.filter(
    (property) => resolveLocalArea(property)?.key === config.areaKey,
  );
  const selected = config.propertyIds.length
    ? config.propertyIds
    : matching.slice(0, 3).map((property) => property.id);
  return (
    config.propertyIds.every((id) =>
      matching.some((property) => property.id === id),
    ) &&
    (!config.coverPropertyId || selected.includes(config.coverPropertyId)) &&
    (!config.imageAssetId || assetIds.includes(config.imageAssetId))
  );
}

export function buildLocalAreaCards(
  developments: AreaDevelopment[],
  configs: LocalAreaInput[] = [],
  assets: { id: string; url: string; alt: string }[] = [],
): LocalAreaCard[] {
  return localAreas.flatMap((area) => {
    const config = areaConfig(area.key, configs);
    const matching = developments.filter(
      (property) => resolveLocalArea(property)?.key === area.key,
    );
    if (!config.isVisible || !matching.length) return [];
    const sources = config.propertyIds.length
      ? config.propertyIds.flatMap((id) =>
          matching.filter((property) => property.id === id),
        )
      : matching.slice(0, 3);
    const cover =
      sources.find((property) => property.id === config.coverPropertyId) ??
      sources[0];
    const override = assets.find((asset) => asset.id === config.imageAssetId);
    const image =
      override?.url ??
      cover?.gallery[config.galleryIndex] ??
      cover?.image ??
      null;
    // Generic listing fallbacks should not be presented as photos of a real development.
    const realImage = image?.startsWith("/estatein/") ? null : image;
    return [
      {
        ...area,
        image: realImage,
        imageAlt:
          override?.alt || (cover ? `${cover.title}, ${area.name}` : area.name),
        developmentCount: matching.length,
      },
    ];
  });
}
