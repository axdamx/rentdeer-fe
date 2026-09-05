"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import Lightbox from "yet-another-react-lightbox";

const MAX_GALLERY_IMAGES = 5;

type PropertyGalleryProps = {
  alt: string;
  className?: string;
  images: string[];
  label?: string;
  priority?: boolean;
};

function cloneImages(images: string[]) {
  const sourceImages = images.filter(Boolean).slice(0, MAX_GALLERY_IMAGES);

  if (sourceImages.length === 0) {
    return [];
  }

  return Array.from(
    { length: MAX_GALLERY_IMAGES },
    (_, index) => sourceImages[index % sourceImages.length],
  );
}

export default function PropertyGallery({
  alt,
  className,
  images,
  label,
  priority = false,
}: PropertyGalleryProps) {
  const galleryImages = useMemo(() => cloneImages(images), [images]);
  const slides = useMemo(
    () =>
      galleryImages.map((src, index) => ({
        alt: `${alt} image ${index + 1}`,
        src,
      })),
    [alt, galleryImages],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (slides.length === 0) {
    return null;
  }

  const showPrevious = () => {
    setActiveIndex((index) => (index === 0 ? slides.length - 1 : index - 1));
  };
  const showNext = () => {
    setActiveIndex((index) => (index + 1) % slides.length);
  };

  return (
    <div
      className={
        className ? `property-gallery ${className}` : "property-gallery"
      }
    >
      <button
        type="button"
        className="property-gallery-trigger"
        aria-label={`Open ${alt} image ${activeIndex + 1} in fullscreen`}
        onClick={() => setLightboxOpen(true)}
      >
        <Image
          src={slides[activeIndex].src}
          alt={slides[activeIndex].alt}
          fill
          priority={priority}
          sizes="(max-width: 700px) 100vw, 55vw"
        />
      </button>
      {label && <span className="property-gallery-label">{label}</span>}
      <div className="property-gallery-controls">
        <button
          type="button"
          onClick={showPrevious}
          aria-label="Previous property image"
        >
          <span aria-hidden="true">←</span>
        </button>
        <span aria-live="polite">
          {activeIndex + 1} / {slides.length}
        </span>
        <button
          type="button"
          onClick={showNext}
          aria-label="Next property image"
        >
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={activeIndex}
        slides={slides}
        on={{ view: ({ index }) => setActiveIndex(index) }}
      />
    </div>
  );
}
