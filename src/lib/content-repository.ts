import "server-only";

import { adminContentPages } from "@/lib/admin-mock-data";
import { hasSupabaseEnv } from "@/lib/env";
import type { ContentPageInput } from "@/lib/listing-schema";
import { createClient } from "@/lib/supabase/server";

type ContentSectionRow = {
  id: string;
  section_key: string;
  name: string;
  content: {
    eyebrow?: unknown;
    heading?: unknown;
    description?: unknown;
  } | null;
  is_visible: boolean;
  sort_order: number;
  media_assets: Array<{ id: string }> | null;
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
    sections: page.sections.map((section, index) => ({
      id: crypto.randomUUID(),
      sectionKey: section.id,
      name: section.name,
      content: {
        eyebrow: section.name,
        heading: section.name,
        description: section.description,
      },
      isVisible: true,
      sortOrder: index,
      assetCount: section.assetCount,
    })),
  }));
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
        },
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
    .select("*, content_sections(*, media_assets(id))")
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
    .select("*, content_sections(*, media_assets(id))")
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
  }
  return getContentPage(input.slug, true);
}
