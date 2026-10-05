import referenceData from "@/data/listing-reference-data.json";

export type TransitStation = (typeof referenceData.transitStations)[number];

export const facilityOptions = referenceData.facilities;
export const transitMap = referenceData.transitMap;
export const transitStations = referenceData.transitStations;

export const transitStationById = new Map(
  transitStations.map((station) => [station.id, station]),
);
