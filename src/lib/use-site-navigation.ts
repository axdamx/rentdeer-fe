"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import type { NavigationId } from "@/lib/navigation";

export function useSiteNavigation() {
  const query = useQuery({
    queryKey: ["site-navigation"],
    queryFn: () => apiRequest<{ data: NavigationId[] }>("/api/navigation"),
    staleTime: 0,
    refetchInterval: 60_000,
  });
  return (id: NavigationId) => query.data?.data.includes(id) ?? false;
}
