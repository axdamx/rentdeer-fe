import "server-only";

import { adminContentPages } from "@/lib/admin-mock-data";
import { hasSupabaseEnv } from "@/lib/env";
import {
  type NavigationVisibility,
  navigationSettingsSlug,
  navigationVisibilitySchema,
  visibleNavigation,
} from "@/lib/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getNavigationVisibility(): Promise<NavigationVisibility> {
  if (!hasSupabaseEnv()) return navigationVisibilitySchema.parse({});
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_pages")
    .select("content_sections(section_key, content)")
    .eq("slug", navigationSettingsSlug)
    .maybeSingle();
  if (error) throw error;
  const sections = data?.content_sections as
    | Array<{ section_key: string; content: unknown }>
    | undefined;
  const saved = sections?.find(
    (section) => section.section_key === "visibility",
  )?.content;
  return navigationVisibilitySchema.parse(saved ?? {});
}

export async function getPublicNavigation() {
  const visibility = await getNavigationVisibility();
  if (!hasSupabaseEnv()) {
    return visibleNavigation(
      adminContentPages
        .filter((page) => page.status === "Published")
        .map((page) => page.slug),
      visibility,
    );
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_pages")
    .select("slug")
    .eq("status", "published");
  if (error) throw error;
  return visibleNavigation(
    (data ?? []).map((page) => page.slug),
    visibility,
  );
}

export async function saveNavigationVisibility(
  visibility: NavigationVisibility,
) {
  const supabase = await createClient();
  // Keep global navigation configuration in the existing CMS JSON storage.
  // This reserved record is excluded from editable/public content pages.
  const { data, error } = await supabase
    .from("content_pages")
    .upsert(
      {
        slug: navigationSettingsSlug,
        name: "Site navigation settings",
        route: "/_site-navigation",
        description: "Global navigation configuration",
        status: "published",
      },
      { onConflict: "slug" },
    )
    .select("id")
    .single();
  if (error) throw error;
  const { error: sectionError } = await supabase
    .from("content_sections")
    .upsert(
      {
        page_id: data.id,
        section_key: "visibility",
        name: "Navigation visibility",
        content: visibility,
        is_visible: true,
        sort_order: 0,
      },
      { onConflict: "page_id,section_key" },
    );
  if (sectionError) throw sectionError;
  return visibility;
}
