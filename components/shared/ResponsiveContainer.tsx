"use client";

import React from "react";
import { useIsMobile } from "@/hooks/useIsMobile";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string; }

export default function ResponsiveContainer({ children, className = "" }: ResponsiveContainerProps) {
  const isMobile = useIsMobile(1024);

    const desktopClasses = !isMobile ? "w-auto rounded-xl" : "w-full md:rounded-xl";

  return (
    <div className={`relative overflow-hidden ${desktopClasses} ${className}`}>
      {children}
    </div>
  );
}
