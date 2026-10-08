"use client";

import { useQuery } from "@tanstack/react-query";
import AutoScroll from "embla-carousel-auto-scroll";
import { ArrowLeft, ArrowRight, MapPin, Pause, Play } from "lucide-react";
import { useReducedMotion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { apiRequest } from "@/lib/api-client";
import type { LocalAreasResponse } from "@/lib/local-areas";

export default function LocalAreasSection() {
  const { data, isError, refetch } = useQuery({
    queryKey: ["homepage", "areas"],
    queryFn: () => apiRequest<LocalAreasResponse>("/api/homepage/areas"),
    staleTime: 30_000,
  });
  const reducedMotion = useReducedMotion();
  const [api, setApi] = useState<CarouselApi>();
  const [paused, setPaused] = useState(false);
  const autoScroll = useMemo(
    () =>
      AutoScroll({
        speed: 0.65,
        startDelay: 800,
        playOnInit: false,
        stopOnInteraction: true,
        stopOnMouseEnter: false,
        stopOnFocusIn: false,
      }),
    [],
  );
  useEffect(() => {
    if (!api) return;
    let resumeFrame = 0;
    const sync = () => {
      const plugin = api.plugins().autoScroll;
      if (!plugin) return;
      const node = api.rootNode();
      if (
        !api.internalEngine().options.loop ||
        paused ||
        reducedMotion !== false ||
        node.matches(":hover") ||
        node.contains(document.activeElement)
      )
        plugin.stop();
      else plugin.play();
    };
    const node = api.rootNode();
    const resume = () => {
      cancelAnimationFrame(resumeFrame);
      resumeFrame = requestAnimationFrame(sync);
    };
    const stop = () => api.plugins().autoScroll?.stop();
    node.addEventListener("mouseenter", stop);
    node.addEventListener("focusin", stop);
    node.addEventListener("mouseleave", sync);
    node.addEventListener("focusout", resume);
    api.on("pointerUp", resume);
    api.on("reInit", sync);
    sync();
    return () => {
      node.removeEventListener("mouseenter", stop);
      node.removeEventListener("focusin", stop);
      node.removeEventListener("mouseleave", sync);
      node.removeEventListener("focusout", resume);
      api.off("pointerUp", resume);
      api.off("reInit", sync);
      cancelAnimationFrame(resumeFrame);
      stop();
    };
  }, [api, paused, reducedMotion]);

  if (data && (!data.enabled || !data.data.length)) return null;
  return (
    <section
      className="rd-areas-section rd-local-areas"
      id="properties"
      aria-labelledby="local-areas-heading"
    >
      <div className="rd-container">
        <div className="rd-section-heading rd-section-heading-light">
          <span className="rd-script-label">
            {data?.eyebrow ?? "RentDeer in your area"}
          </span>
          <h2 id="local-areas-heading">
            {data?.heading ?? "Serving your local area."}
          </h2>
          <p>
            {data?.description ??
              "Explore managed rooms and homes close to the places that matter to you."}
          </p>
        </div>
        {isError ? (
          <output className="rd-area-status">
            Unable to load local areas.{" "}
            <Button onClick={() => refetch()} variant="outline">
              Try again
            </Button>
          </output>
        ) : !data ? (
          <div className="rd-area-skeleton" aria-hidden="true" />
        ) : (
          <>
            <Carousel
              opts={{
                loop: data.data.length > 3,
                align: "start",
                dragFree: true,
              }}
              plugins={[autoScroll]}
              setApi={setApi}
              className="rd-area-marquee"
              aria-label="Browse local areas"
            >
              <CarouselContent className="rd-area-track">
                {data.data.map((area) => (
                  <CarouselItem key={area.key} className="rd-area-slide">
                    <Link
                      className={`rd-area-card rd-local-area-card${area.image ? "" : " rd-area-placeholder"}`}
                      href={`/properties?area=${area.key}`}
                      aria-label={`View properties in ${area.name}, ${area.region}`}
                    >
                      {area.image ? (
                        <Image
                          src={area.image}
                          alt={area.imageAlt}
                          fill
                          sizes="(max-width: 700px) 80vw, (max-width: 1024px) 45vw, 33vw"
                        />
                      ) : (
                        <MapPin
                          className="rd-area-map-pin"
                          aria-hidden="true"
                        />
                      )}
                      <div>
                        <span>{area.region}</span>
                        <strong>{area.name}</strong>
                      </div>
                      <ArrowRight
                        className="rd-area-link-arrow"
                        aria-hidden="true"
                      />
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <div className="rd-area-toolbar">
              <p>
                We are committed to creating comfortable, convenient, and
                well-connected spaces that enhance everyday living. Every space
                is thoughtfully designed with people and their needs in mind
              </p>
              <div className="rd-area-actions">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Previous area"
                  onClick={() => api?.scrollPrev()}
                >
                  <ArrowLeft />
                </Button>
                {!reducedMotion && data.data.length > 3 && (
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label={
                      paused ? "Play area scrolling" : "Pause area scrolling"
                    }
                    aria-pressed={paused}
                    onClick={() => setPaused((value) => !value)}
                  >
                    {paused ? <Play /> : <Pause />}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Next area"
                  onClick={() => api?.scrollNext()}
                >
                  <ArrowRight />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
