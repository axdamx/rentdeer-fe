"use client";

import { Viewer } from "@photo-sphere-viewer/core";
import { EquirectangularVideoAdapter } from "@photo-sphere-viewer/equirectangular-video-adapter";
import { VideoPlugin } from "@photo-sphere-viewer/video-plugin";
import { useEffect, useRef } from "react";

type SphereVideoViewerProps = {
  source: string;
  title: string;
};

export default function SphereVideoViewer({
  source,
  title,
}: SphereVideoViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = new Viewer({
      container: containerRef.current,
      adapter: EquirectangularVideoAdapter.withConfig({
        autoplay: false,
        muted: true,
      }),
      panorama: { source },
      plugins: [
        [
          VideoPlugin,
          {
            bigbutton: true,
            progressbar: true,
          },
        ],
      ],
      caption: `${title} · 360° tour`,
      defaultZoomLvl: 45,
      keyboard: "fullscreen",
      loadingTxt: "Preparing your 360° tour…",
      navbar: [
        "videoPlay",
        "videoVolume",
        "videoTime",
        "zoom",
        "caption",
        "fullscreen",
      ],
    });

    return () => viewer.destroy();
  }, [source, title]);

  return <div className="sphere-video-viewer" ref={containerRef} />;
}
