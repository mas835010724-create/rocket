import SectionWrapper from "@/components/shared/SectionWrapper";
import { getAssetPath } from "@/utils/path";
import ExpandableMovieGrid from "../../shared/ExpandableMovieGrid";

import { Movie } from "@/services/movieService";

interface TopVideoSectionProps {
  videos: Movie[];
  title?: string;
  viewAllHref?: string;
}

export default function TopVideoSection({
  videos,
  title,
  viewAllHref,
}: TopVideoSectionProps) {
  return (
    <div>
      <SectionWrapper
        title={title || "Top Video"}
        viewAllHref={viewAllHref}
        icon={getAssetPath("/icon/TopIcon.svg")}
        className="mx-2 md:mx-4 lg:mx-10"
      >
        <ExpandableMovieGrid videos={videos} />
      </SectionWrapper>
    </div>
  );
}
