"use client";

import { ArrowUpRight, MapPin, Maximize2, X } from "lucide-react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type PropertyLocationMapProps = {
  address: string;
  coordinates: [number, number] | null;
  propertyTitle: string;
  onCoordinatesChange?: (coordinates: [number, number]) => void;
};

const PropertyMapCanvas = dynamic(() => import("./property-map-canvas"), {
  ssr: false,
  loading: () => <output className="property-map-loading">Loading map…</output>,
});

export default function PropertyLocationMap(props: PropertyLocationMapProps) {
  const { address, coordinates, propertyTitle } = props;
  const query = coordinates ? coordinates.join(",") : `${address}, Malaysia`;
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const hasMap = Boolean(coordinates || props.onCoordinatesChange);

  const map = (expanded = false) => (
    <PropertyMapCanvas
      coordinates={coordinates}
      propertyTitle={propertyTitle}
      onCoordinatesChange={props.onCoordinatesChange}
      expanded={expanded}
    />
  );

  return (
    <div className="property-map-shell">
      {hasMap ? (
        <Dialog>
          <section
            className="property-map-viewport"
            aria-label={`${propertyTitle} location map`}
          >
            {map()}
            <DialogTrigger
              className="property-map-expand"
              aria-label="Expand map"
            >
              <Maximize2 aria-hidden="true" />
            </DialogTrigger>
          </section>
          <DialogContent
            className="property-map-dialog"
            showCloseButton={false}
          >
            <div className="property-map-dialog-heading">
              <div>
                <DialogTitle>{propertyTitle}</DialogTitle>
                <DialogDescription>{address}</DialogDescription>
              </div>
              <DialogClose
                className="property-map-close"
                aria-label="Close map"
              >
                <X aria-hidden="true" />
              </DialogClose>
            </div>
            <div className="property-map-dialog-canvas">{map(true)}</div>
            <a
              className="property-map-link"
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
            >
              Open in Google Maps <ArrowUpRight aria-hidden="true" />
            </a>
          </DialogContent>
        </Dialog>
      ) : (
        <div className="property-map-empty">
          <MapPin aria-hidden="true" />
          <strong>Explore the neighbourhood</strong>
          <p>
            The exact pin isn’t available yet. Search the address in Google Maps
            or contact us to confirm the location.
          </p>
        </div>
      )}
      <div className="property-map-details">
        <div>
          <MapPin aria-hidden="true" />
          <div>
            <strong>{propertyTitle}</strong>
            <p>{address}</p>
          </div>
        </div>
        <a
          className="property-map-link"
          href={googleMapsUrl}
          target="_blank"
          rel="noreferrer"
        >
          {coordinates
            ? "Open in Google Maps"
            : "Search address on Google Maps"}
          <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
