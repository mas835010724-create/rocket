"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { analytics } from "@/utils/google-analytics";

const VideoPlayer = dynamic(
  () => import("./horizontal/HorizontalVideoPlayer"),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-video w-full bg-black flex items-center justify-center animate-pulse" />
    ),
  },
);

const VerticalVideoPlayer = dynamic(
  () => import("./vertical/VerticalVideoPlayer"),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-[9/16] w-full bg-black flex items-center justify-center animate-pulse">
        <div className="w-16 h-16 border-4 border-tv-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    ),
  },
);

export default function VideoPlayerWrapper({
  src,
  poster,
  title,
  movieId,
  isVertical,
  trialDuration,
  packageId,
  packageDescription,
  packageName,
}: {
  src: string;
  poster: string;
  title?: string;
  movieId?: string | number;
  isVertical?: boolean;
  trialDuration?: number;
  packageId?: string | number;
  packageDescription?: string;
  packageName?: string;
}) {
  useEffect(() => {
    if (movieId) {
      analytics.navViewVideoDetail({ video_id: movieId, title: title });
    }
  }, [movieId, title]);

  return (
    <div className={`w-full ${isVertical ? "p-0 h-full" : ""}`}>
      {isVertical ? (
        <VerticalVideoPlayer
          src={src}
          poster={poster}
          movieId={movieId || 0}
          title={title}
          packageId={packageId}
          packageDescription={packageDescription}
          packageName={packageName}
        />
      ) : (
        <VideoPlayer
          src={src}
          poster={poster}
          title={title}
          trialDuration={trialDuration}
          videoId={movieId}
          packageId={packageId}
          packageDescription={packageDescription}
          packageName={packageName}
        />
      )}
    </div>
  );
}
