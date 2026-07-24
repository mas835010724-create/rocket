"use client";

import { useState, useEffect } from "react";
import { isMobile, isTablet } from "react-device-detect";

export function useIsMobile(customBreakpoint: number = 0) {
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      const libraryCheck = isMobile || isTablet;

      const userAgent =
        typeof navigator === "undefined" ? "" : navigator.userAgent;
      const isIPad =
        /iPad/.test(userAgent) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
        (/Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1);

      const isSmallScreen =
        customBreakpoint > 0 && window.innerWidth < customBreakpoint;

      setIsMobileDevice(libraryCheck || isIPad || isSmallScreen);
    };

    checkIsMobile();

    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, [customBreakpoint]);

  return isMobileDevice;
}
