"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import { analytics } from "@/utils/google-analytics";

interface SubHeaderProps {
  title: string;
  onBack?: () => void;
}

export default function SubHeader({ title, onBack }: SubHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cp = searchParams.get("cp");

  const handleBack = () => {
    analytics.navBackClick({ from_view: title || "sub_header" });
    if (onBack) {
      onBack();
    } else {
      router.push(cp ? `/?cp=${cp}` : "/");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="bg-tv-dark/95 backdrop-blur-md px-4 py-4 md:py-4 flex items-center gap-2 relative z-10">
        <button
          onClick={handleBack}
          className="p-1 -ml-2 text-gray-300 hover:text-white transition-colors"
        >
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-lg md:text-xl font-bold text-white capitalize truncate">
          {title}
        </h1>
      </div>
      <div
        className="absolute top-full left-0 w-full h-2 bg-gradient-to-b from-tv-dark/95 to-transparent pointer-events-none"
        aria-hidden="true"
      />
    </header>
  );
}
