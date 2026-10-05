import "server-only";

import { adminContentPages } from "@/lib/admin-mock-data";
import { hasSupabaseEnv } from "@/lib/env";
import {
  type ContentPageInput,
  teamMemberInputSchema,
} from "@/lib/listing-schema";
import { createClient } from "@/lib/supabase/server";

type ContentSectionRow = {
  id: string;
  section_key: string;
  name: string;
  content: {
    eyebrow?: unknown;
    heading?: unknown;
    description?: unknown;
    teamMembers?: unknown;
  } | null;
  is_visible: boolean;
  sort_order: number;
  media_assets: Array<{
    id: string;
    bucket: string;
    object_path: string;
    alt_text: string;
    is_cover: boolean;
    sort_order: number;
  }> | null;
};

type ContentPageRow = {
  id: string;
  slug: string;
  name: string;
  route: string;
  description: string;
  status: "draft" | "published" | "archived";
  content_sections: ContentSectionRow[] | null;
};

function fallbackPages(): ContentPageInput[] {
  return adminContentPages.map((page) => ({
    id: crypto.randomUUID(),
    slug: page.slug,
    name: page.name,
    route: page.route,
    description: page.description,
    status: page.status.toLowerCase() as "published" | "draft",
    sections: page.sections.map((section, index) => {
      const isBeliefFeature =
        page.slug === "about" && section.id === "belief-feature";
      const isTeam = page.slug === "about" && section.id === "team";

      return {
        id: crypto.randomUUID(),
        sectionKey: section.id,
        name: section.name,
        content: {
          eyebrow: isBeliefFeature ? "RentDeer" : section.name,
          heading: isBeliefFeature ? "Striving For Change" : section.name,
          description: isBeliefFeature
            ? "The RentDeer team striving to improve rental living"
            : isTeam
              ? "With a focus on better living and smarter property solutions, our team continues to shape RentDeer's journey and the future of rental living."
              : section.description,
          teamMembers: isTeam
            ? [
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
              ]
            : [],
        },
        assets: [],
        isVisible: true,
        sortOrder: index,
        assetCount: section.assetCount,
      };
    }),
  }));
}

function mediaUrl(bucket: string, objectPath: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base
    ? `${base}/storage/v1/object/public/${bucket}/${objectPath}`
    : objectPath;
}

function mapTeamMembers(value: unknown) {
  const result = teamMemberInputSchema.array().max(3).safeParse(value);
  return result.success ? result.data : [];
}

function mapPage(row: ContentPageRow): ContentPageInput {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    route: row.route,
    description: row.description,
    status: row.status,
    sections: [...(row.content_sections ?? [])]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((section) => ({
        id: section.id,
        sectionKey: section.section_key,
        name: section.name,
        content: {
          eyebrow: String(section.content?.eyebrow ?? ""),
          heading: String(section.content?.heading ?? ""),
          description: String(section.content?.description ?? ""),
          teamMembers: mapTeamMembers(section.content?.teamMembers),
        },
        assets: [...(section.media_assets ?? [])]
          .sort(
            (a, b) =>
              Number(b.is_cover) - Number(a.is_cover) ||
              a.sort_order - b.sort_order,
          )
          .map((asset) => ({
            id: asset.id,
            url: mediaUrl(asset.bucket, asset.object_path),
            alt: asset.alt_text,
            isCover: asset.is_cover,
            sortOrder: asset.sort_order,
          })),
        isVisible: section.is_visible,
        sortOrder: section.sort_order,
        assetCount: section.media_assets?.length ?? 0,
      })),
  };
}

export async function listContentPages(admin = false) {
  if (!hasSupabaseEnv()) return fallbackPages();
  const supabase = await createClient();
  let query = supabase
    .from("content_pages")
    .select(
      "*, content_sections(*, media_assets(id, bucket, object_path, alt_text, is_cover, sort_order))",
    )
    .order("name");
  if (!admin) query = query.eq("status", "published");
  const { data, error } = await query;
  if (error) throw error;
  return ((data ?? []) as unknown as ContentPageRow[]).map(mapPage);
}

export async function getContentPage(slug: string, admin = false) {
  if (!hasSupabaseEnv()) {
    return fallbackPages().find((page) => page.slug === slug) ?? null;
  }
  const supabase = await createClient();
  let query = supabase
    .from("content_pages")
    .select(
      "*, content_sections(*, media_assets(id, bucket, object_path, alt_text, is_cover, sort_order))",
    )
    .eq("slug", slug);
  if (!admin) query = query.eq("status", "published");
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data ? mapPage(data as unknown as ContentPageRow) : null;
}

export async function saveContentPage(input: ContentPageInput) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("content_pages")
    .update({
      name: input.name,
      route: input.route,
      description: input.description,
      status: input.status,
    })
    .eq("id", input.id);
  if (error) throw error;

  for (const section of input.sections) {
    const { error: sectionError } = await supabase
      .from("content_sections")
      .update({
        name: section.name,
        content: section.content,
        is_visible: section.isVisible,
        sort_order: section.sortOrder,
      })
      .eq("id", section.id)
      .eq("page_id", input.id);
    if (sectionError) throw sectionError;

    for (const asset of section.assets) {
      const { error: assetError } = await supabase
        .from("media_assets")
        .update({
          alt_text: asset.alt,
          is_cover: asset.isCover,
          sort_order: asset.sortOrder,
        })
        .eq("id", asset.id)
        .eq("content_section_id", section.id);
      if (assetError) throw assetError;
    }
  }
  return getContentPage(input.slug, true);
}
