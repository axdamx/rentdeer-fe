"use client";

import { Expand, Move3d, Play, X } from "lucide-react";
import { motion } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Listing360TourProps = {
  contactHref: string;
  source: string;
  title: string;
};

const SphereVideoViewer = dynamic(() => import("./sphere-video-viewer"), {
  ssr: false,
  loading: () => (
    <output className="tour-viewer-loading">
      <span />
      Preparing your 360° tour…
    </output>
  ),
});

export default function Listing360Tour({
  contactHref,
  source,
  title,
}: Listing360TourProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        type="button"
        className="listing-tour-trigger"
        onClick={() => setOpen(true)}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="listing-tour-trigger-icon">
          <Move3d aria-hidden="true" />
        </span>
        <span>
          <small>Interactive viewing</small>
          Explore in 360°
        </span>
        <Expand aria-hidden="true" />
      </motion.button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="tour-dialog-content" showCloseButton={false}>
          <div className="tour-dialog-header">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                Drag to look around, scroll to zoom, and press play when ready.
              </DialogDescription>
            </DialogHeader>
            <span className="tour-demo-badge">Mock 360° tour</span>
            <button
              type="button"
              className="tour-dialog-close"
              aria-label="Close 360 degree tour"
              onClick={() => setOpen(false)}
            >
              <X aria-hidden="true" />
            </button>
          </div>

          <div className="tour-viewer-frame">
            {open && <SphereVideoViewer source={source} title={title} />}
            <div className="tour-viewer-instruction">
              <Move3d aria-hidden="true" />
              <span>Click and drag to explore the room</span>
            </div>
          </div>

          <div className="tour-dialog-footer">
            <p>
              This demonstration video will be replaced with the listing&apos;s
              actual room tour when uploaded through the admin portal.
            </p>
            <Link className="rd-yellow-button" href={contactHref}>
              <Play aria-hidden="true" /> Enquire About This Unit
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
