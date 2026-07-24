"use client";
import Image from "next/image";
import SmartLink from "../../shared/SmartLink";
import SectionWrapper from "../../shared/SectionWrapper";
import GridList from "../../shared/GridList";

import { Movie } from "@/services/movieService";

interface ShortVideoSectionProps {
  videos: Movie[];
  viewAllHref?: string;
}

export default function ShortVideoSection({
  videos,
  viewAllHref,
}: ShortVideoSectionProps) {
  return (
    <SectionWrapper
      title="Short Video"
      viewAllHref={viewAllHref}
      className="mx-2 md:mx-4 lg:mx-10"
    >
      <GridList className="grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {videos.map((item) => (
          <SmartLink
            key={item.id}
            href={`/movies/${item.id}?type=${item.type || "vertical"}`}
            className="relative group cursor-pointer overflow-hidden rounded-xl aspect-[9/16] border border-white/5 block"
          >
            <Image
              src={item.poster}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 50vw, 200px"
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />

            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />

            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 z-20 flex flex-col gap-1">
              <h3 className="text-white text-[16px] md:text-[18px] font-bold leading-snug line-clamp-2 drop-shadow-md group-hover:text-tv-red transition-colors">
                {item.title}
              </h3>
            </div>
          </SmartLink>
        ))}
      </GridList>
    </SectionWrapper>
  );
}
