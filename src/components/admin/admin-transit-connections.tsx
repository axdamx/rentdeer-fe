"use client";

import { TrainFront, X } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type TransitStation,
  transitStationById,
  transitStations,
} from "@/lib/listing-reference-data";
import type { TransitConnectionInput } from "@/lib/listing-schema";

const accessModes: {
  value: TransitConnectionInput["accessMode"];
  label: string;
}[] = [
  { value: "walk", label: "Walk" },
  { value: "drive", label: "Drive" },
  { value: "shuttle", label: "Shuttle" },
];

function StationIdentity({ station }: { station: TransitStation }) {
  return (
    <span className="admin-transit-station">
      <span
        className="admin-transit-badge"
        style={{ background: station.lineColor, color: station.lineTextColor }}
        aria-hidden="true"
      >
        {station.lineCode}
      </span>
      <span>
        <strong>{station.station}</strong>
        <small>{station.line}</small>
      </span>
    </span>
  );
}

export default function AdminTransitConnections({
  value,
  onChange,
}: {
  value: TransitConnectionInput[];
  onChange: (connections: TransitConnectionInput[]) => void;
}) {
  const id = useId();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const availableStations = transitStations.filter(
    (station) =>
      !value.some((connection) => connection.stationId === station.id),
  );
  const updateStation = (
    stationId: string,
    patch: Partial<TransitConnectionInput>,
  ) => {
    onChange(
      value.map((connection) =>
        connection.stationId === stationId
          ? { ...connection, ...patch }
          : connection,
      ),
    );
  };

  return (
    <section
      className="admin-form-full admin-transit-selector"
      aria-labelledby={`${id}-heading`}
    >
      <div className="admin-field-heading">
        <div>
          <h3 id={`${id}-heading`}>Nearby public transport</h3>
          <p>
            Add nearby stations, then set how tenants can reach each one. Rail
            lines and map pins are filled automatically.
          </p>
        </div>
        <span>{value.length} connected</span>
      </div>

      <div className="admin-transit-picker">
        <Label htmlFor={`${id}-search`}>Add a station</Label>
        <Combobox
          items={availableStations.map((station) => station.id)}
          value={null}
          inputValue={search}
          onInputValueChange={setSearch}
          open={open}
          onOpenChange={setOpen}
          itemToStringLabel={(stationId: string) => {
            const station = transitStationById.get(stationId);
            return station ? `${station.station} · ${station.line}` : stationId;
          }}
          onValueChange={(stationId: string | null) => {
            if (
              !stationId ||
              value.some((item) => item.stationId === stationId)
            )
              return;
            onChange([
              ...value,
              { stationId, accessMinutes: 10, accessMode: "walk" },
            ]);
            setSearch("");
            setOpen(false);
          }}
        >
          <ComboboxInput
            id={`${id}-search`}
            placeholder={
              availableStations.length
                ? "Search by station or rail line…"
                : "All stations are connected"
            }
            disabled={!availableStations.length}
          />
          <ComboboxContent className="admin-transit-options">
            <ComboboxEmpty>No matching stations.</ComboboxEmpty>
            <ComboboxList>
              {(stationId: string) => {
                const station = transitStationById.get(stationId);
                return station ? (
                  <ComboboxItem value={stationId} key={stationId}>
                    <StationIdentity station={station} />
                  </ComboboxItem>
                ) : null;
              }}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      {value.length ? (
        <ul
          className="admin-transit-connections"
          aria-label="Connected stations"
        >
          {value.map((connection) => {
            const station = transitStationById.get(connection.stationId);
            if (!station) return null;
            const fieldId = `${id}-${station.id}`;
            return (
              <li className="admin-transit-row" key={station.id}>
                <StationIdentity station={station} />
                <div className="admin-transit-control">
                  <Label htmlFor={`${fieldId}-minutes`}>
                    Travel time (min)
                  </Label>
                  <Input
                    id={`${fieldId}-minutes`}
                    aria-label={`Minutes to ${station.station}`}
                    type="number"
                    min="1"
                    max="180"
                    value={connection.accessMinutes}
                    onChange={(event) =>
                      updateStation(station.id, {
                        accessMinutes: Number(event.target.value),
                      })
                    }
                  />
                </div>
                <div className="admin-transit-control">
                  <Label htmlFor={`${fieldId}-mode`}>Access</Label>
                  <Select
                    items={accessModes}
                    value={connection.accessMode}
                    onValueChange={(mode) => {
                      if (mode) updateStation(station.id, { accessMode: mode });
                    }}
                  >
                    <SelectTrigger
                      id={`${fieldId}-mode`}
                      aria-label={`Access mode to ${station.station}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {accessModes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="admin-transit-remove"
                  aria-label={`Remove ${station.station}`}
                  onClick={() =>
                    onChange(
                      value.filter((item) => item.stationId !== station.id),
                    )
                  }
                >
                  <X aria-hidden="true" />
                </Button>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="admin-transit-empty">
          <TrainFront aria-hidden="true" />
          <p>No stations connected yet. Search above to add one.</p>
        </div>
      )}
    </section>
  );
}
