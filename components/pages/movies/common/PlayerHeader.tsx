"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import { analytics } from "@/utils/google-analytics";

export default function PlayerHeader({ title, cp }: { title: string; cp?: string }) {
  const router = useRouter();

  return (
    <header className="sm:sticky md:relative top-0 z-50 w-full">
      <div className="flex items-center gap-3 py-2 bg-gradient-to-b from-black/60 to-transparent text-white px-4 md:px-10 lg:px-10 lg:max-w-[1800px] lg:mx-auto">
        <button
          onClick={() => {
            analytics.navBackClick({ from_view: "player_header" });
            router.push(cp ? `/?cp=${cp}` : "/");
          }}
          className="p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-lg font-bold truncate">{title}</h1>
      </div>
    </header>
  );
}
