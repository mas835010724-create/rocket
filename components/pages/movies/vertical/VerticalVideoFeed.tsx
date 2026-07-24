"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import VerticalVideoPlayer from "./VerticalVideoPlayer";
import { Movie } from "@/services/movieService";

import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from "swiper";

import "swiper/css";

interface VerticalVideoFeedProps {
  videos: Movie[];
  initialIndex?: number;
  onVideoChange?: (video: Movie) => void;
  onLoadMore?: () => void;
}

export default function VerticalVideoFeed({
  videos,
  initialIndex = 0,
  onVideoChange,
  onLoadMore,
}: VerticalVideoFeedProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const lastNotifiedId = useRef<string | number | null>(null);

  useEffect(() => {
    const currentVideo = videos[activeIndex];
    if (
      onVideoChange &&
      currentVideo &&
      currentVideo.id !== lastNotifiedId.current
    ) {
      lastNotifiedId.current = currentVideo.id;
      onVideoChange(currentVideo);
    }
  }, [activeIndex, onVideoChange, videos]);

  const handleSlideChange = (swiper: SwiperType) => {
    setActiveIndex(swiper.realIndex);
  };

  const handleScrollTo = (direction: "up" | "down") => {
    if (!swiperRef.current) return;

    if (direction === "down") {
      swiperRef.current.slideNext();
    } else {
      swiperRef.current.slidePrev();
    }
  };

  return (
    <div
      className={`relative w-full overflow-hidden bg-black flex justify-center ${!isMobile ? "md:h-[60vh] xl:h-[85vh] flex-none" : "flex-1 min-h-0"}`}
    >
      <div
        className={`h-full w-full ${!isMobile ? "max-w-[400px] lg:max-w-[450px]" : ""}`}
      >
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;

            if (initialIndex > 0) swiper.slideToLoop(initialIndex, 0);
          }}
          direction={"vertical"}
          slidesPerView={1}
          spaceBetween={0}
          mousewheel={false}
          loop={true}
          roundLengths={true}
          observer={true}
          observeParents={true}
          observeSlideChildren={false}
          watchSlidesProgress={true}
          onSlideChange={handleSlideChange}
          onReachEnd={() => {
            if (onLoadMore) onLoadMore();
          }}
          className="w-full h-full"
        >
          {videos.map((video) => (
            <SwiperSlide
              key={video.id}
              className="w-full h-full bg-black overflow-hidden"
            >
              {({ isActive }) => (
                <VerticalVideoPlayer
                  src={video.src}
                  poster={video.poster}
                  movieId={video.id}
                  autoplay={isActive}
                  title={video.title}
                  description={video.description}
                  packageDescription={video.package_description}
                  packageId={video.package_id}
                  packageName={video.package_name}
                />
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {!isMobile && (
        <div className="flex flex-col gap-4 absolute right-[10%] lg:right-[20%] top-1/2 -translate-y-1/2 z-50">
          <button
            onClick={() => handleScrollTo("up")}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all group active:scale-95"
          >
            <ChevronUp className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>

          <button
            onClick={() => handleScrollTo("down")}
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all group active:scale-95"
          >
            <ChevronDown className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
