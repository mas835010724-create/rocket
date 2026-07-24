"use client";
import SmartLink from "../../shared/SmartLink";
import Image from "next/image";
import SectionWrapper from "../../shared/SectionWrapper";
import CarouselList from "../../shared/CarouselList";
import { formatViewCount } from "@/utils/formatHelper";

import { Movie } from "@/services/movieService";
interface TrendingNowProps {
  videos: Movie[];
  title?: string;
  viewAllHref?: string;
}

export default function TrendingNow({
  videos,
  title,
  viewAllHref,
}: TrendingNowProps) {
  return (
    <SectionWrapper
      title={title || "Trending now"}
      viewAllHref={viewAllHref || "/movies/all?type=trending"}
      className="ml-2 md:ml-4 lg:ml-10 mr-2 md:mr-4 md:mr-8 lg:mr-10"
    >
      <CarouselList>
        {videos.map((item) => (
          <SmartLink
            key={item.id}
            href={`/movies/${item.id}?type=${item.type || "horizontal"}`}
            draggable={false}
            className="flex-none w-[200px] md:w-[320px] group cursor-pointer select-none"
          >
            <div className="relative aspect-[400/225] w-full overflow-hidden rounded-xl border border-white/10 group-hover:border-2 group-hover:border-white pointer-events-none ">
              <Image
                src={item.poster}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 280px, 320px"
                draggable={false}
                className="object-cover transition-transform duration-500 group-hover:scale-110 "
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
      </CarouselList>
    </SectionWrapper>
  );
}
