"use client";

import { toast } from "sonner";

type PendingRequest = {
  id: number;
  message: string;
};

type FeedbackState = {
  pending: PendingRequest[];
};

type FeedbackOptions = {
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
};

let requestId = 0;
let state: FeedbackState = { pending: [] };
const serverState: FeedbackState = { pending: [] };
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function beginRequest(message: string) {
  const id = ++requestId;
  state = { pending: [...state.pending, { id, message }] };
  emit();
  return id;
}

function endRequest(id: number) {
  state = {
    pending: state.pending.filter((request) => request.id !== id),
  };
  emit();
}

export function subscribeToAdminFeedback(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getAdminFeedbackSnapshot() {
  return state;
}

export function getAdminFeedbackServerSnapshot(): FeedbackState {
  return serverState;
}

export function showAdminError(message: string) {
  toast.error(message);
}

export async function withAdminFeedback<T>(
  task: () => Promise<T>,
  options: FeedbackOptions = {},
): Promise<T> {
  const id = beginRequest(options.loadingMessage ?? "Updating RentDeer...");

  try {
    const result = await task();
    if (options.successMessage) toast.success(options.successMessage);
    return result;
  } catch (reason) {
    const detail =
      reason instanceof Error ? reason.message : "Something went wrong.";
    toast.error(options.errorMessage ?? detail, {
      description: options.errorMessage ? detail : undefined,
    });
    throw reason;
  } finally {
    endRequest(id);
  }
}
