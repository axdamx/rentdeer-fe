"use client";

import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

type PropertyMapCanvasProps = {
  address: string;
  coordinates: [number, number];
  propertyTitle: string;
};

const markerIcon = L.divIcon({
  className: "rentdeer-map-marker",
  html: "<span></span>",
  iconAnchor: [15, 15],
  iconSize: [30, 30],
  popupAnchor: [0, -17],
});

export default function PropertyMapCanvas({
  address,
  coordinates,
  propertyTitle,
}: PropertyMapCanvasProps) {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates[0]},${coordinates[1]}`;

  return (
    <MapContainer
      center={coordinates}
      zoom={15}
      scrollWheelZoom={false}
      className="property-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={coordinates} icon={markerIcon}>
        <Popup>
          <strong>{propertyTitle}</strong>
          <span>{address}</span>
          <a href={googleMapsUrl} target="_blank" rel="noreferrer">
            Open in Google Maps →
          </a>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
