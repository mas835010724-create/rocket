// components/pages/movies/common/RecommendedSection.tsx
"use client";

import SectionWrapper from "@/components/shared/SectionWrapper";
import CarouselList from "@/components/shared/CarouselList";
import MovieCard from "@/components/shared/MovieCard";
import { getAssetPath } from "@/utils/path";
import { Movie } from "@/services/movieService";

interface RecommendedSectionProps {
  videos: Movie[];
}

export default function RecommendedSection({
  videos,
}: RecommendedSectionProps) {
  if (!videos || videos.length === 0) return null;

  return (
    <SectionWrapper
      title="ណែនាំទស្សនា"
      className="mt-2 mb-6 md:mb-2 xl:mb-10"
      icon={getAssetPath("/icon/TopIcon.svg")}
    >
      <CarouselList>
        {videos.map((video) => (
          <MovieCard
            key={video.id}
            item={video}
            hoverEffect="highlight"
            className="block flex-none w-[200px] md:w-[280px] space-y-2 select-none"
          />
        ))}
      </CarouselList>
    </SectionWrapper>
  );
}
