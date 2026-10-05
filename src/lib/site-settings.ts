import "server-only";

import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/env";
import type { SiteSettingsInput } from "@/lib/listing-schema";
import { createClient } from "@/lib/supabase/server";

const fallbackHeroSlides: SiteSettingsInput["homepageHeroSlides"] = [
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
];

export const fallbackSiteSettings: SiteSettingsInput = {
  siteName: "RentDeer",
  tagline: "Rent Smarter. Live Better.",
  primaryColour: "#185519",
  accentColour: "#F5CF3F",
  companyEmail: "hello.rentdeer@gmail.com",
  tenantPhone: "+6019 252 3804",
  tenantWhatsapp: "+6019 343 3804",
  landlordWhatsapp: "+6011 3928 2804",
  companyAddress:
    "S-036 & S-042, Seasons Square, Jalan PJU 10/3C, Damansara Damai, 47380 Petaling Jaya, Selangor, Malaysia",
  logo: null,
  homepageHeroSlides: fallbackHeroSlides,
  socialLinks: [
    {
      platform: "Instagram",
      url: "https://www.instagram.com/rent.deer/",
      isVisible: true,
      sortOrder: 1,
    },
    {
      platform: "Facebook",
      url: "https://www.facebook.com/people/Rentdeercom/61557446064027/",
      isVisible: true,
      sortOrder: 2,
    },
    {
      platform: "TikTok",
      url: "https://www.tiktok.com/@rentdeer.com",
      isVisible: true,
      sortOrder: 3,
    },
    {
      platform: "YouTube",
      url: "https://www.youtube.com/@RentDeer_Channel",
      isVisible: true,
      sortOrder: 4,
    },
    {
      platform: "Threads",
      url: "https://www.threads.com/@rent.deer",
      isVisible: true,
      sortOrder: 5,
    },
  ],
};

function publicAssetUrl(path: string) {
  if (path.startsWith("/") || /^https?:\/\//i.test(path)) return path;
  const { url } = getSupabaseEnv();
  const encodedPath = path
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  return `${url}/storage/v1/object/public/listing-media/${encodedPath}`;
}

function mapSiteImage(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const image = value as { path?: unknown; alt?: unknown };
  const path = typeof image.path === "string" ? image.path.trim() : "";
  if (!path) return null;
  return {
    path,
    url: publicAssetUrl(path),
    alt: typeof image.alt === "string" ? image.alt : "",
  };
}

export async function getSiteSettings(): Promise<SiteSettingsInput> {
  if (!hasSupabaseEnv()) return fallbackSiteSettings;
  const supabase = await createClient();
  const [{ data: settings, error }, { data: socialLinks }] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", true).single(),
    supabase
      .from("social_links")
      .select("platform, url, is_visible, sort_order")
      .order("sort_order"),
  ]);
  if (error) throw error;
  const logo = settings.logo_path
    ? mapSiteImage({
        path: settings.logo_path,
        alt: `${settings.site_name} logo`,
      })
    : null;
  const homepageHeroSlides = Array.isArray(settings.homepage_hero_slides)
    ? settings.homepage_hero_slides
        .map((image: unknown) => mapSiteImage(image))
        .filter(
          (
            image: ReturnType<typeof mapSiteImage>,
          ): image is NonNullable<ReturnType<typeof mapSiteImage>> =>
            image !== null,
        )
        .slice(0, 4)
    : [];
  return {
    siteName: settings.site_name,
    tagline: settings.tagline,
    primaryColour: settings.primary_colour,
    accentColour: settings.accent_colour,
    companyEmail: settings.company_email ?? "",
    tenantPhone: settings.tenant_phone ?? "",
    tenantWhatsapp: settings.tenant_whatsapp ?? "",
    landlordWhatsapp: settings.landlord_whatsapp ?? "",
    companyAddress: settings.company_address ?? "",
    logo,
    homepageHeroSlides: homepageHeroSlides.length
      ? homepageHeroSlides
      : fallbackHeroSlides,
    socialLinks: (socialLinks ?? []).map((link) => ({
      platform: link.platform,
      url: link.url,
      isVisible: link.is_visible,
      sortOrder: link.sort_order,
    })),
  };
}

export async function saveSiteSettings(input: SiteSettingsInput) {
  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert({
    id: true,
    site_name: input.siteName,
    tagline: input.tagline,
    primary_colour: input.primaryColour,
    accent_colour: input.accentColour,
    company_email: input.companyEmail || null,
    tenant_phone: input.tenantPhone || null,
    tenant_whatsapp: input.tenantWhatsapp || null,
    landlord_whatsapp: input.landlordWhatsapp || null,
    company_address: input.companyAddress || null,
    logo_path: input.logo?.path || null,
    homepage_hero_slides: input.homepageHeroSlides.map(({ path, alt }) => ({
      path,
      alt,
    })),
  });
  if (error) throw error;

  const { error: linksError } = await supabase.from("social_links").upsert(
    input.socialLinks.map((link) => ({
      platform: link.platform,
      url: link.url,
      is_visible: link.isVisible,
      sort_order: link.sortOrder,
    })),
    { onConflict: "platform" },
  );
  if (linksError) throw linksError;
  return getSiteSettings();
}
