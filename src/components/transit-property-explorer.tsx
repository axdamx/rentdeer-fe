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
import { useState } from "react";
import { properties } from "@/lib/properties";

const TRANSIT_MAP_URL =
  "https://paultan.org/image/2023/07/klang-valley-integrated-transit-map-1260x1817.jpg";

const transitStops = [
  {
    id: "damansara-damai",
    propertySlugs: [
      "seasons-square-damansara-damai",
      "kota-damansara-residences",
    ],
    station: "Damansara Damai MRT",
    line: "Putrajaya Line",
    lineCode: "PY",
    access: "8 min to station",
    position: { left: "27.25%", top: "24.45%" },
  },
  {
    id: "kota-damansara",
    propertySlugs: ["kota-damansara-residences"],
    station: "Kota Damansara MRT",
    line: "Kajang Line",
    lineCode: "KG",
    access: "10 min to station",
    position: { left: "27.25%", top: "36.2%" },
  },
  {
    id: "ara-damansara",
    propertySlugs: ["ara-damansara-studio-living"],
    station: "Ara Damansara LRT",
    line: "Kelana Jaya Line",
    lineCode: "KJ",
    access: "7 min to station",
    position: { left: "20.6%", top: "58.1%" },
  },
] as const;

const stationGroups = transitStops.map((stop) => ({
  ...stop,
  properties: stop.propertySlugs.flatMap((propertySlug) => {
    const property = properties.find(
      (propertyItem) => propertyItem.slug === propertySlug,
    );

    return property ? [property] : [];
  }),
}));

const connectedPropertyCount = new Set(
  stationGroups.flatMap((station) =>
    station.properties.map((property) => property.slug),
  ),
).size;

export default function TransitPropertyExplorer() {
  const [activeStationId, setActiveStationId] = useState<string | null>(
    stationGroups[0]?.id ?? null,
  );
  const [stationSlideIndexes, setStationSlideIndexes] = useState<
    Record<string, number>
  >({});

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
          </p>
        </div>

        <div className="transit-explorer-card">
          <aside className="transit-map-sidebar">
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
                      className={`transit-line-badge line-${station.lineCode}`}
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
                        {" · "}
                        {station.access}
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
                Travel times are indicative mock data. Confirm your route before
                booking.
              </p>
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
                  src={TRANSIT_MAP_URL}
                  width={1260}
                />

                {stationGroups.map((station) => {
                  const isActive = activeStationId === station.id;
                  const activeSlideIndex = stationSlideIndexes[station.id] ?? 0;
                  const property = station.properties[activeSlideIndex];

                  if (!property) return null;

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
                              <span>{station.access}</span>
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
              href="https://myrapid.com.my/bus-train/rapid-kl/rapid-kl-integrated-transit-map/"
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
