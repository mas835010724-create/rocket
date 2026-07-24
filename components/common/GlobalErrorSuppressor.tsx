"use client";

import { useEffect } from "react";

export default function GlobalErrorSuppressor() {
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      // Suppress "provider destroyed" error from Vidstack
      // This error often happens on unmount when async tasks are pending
      if (
        typeof event.reason === "string" &&
        event.reason.includes("provider destroyed")
      ) {
        event.preventDefault();
        console.debug('Suppressed "provider destroyed" error');
      } else if (
        event.reason instanceof Error &&
        event.reason.message.includes("provider destroyed")
      ) {
        event.preventDefault();
        console.debug('Suppressed "provider destroyed" error');
      }
    };

    window.addEventListener("unhandledrejection", handler);
    return () => window.removeEventListener("unhandledrejection", handler);
  }, []);

  return null;
}
