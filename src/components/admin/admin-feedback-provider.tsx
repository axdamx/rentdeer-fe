"use client";

import { LoaderCircle } from "lucide-react";
import { type ReactNode, useSyncExternalStore } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import {
  getAdminFeedbackServerSnapshot,
  getAdminFeedbackSnapshot,
  subscribeToAdminFeedback,
} from "@/lib/admin-feedback";

export default function AdminFeedbackProvider({
  children,
}: {
  children: ReactNode;
}) {
  const feedback = useSyncExternalStore(
    subscribeToAdminFeedback,
    getAdminFeedbackSnapshot,
    getAdminFeedbackServerSnapshot,
  );
  const activeRequest = feedback.pending.at(-1);

  return (
    <>
      {children}
      <Dialog open={feedback.pending.length > 0} onOpenChange={() => undefined}>
        <DialogContent className="admin-loading-dialog" showCloseButton={false}>
          <LoaderCircle className="admin-loading-spinner" aria-hidden="true" />
          <DialogHeader>
            <DialogTitle>
              {activeRequest?.message ?? "Please wait..."}
            </DialogTitle>
            <DialogDescription>
              Please keep this page open while the request is completed.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Toaster />
    </>
  );
}
