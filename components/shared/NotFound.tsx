"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getAssetPath } from "@/utils/path";

interface NotFoundProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  showHomeButton?: boolean;
}

export default function NotFound({
  title = "រកមិនឃើញទំព័រ",
  description = "សូមអភ័យទោស ទំព័រដែលអ្នកកំពុងស្វែងរកមិនមានទេ។\nវាអាចត្រូវបានលុបចេញ ឬ URL មិនត្រឹមត្រូវ។",
  icon,
  showHomeButton = true,
}: NotFoundProps) {
  return (
    <div className="min-h-[60vh] md:min-h-[70vh] w-full flex flex-col items-center justify-center p-4 text-center">
      <div className="relative mb-6 md:mb-8">
        {/* Placeholder Icon with glow effect */}
        <div className="relative z-10">
          {icon || (
            <div className="relative w-[280px] h-[150px] md:w-[400px] md:h-[220px]">
              <Image
                src={getAssetPath("/icon/noData.svg")}
                alt="No Data"
                fill
                className="object-contain drop-shadow-[0_0_25px_rgba(227,6,19,0.3)]"
                priority
              />
            </div>
          )}
        </div>

        {/* Background glow element mimicking the UFO light based on design vibe */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-tv-red/10 rounded-full blur-3xl -z-0"></div>
      </div>

      {/* Removed "404" text as it's likely part of the illustration */}

      <h2 className="text-white text-2xl md:text-3xl font-bold mb-3">
        {title}
      </h2>

      <p className="text-[#888888] text-sm md:text-base leading-relaxed whitespace-pre-line max-w-lg mx-auto mb-8">
        {description}
      </p>

      {showHomeButton && (
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-tv-red hover:bg-[#c40510] text-white font-bold rounded-md transition-colors shadow-lg"
        >
          ត្រឡប់ទៅទំព័រដើម
        </Link>
      )}
    </div>
  );
}
