"use client";

import {
  CircleCheck,
  CircleX,
  Info,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      position="top-right"
      richColors
      closeButton
      icons={{
        success: <CircleCheck aria-hidden="true" />,
        error: <CircleX aria-hidden="true" />,
        info: <Info aria-hidden="true" />,
        warning: <TriangleAlert aria-hidden="true" />,
        loading: <LoaderCircle aria-hidden="true" />,
      }}
      toastOptions={{
        classNames: {
          toast: "admin-toast",
          title: "admin-toast-title",
          description: "admin-toast-description",
        },
      }}
      {...props}
    />
  );
}
