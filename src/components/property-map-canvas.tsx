"use client";

import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import L from "leaflet";
import { LocateFixed, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "maplibre-gl/dist/maplibre-gl.css";

type PropertyMapCanvasProps = {
  coordinates: [number, number] | null;
  propertyTitle: string;
  onCoordinatesChange?: (coordinates: [number, number]) => void;
  expanded?: boolean;
};

const markerIcon = L.divIcon({
  className: "rentdeer-map-marker",
  html: '<span><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z"/><path d="M9 21v-9h6v9"/></svg></span>',
  iconAnchor: [26, 26],
  iconSize: [52, 52],
});

function BaseMap() {
  const map = useMap();
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    if (fallback) return;
    let layer: L.MaplibreGL | undefined;
    try {
      layer = maplibreGL({
        style: "https://tiles.openfreemap.org/styles/positron",
      });
      layer.addTo(map);
      layer.getContainer().setAttribute("aria-hidden", "true");
      layer.getMaplibreMap().on("error", () => setFallback(true));
    } catch {
      // Keep the map and pin usable on devices without WebGL support.
      if (layer && !layer.getMaplibreMap()) {
        const failedLayer = layer;
        failedLayer.onRemove = () => {
          failedLayer.getContainer()?.remove();
          return failedLayer;
        };
      }
      setFallback(true);
    }
    return () => {
      layer?.remove();
    };
  }, [map, fallback]);

  return fallback ? (
    <TileLayer
      className="property-map-raster"
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      maxZoom={19}
    />
  ) : null;
}

function MapControls({
  coordinates,
}: {
  coordinates: [number, number] | null;
}) {
  const map = useMap();
  const controls = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) });
  useEffect(() => {
    if (!controls.current) return;
    L.DomEvent.disableClickPropagation(controls.current);
    L.DomEvent.disableScrollPropagation(controls.current);
  }, []);
  return (
    <div className="property-map-controls" ref={controls}>
      {coordinates && (
        <button
          type="button"
          className="property-map-recenter"
          aria-label="Recenter map on property"
          onClick={() => map.setView(coordinates, 15)}
        >
          <LocateFixed aria-hidden="true" />
        </button>
      )}
      <fieldset className="property-map-zoom" aria-label="Map zoom">
        <button
          type="button"
          aria-label="Zoom in"
          disabled={zoom >= map.getMaxZoom()}
          onClick={() => map.zoomIn()}
        >
          <Plus aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          disabled={zoom <= map.getMinZoom()}
          onClick={() => map.zoomOut()}
        >
          <Minus aria-hidden="true" />
        </button>
      </fieldset>
    </div>
  );
}

function PlaceMapPin({
  coordinates,
  onSelect,
}: {
  coordinates: [number, number] | null;
  onSelect?: (coordinates: [number, number]) => void;
}) {
  const map = useMapEvents({
    click: ({ latlng }) => onSelect?.([latlng.lat, latlng.lng]),
  });
  const latitude = coordinates?.[0];
  const longitude = coordinates?.[1];
  useEffect(() => {
    if (latitude != null && longitude != null) {
      map.setView([latitude, longitude], Math.max(map.getZoom(), 15));
    }
  }, [latitude, longitude, map]);
  return null;
}

export default function PropertyMapCanvas({
  coordinates,
  propertyTitle,
  onCoordinatesChange,
  expanded = false,
}: PropertyMapCanvasProps) {
  return (
    <MapContainer
      center={coordinates ?? [4.2, 108]}
      zoom={coordinates ? 15 : 5}
      zoomControl={false}
      scrollWheelZoom={expanded}
      minZoom={3}
      maxZoom={19}
      maxBounds={[
        [-85, -180],
        [85, 180],
      ]}
      maxBoundsViscosity={1}
      className="property-map"
    >
      <BaseMap />
      {coordinates && (
        <Marker
          position={coordinates}
          icon={markerIcon}
          title={propertyTitle}
          alt={propertyTitle}
          interactive={Boolean(onCoordinatesChange)}
          draggable={Boolean(onCoordinatesChange)}
          eventHandlers={{
            dragend: (event) => {
              const { lat, lng } = event.target.getLatLng();
              onCoordinatesChange?.([lat, lng]);
            },
          }}
          keyboard={false}
        />
      )}
      <MapControls coordinates={coordinates} />
      <PlaceMapPin coordinates={coordinates} onSelect={onCoordinatesChange} />
    </MapContainer>
  );
}
