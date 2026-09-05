"use client";

import dynamic from "next/dynamic";

type PropertyLocationMapProps = {
  address: string;
  coordinates: [number, number];
  propertyTitle: string;
};

const PropertyMapCanvas = dynamic(() => import("./property-map-canvas"), {
  ssr: false,
});

export default function PropertyLocationMap(props: PropertyLocationMapProps) {
  return <PropertyMapCanvas {...props} />;
}
