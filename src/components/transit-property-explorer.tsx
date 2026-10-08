"use client";

import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MapPin,
  TrainFront,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { transitMap, transitStations } from "@/lib/listing-reference-data";
import type { Property, TransitConnection } from "@/lib/properties";

function accessLabel(connection: TransitConnection) {
  const mode =
    connection.accessMode === "walk"
      ? "walk"
      : connection.accessMode === "drive"
        ? "drive"
        : "shuttle ride";
  return `${connection.accessMinutes} min ${mode} to station`;
}

export default function TransitPropertyExplorer({
  properties,
  currentPageOnly = false,
}: {
  properties: Property[];
  currentPageOnly?: boolean;
}) {
  const stationGroups = useMemo(
    () =>
      transitStations.map((station) => ({
        ...station,
        properties: properties.flatMap((property) =>
          (property.transitConnections ?? [])
            .filter((connection) => connection.stationId === station.id)
            .map((connection) => ({
              property,
              connection,
              access: accessLabel(connection),
            })),
        ),
      })),
    [properties],
  );
  const connectedPropertyCount = new Set(
    stationGroups.flatMap((station) =>
      station.properties.map(({ property }) => property.slug),
    ),
  ).size;
  const [activeStationId, setActiveStationId] = useState<string | null>(
    stationGroups[0]?.id ?? null,
  );
  const [stationSlideIndexes, setStationSlideIndexes] = useState<
    Record<string, number>
  >({});

  useEffect(() => {
    if (
      activeStationId &&
      stationGroups.some((station) => station.id === activeStationId)
    ) {
      return;
    }
    setActiveStationId(stationGroups[0]?.id ?? null);
  }, [activeStationId, stationGroups]);

  const changeStationSlide = (
    stationId: string,
    propertyCount: number,
    direction: -1 | 1,
  ) => {
    setStationSlideIndexes((current) => {
      const currentIndex = current[stationId] ?? 0;
      const nextIndex =
        (currentIndex + direction + propertyCount) % propertyCount;

      return { ...current, [stationId]: nextIndex };
    });
  };

  return (
    <section className="transit-explorer-section">
      <div className="content-section transit-explorer-inner">
        <div className="section-heading transit-section-heading">
          <div>
            <span className="rd-script-label">Connected living</span>
            <h2>Find a home along your daily route.</h2>
          </div>
          <p>
            Explore RentDeer properties near Klang Valley rail stations. Hover
            or focus a pin for a quick preview, then select it to view the full
            property.
            {currentPageOnly &&
              " Showing transit connections for the listings on this page."}
          </p>
        </div>

        <div className="transit-explorer-card">
          <aside className="transit-map-sidebar">
            <div className="transit-sidebar-sticky">
              <div className="transit-sidebar-intro">
                <span className="transit-eyebrow">
                  <TrainFront aria-hidden="true" /> Transit-linked homes
                </span>
                <h3>Commute with less guesswork.</h3>
                <p>
                  Start with the station you use, then compare nearby managed
                  homes and available rental options.
                </p>
              </div>

              <div className="transit-station-list">
                {stationGroups.map((station) => {
                  const isActive = activeStationId === station.id;

                  return (
                    <button
                      type="button"
                      className={
                        isActive
                          ? "transit-station-card is-active"
                          : "transit-station-card"
                      }
                      key={station.id}
                      onClick={() => setActiveStationId(station.id)}
                      onFocus={() => setActiveStationId(station.id)}
                      onPointerEnter={() => setActiveStationId(station.id)}
                    >
                      <span
                        className="transit-line-badge"
                        style={{
                          background: station.lineColor,
                          color: station.lineTextColor,
                        }}
                      >
                        {station.lineCode}
                      </span>
                      <span>
                        <strong>{station.station}</strong>
                        <small>
                          {station.properties.length} nearby{" "}
                          {station.properties.length === 1
                            ? "property"
                            : "properties"}
                          {station.properties[0]
                            ? ` · ${station.properties[0].access}`
                            : currentPageOnly
                              ? " · None on this page"
                              : " · Add a connection in Admin"}
                        </small>
                      </span>
                      <MapPin aria-hidden="true" />
                    </button>
                  );
                })}
              </div>

              <div className="transit-map-note">
                <MapPin aria-hidden="true" />
                <p>
                  Travel times are indicative. Confirm your route before
                  booking.
                </p>
              </div>
            </div>
          </aside>

          <div className="transit-map-panel">
            <div className="transit-map-toolbar">
              <span>
                <span className="transit-live-dot" /> {stationGroups.length}
                stations · {connectedPropertyCount} connected properties
              </span>
              <span>Scroll to explore the full network</span>
            </div>

            <div className="transit-map-scroll">
              <div className="transit-map-stage">
                <Image
                  alt="Klang Valley integrated rail transit map"
                  className="transit-map-image"
                  height={1817}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  sizes="(max-width: 700px) 680px, (max-width: 1100px) 65vw, 900px"
                  src={transitMap.imageUrl}
                  width={1260}
                />

                {stationGroups.map((station) => {
                  const isActive = activeStationId === station.id;
                  const activeSlideIndex =
                    (stationSlideIndexes[station.id] ?? 0) %
                    Math.max(1, station.properties.length);
                  const listing = station.properties[activeSlideIndex];

                  if (!listing) return null;
                  const property = listing.property;

                  const lowestRent = Math.min(
                    ...property.units.map((unit) => unit.monthlyRent),
                  );
                  const hasMultipleProperties = station.properties.length > 1;

                  return (
                    <article
                      aria-label={`${station.properties.length} properties near ${station.station}`}
                      className="transit-property-marker"
                      key={station.id}
                      onBlur={(event) => {
                        if (
                          !event.currentTarget.contains(event.relatedTarget)
                        ) {
                          setActiveStationId(null);
                        }
                      }}
                      onFocus={() => setActiveStationId(station.id)}
                      onPointerEnter={() => setActiveStationId(station.id)}
                      onPointerLeave={() => setActiveStationId(null)}
                      style={station.position}
                    >
                      {hasMultipleProperties ? (
                        <button
                          type="button"
                          aria-label={`Show ${station.properties.length} properties near ${station.station}`}
                          className={
                            isActive
                              ? "transit-property-pin is-active"
                              : "transit-property-pin"
                          }
                          onClick={() => setActiveStationId(station.id)}
                        >
                          <span>{station.properties.length}</span>
                        </button>
                      ) : (
                        <Link
                          aria-label={`View ${property.title} near ${station.station}`}
                          className={
                            isActive
                              ? "transit-property-pin is-active"
                              : "transit-property-pin"
                          }
                          href={`/properties/${property.slug}`}
                        >
                          <span>1</span>
                        </Link>
                      )}

                      <AnimatePresence mode="wait">
                        {isActive && (
                          <motion.div
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            className="transit-property-popover"
                            exit={{ opacity: 0, scale: 0.96, x: -6 }}
                            initial={{ opacity: 0, scale: 0.96, x: -6 }}
                            key={`${station.id}-${property.slug}`}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                          >
                            <Image
                              alt=""
                              height={72}
                              src={property.image}
                              width={92}
                            />
                            <div>
                              <span>{listing.access}</span>
                              <strong>{property.title}</strong>
                              <small>
                                From RM{lowestRent.toLocaleString()}/mo
                              </small>
                              <Link href={`/properties/${property.slug}`}>
                                View property{" "}
                                <ArrowUpRight aria-hidden="true" />
                              </Link>
                            </div>
                            {hasMultipleProperties && (
                              <div className="transit-popover-controls">
                                <span>
                                  {activeSlideIndex + 1} of{" "}
                                  {station.properties.length}
                                </span>
                                <div>
                                  <button
                                    type="button"
                                    aria-label={`Previous property near ${station.station}`}
                                    onClick={() =>
                                      changeStationSlide(
                                        station.id,
                                        station.properties.length,
                                        -1,
                                      )
                                    }
                                  >
                                    <ChevronLeft aria-hidden="true" />
                                  </button>
                                  <button
                                    type="button"
                                    aria-label={`Next property near ${station.station}`}
                                    onClick={() =>
                                      changeStationSlide(
                                        station.id,
                                        station.properties.length,
                                        1,
                                      )
                                    }
                                  >
                                    <ChevronRight aria-hidden="true" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </article>
                  );
                })}
              </div>
            </div>

            <a
              className="transit-map-source"
              href={transitMap.sourceUrl}
              rel="noreferrer"
              target="_blank"
            >
              View the latest official map on MyRapid
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
