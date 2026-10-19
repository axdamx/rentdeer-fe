import { z } from "zod";

export const navigationItems = [
  { id: "home", label: "Home", href: "/", pageSlug: "home" },
  { id: "about", label: "About Us", href: "/about", pageSlug: "about" },
  { id: "properties", label: "Property", href: "/properties", pageSlug: null },
  {
    id: "services",
    label: "Services",
    href: "/services",
    pageSlug: "services",
  },
  { id: "story", label: "Our Story", href: "/about#story", pageSlug: "about" },
  { id: "faq", label: "FAQ", href: "/faq", pageSlug: "faq" },
  {
    id: "bulletin",
    label: "Bulletin",
    href: "/bulletin",
    pageSlug: "bulletin",
  },
  { id: "contact", label: "Contact Us", href: "/contact", pageSlug: "contact" },
] as const;

export type NavigationId = (typeof navigationItems)[number]["id"];
export const navigationVisibilitySchema = z.object({
  home: z.boolean().default(true),
  about: z.boolean().default(true),
  properties: z.boolean().default(true),
  services: z.boolean().default(true),
  story: z.boolean().default(true),
  faq: z.boolean().default(true),
  bulletin: z.boolean().default(true),
  contact: z.boolean().default(true),
});
export type NavigationVisibility = z.infer<typeof navigationVisibilitySchema>;
export const navigationVisibilityInputSchema = z.record(
  z.enum(navigationItems.map((item) => item.id)),
  z.boolean(),
);
export const navigationSettingsSlug = "site-navigation";

export function visibleNavigation(
  publishedSlugs: string[],
  visibility: NavigationVisibility,
) {
  return navigationItems
    .filter(
      (item) =>
        visibility[item.id] &&
        (item.pageSlug === null || publishedSlugs.includes(item.pageSlug)),
    )
    .map((item) => item.id);
}
