export const queryKeys = {
  properties: {
    all: ["properties"] as const,
    list: (filters: Record<string, unknown>) =>
      ["properties", "list", filters] as const,
    detail: (slug: string) => ["properties", "detail", slug] as const,
  },
  admin: {
    properties: (filters: Record<string, unknown>) =>
      ["admin", "properties", filters] as const,
    property: (slug: string) => ["admin", "property", slug] as const,
    enquiries: (filters: Record<string, unknown>) =>
      ["admin", "enquiries", filters] as const,
  },
};
