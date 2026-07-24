"use client";
import { useState, useEffect } from "react";
import { Movie } from "@/services/movieService";
import { useVerticalFeedLogic } from "./hooks/useVerticalFeedLogic";
import MobileVerticalLayout from "./MobileVerticalLayout";
import DesktopVerticalLayout from "./DesktopVerticalLayout";

interface VerticalMovieLayoutProps {
  initialMovie: Movie;
  feedVideos: Movie[];
  recommendations: Movie[];
  cp?: string;
}

export default function VerticalMovieLayout({
  initialMovie,
  feedVideos,
  recommendations,
  cp,
}: VerticalMovieLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Treat tablets (>=768px) as "Desktop" layout (Stacked or Split)
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { videoList, currentVideo, handleVideoChange, handleLoadMore } =
    useVerticalFeedLogic(initialMovie, feedVideos);

  if (!isMounted) return null; // Prevent hydration mismatch / flash of wrong layout

  if (isMobile) {
    return (
      <MobileVerticalLayout
        videoList={videoList}
        currentVideo={currentVideo}
        onVideoChange={handleVideoChange}
        onLoadMore={handleLoadMore}
        cp={cp}
      />
    );
  }

  return (
    <DesktopVerticalLayout
      videoList={videoList}
      currentVideo={currentVideo}
      recommendations={recommendations}
      onVideoChange={handleVideoChange}
      onLoadMore={handleLoadMore}
      cp={cp}
    />
  );
}
