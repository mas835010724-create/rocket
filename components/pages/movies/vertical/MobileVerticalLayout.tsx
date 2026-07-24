import PlayerHeader from "../common/PlayerHeader";
import VerticalVideoFeed from "./VerticalVideoFeed";
import { Movie } from "@/services/movieService";

interface MobileVerticalLayoutProps {
  videoList: Movie[];
  currentVideo: Movie;
  onVideoChange: (video: Movie) => void;
  onLoadMore: () => void;
  cp?: string;
}

export default function MobileVerticalLayout({
  videoList,
  currentVideo,
  onVideoChange,
  onLoadMore,
  cp,
}: MobileVerticalLayoutProps) {
  return (
    <div className="w-full h-[100dvh] bg-black overflow-hidden flex flex-col relative">
      <div className="absolute top-0 left-0 w-full z-[60]">
        <PlayerHeader title={currentVideo.title} cp={cp} />
      </div>

      <div className="w-full flex-1 flex flex-col min-h-0">
        <VerticalVideoFeed
          videos={videoList}
          onVideoChange={onVideoChange}
          onLoadMore={onLoadMore}
        />
      </div>
    </div>
  );
}
