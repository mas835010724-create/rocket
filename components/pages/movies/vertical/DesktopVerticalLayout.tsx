import PlayerHeader from "../common/PlayerHeader";
import VerticalVideoFeed from "./VerticalVideoFeed";
import VideoInfo from "../common/VideoInfo";
import RecommendedSection from "../common/RecommendedSection";
import { Movie } from "@/services/movieService";

interface DesktopVerticalLayoutProps {
  videoList: Movie[];
  currentVideo: Movie;
  recommendations: Movie[];
  onVideoChange: (video: Movie) => void;
  onLoadMore: () => void;
  cp?: string;
}

export default function DesktopVerticalLayout({
  videoList,
  currentVideo,
  recommendations,
  onVideoChange,
  onLoadMore,
  cp,
}: DesktopVerticalLayoutProps) {
  return (
    <div className="w-full min-h-screen bg-tv-dark overflow-visible flex flex-col relative">
      <div className="relative z-auto">
        <PlayerHeader title={currentVideo.title} cp={cp} />
      </div>

      <div className="w-full h-auto flex-1 flex flex-col xl:flex-row items-start xl:gap-10 px-4 md:px-10 max-w-[1800px] mx-auto">
        <div className="w-full xl:flex-1 min-w-0 flex justify-center xl:block">
          <VerticalVideoFeed
            videos={videoList}
            onVideoChange={onVideoChange}
            onLoadMore={onLoadMore}
          />
        </div>

        <div className="w-full mt-6 xl:mt-0 xl:w-[450px] shrink-0 xl:sticky xl:top-8">
          <VideoInfo
            title={currentVideo.title}
            description={currentVideo.description}
            thumbnail={currentVideo.poster}
            package_description={currentVideo.package_description}
            videoId={currentVideo.id}
            packageId={currentVideo.package_id}
          />
        </div>
      </div>

      <div className="w-full px-10 mt-8 max-w-[1800px] mx-auto">
        <RecommendedSection videos={recommendations} />
      </div>
    </div>
  );
}
