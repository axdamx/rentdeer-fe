"use client";

import { useMutation } from "@tanstack/react-query";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AddressMatch } from "@/lib/address-geocoding";
import { apiRequest } from "@/lib/api-client";

export default function AdminAddressLookup({
  address,
  onSelect,
}: {
  address: string;
  onSelect: (match: AddressMatch) => void;
}) {
  const lookup = useMutation({
    mutationFn: async (search: string) => {
      const result = await apiRequest<{ data: AddressMatch[] }>(
        "/api/admin/geocode",
        {
          method: "POST",
          body: JSON.stringify({ address: search }),
        },
      );
      return { address: search, matches: result.data };
    },
  });
  const results =
    lookup.data?.address === address ? lookup.data.matches : undefined;

  return (
    <div className="admin-address-lookup">
      <Button
        variant="outline"
        disabled={lookup.isPending || address.trim().length < 5}
        onClick={() => lookup.mutate(address)}
      >
        <MapPin aria-hidden="true" />
        {lookup.isPending ? "Finding address…" : "Find pin from address"}
      </Button>
      {lookup.isError && <p role="alert">{lookup.error.message}</p>}
      {results && (
        <div className="admin-address-matches" aria-live="polite">
          <p>
            {results.length
              ? "Choose the matching address, then check the map below before saving."
              : "No property or street match found. Try the building name and street in the Address field, or set the coordinates manually."}
          </p>
          {results.map((match) => (
            <button
              type="button"
              key={`${match.latitude},${match.longitude}`}
              onClick={() => onSelect(match)}
            >
              <span>{match.label}</span>
              <strong>Use this pin</strong>
            </button>
          ))}
        </div>
      )}
      <small>
        Address search by{" "}
        <a href="https://photon.komoot.io/" target="_blank" rel="noreferrer">
          Photon
        </a>{" "}
        · ©{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noreferrer"
        >
          OpenStreetMap
        </a>{" "}
        contributors
      </small>
    </div>
  );
}
