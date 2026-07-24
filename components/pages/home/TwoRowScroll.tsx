"use client";
import SmartLink from "../../shared/SmartLink";
import Image from "next/image";
import SectionWrapper from "../../shared/SectionWrapper";
import CarouselList from "../../shared/CarouselList";
import { formatViewCount } from "@/utils/formatHelper";
import { Movie } from "@/services/movieService";

interface TwoRowScrollProps {
  videos: Movie[];
  title?: string;
  viewAllHref?: string;
}

export default function TwoRowScroll({
  videos,
  title,
  viewAllHref,
}: TwoRowScrollProps) {
  // 1. Grouping logic: Divide videos into sub-arrays, each containing up to 2 items (columns)
  const chunkedVideos = [];
  for (let i = 0; i < videos.length; i += 2) {
    chunkedVideos.push(videos.slice(i, i + 2));
  }

  return (
    <SectionWrapper
      title={title || "Trending now"}
      viewAllHref={viewAllHref || "/movies/all?type=trending"}
      className="ml-2 md:ml-4 lg:ml-10 mr-2 md:mr-4 md:mr-8 lg:mr-10"
    >
      <CarouselList>
        {/* 2. Map through chunked list (Each item is a COLUMN containing 2 videos) */}
        {chunkedVideos.map((pair, index) => (
          <div
            key={index}
            // Responsive width
            className="flex-none w-[70vw] sm:w-[45vw] md:w-[30vw] lg:w-[20vw] flex flex-col gap-y-2 select-none"
          >
            {/* 3. Map videos inside the column */}
            {pair.map((item) => (
              <SmartLink
                key={item.id}
                href={`/movies/${item.id}?type=${item.type || "horizontal"}`}
                draggable={false}
                className="group cursor-pointer block"
              >
                <div className="relative aspect-[400/225] w-full overflow-hidden rounded-xl border border-white/10 group-hover:border-2 group-hover:border-white pointer-events-none">
                  <Image
                    src={item.poster}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    draggable={false}
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="pt-2 flex flex-col gap-0.5">
                  <h3 className="text-[15px] md:text-[16px] text-white line-clamp-2 leading-snug group-hover:text-white transition-colors font-bold">
                    {item.title}
                  </h3>
                  <p className="text-[12px] text-[#B7B7B7]">
                    ចំនួនទស្សនា {formatViewCount(item.views)} ដង
                  </p>
                </div>
              </SmartLink>
            ))}
          </div>
        ))}
      </CarouselList>
    </SectionWrapper>
  );
}
