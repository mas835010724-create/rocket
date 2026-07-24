"use client";
import { useState, useRef, useEffect, useMemo } from "react";
import { formatViewCount } from "@/utils/formatHelper";
import SmartLink from "../../shared/SmartLink";
import Image from "next/image";
import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";
import { analytics } from "@/utils/google-analytics";

import SectionWrapper from "../../shared/SectionWrapper";
import GridList from "../../shared/GridList";
import CarouselList from "../../shared/CarouselList";
import { Movie } from "@/services/movieService";

interface DiscoverSectionProps {
  videos: Movie[];
  title?: string;
  viewAllHref?: string;
  categories?: { id: string; title: string }[];
}

export default function DiscoverSection({
  videos = [],
  title,
  viewAllHref,
  categories = [],
}: DiscoverSectionProps) {
  // Use passed categories if available, otherwise fallback to deriving from videos
  const categoryList = useMemo(() => {
    if (categories.length > 0) {
      return categories;
    }
    const uniqueNames = Array.from(
      new Set(
        videos
          .map((v) => v.category)
          .filter((c): c is string => !!c && c.trim() !== ""),
      ),
    );
    // Create mock category objects for fallback
    return uniqueNames.map((name, index) => ({
      id: `generated-${index}`,
      title: name,
    }));
  }, [videos, categories]);

  const [activeCategoryId, setActiveCategoryId] = useState(
    categoryList[0]?.id || "",
  );
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If activeCategoryId is not in the current list (e.g. data changed), reset it
    if (categoryList.length > 0) {
      const exists = categoryList.some(
        (c) => c.id.toString() === activeCategoryId.toString(),
      );
      if (!exists) {
        setActiveCategoryId(categoryList[0].id);
      }
    }
  }, [categoryList, activeCategoryId]);

  const filteredVideos = useMemo(() => {
    // Find the active category object
    const activeCat = categoryList.find(
      (c) => c.id.toString() === activeCategoryId.toString(),
    );
    if (!activeCat) return [];

    // If categories were generated from names, filter by name
    if (activeCat.id.startsWith("generated-")) {
      return videos.filter((v) => v.category === activeCat.title);
    }

    // Otherwise filter by ID (loose comparison)
    return videos.filter(
      (v) => v.cateId?.toString() === activeCat.id.toString(),
    );
  }, [videos, activeCategoryId, categoryList]);

  return (
    <div className="mx-2 md:mx-4 lg:mx-10">
      <div className="hidden md:block" ref={sectionRef}>
        <SectionWrapper
          title={title || "Explore other topics"}
          viewAllHref={`/movies/all?type=${encodeURIComponent(categoryList.find((c) => c.id === activeCategoryId)?.title || "discover")}&cate_id=${activeCategoryId}`}
        >
          <div className="flex flex-wrap items-center gap-3 mb-6">
            {categoryList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategoryId(cat.id);
                }}
                className={`px-3 py-1 rounded-lg text-sm transition-all ${
                  activeCategoryId.toString() === cat.id.toString()
                    ? "bg-white text-black"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {cat.title}
              </button>
            ))}
          </div>

          <div>
            <div>
              <GridList>
                {filteredVideos.map((item, index) => (
                  <div
                    key={item.id}
                    className="animate-fadeUp relative z-10 hover:z-50"
                    style={{ animationDelay: `${(index % 4) * 50}ms` }}
                  >
                    <VideoCard item={item} />
                  </div>
                ))}
              </GridList>
            </div>
          </div>
        </SectionWrapper>
      </div>
      <div className="md:hidden flex flex-col gap-5 md:gap-8">
        {categoryList.map((cat) => {
          let catVideos: Movie[] = [];

          if (cat.id.toString().startsWith("generated-")) {
            catVideos = videos.filter((v) => v.category === cat.title);
          } else {
            catVideos = videos.filter(
              (v) => v.cateId?.toString() === cat.id.toString(),
            );
          }

          if (catVideos.length === 0) return null;

          return (
            <SectionWrapper
              key={cat.id}
              title={cat.title}
              viewAllHref={`/movies/all?type=${encodeURIComponent(cat.title)}&cate_id=${cat.id}`}
            >
              <CarouselList>
                {catVideos.map((item) => (
                  <div key={item.id} className="w-[280px] flex-none">
                    <VideoCard item={item} />
                  </div>
                ))}
              </CarouselList>
            </SectionWrapper>
          );
        })}
      </div>
    </div>
  );
}

function VideoCard({ item }: { item: Movie }) {
  return (
    <SmartLink
      href={`/movies/${item.id}?type=${item.type || "horizontal"}`}
      className="flex flex-col group cursor-pointer relative z-10 hover:z-20"
    >
      <div className="relative aspect-[400/225] w-full overflow-hidden rounded-lg border border-white/5 bg-gray-900 transition-all duration-300 ease-out group-hover:scale-[1.15] group-hover:border-[3px] group-hover:border-white group-hover:shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <Image
          src={item.poster}
          alt={item.title}
          fill
          sizes="(max-width: 768px) 50vw, 400px"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-0.5 pt-2">
        <h3 className="text-[15px] md:text-[16px] font-bold text-white leading-snug line-clamp-2 group-hover:text-white transition-colors">
          {item.title}
        </h3>
        <p className="text-[12px] text-[#B7B7B7]">
          {item.views
            ? `ចំនួនទស្សនា ${formatViewCount(item.views)} ដង`
            : "0 មើល"}
        </p>
      </div>
    </SmartLink>
  );
}
