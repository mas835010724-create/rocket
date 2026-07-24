"use client";

import { useEffect } from "react";
import { analytics } from "@/utils/google-analytics";

export default function GAInitializer() {
  useEffect(() => {
    analytics.navLandingView();
  }, []);

  return null;
}
