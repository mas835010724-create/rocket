"use client";
import { useState, useRef, useEffect } from "react";
import GridList from "./GridList";
import MovieCard from "./MovieCard";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Movie } from "@/services/movieService";

interface ExpandableMovieGridProps {
  videos: Movie[];
  className?: string;
}

const getInitialVisibleCount = () => {
  if (typeof window === "undefined") return 10;
  const width = window.innerWidth;
  if (width >= 1024) return 10;
  if (width >= 768) return 6;
  return 4;
};

const getColumnsCount = () => {
  if (typeof window === "undefined") return 5;
  const width = window.innerWidth;
  if (width >= 1280) return 5;
  if (width >= 1024) return 4;
  if (width >= 768) return 3;
  return 2;
};

export default function ExpandableMovieGrid({
  videos,
  className,
}: ExpandableMovieGridProps) {
  const [displayedVideos, setDisplayedVideos] = useState<Movie[]>(videos);
  const [visibleCount, setVisibleCount] = useState(10);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const hasMoreVideos = visibleCount < displayedVideos.length;
  const shouldShowButtons = hasMoreVideos || isExpanded;

  useEffect(() => {
    setVisibleCount(getInitialVisibleCount());
  }, []);

  useEffect(() => {
    setDisplayedVideos(videos);
  }, [videos]);

  useEffect(() => {
    if (!isExpanded && !isAnimating && containerRef.current) {
      containerRef.current.style.height = "";
      containerRef.current.style.transition = "";
      containerRef.current.style.overflow = "";
    }
  }, [isExpanded, isAnimating]);

  const handleLoadMore = () => {
    const cols = getColumnsCount();
    const increment = cols * 2;
    setVisibleCount((prev) =>
      Math.min(prev + increment, displayedVideos.length),
    );
    setIsExpanded(true);
  };

  const handleCollapse = () => {
    if (!containerRef.current || !listRef.current || isAnimating) {
      setVisibleCount(getInitialVisibleCount());
      setIsExpanded(false);
      return;
    }

    setIsAnimating(true);

    const startScroll = window.scrollY;

    const containerTop =
      containerRef.current.getBoundingClientRect().top + window.scrollY;

    const targetScroll = containerTop - 150;
    const scrollDistance = targetScroll - startScroll;

    const startHeight = containerRef.current.scrollHeight;

    let targetHeight = 500;
    const items = listRef.current.querySelectorAll("a");

    let targetIndex = 3;
    if (window.innerWidth >= 1280) targetIndex = 9;
    else if (window.innerWidth >= 1024) targetIndex = 7;
    else if (window.innerWidth >= 768) targetIndex = 5;

    if (items.length > targetIndex) {
      const lastItem = items[targetIndex];
      const containerRect = containerRef.current.getBoundingClientRect();
      const itemRect = lastItem.getBoundingClientRect();
      targetHeight = itemRect.bottom - containerRect.top + 8;
    }

    const heightDistance = targetHeight - startHeight;
    const duration = 600;
    let startTime: number | null = null;

    containerRef.current.style.height = `${startHeight}px`;
    containerRef.current.style.overflow = "hidden";
    containerRef.current.offsetHeight;

    function animation(currentTime: number) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      const ease = 1 - Math.pow(1 - progress, 3);

      if (scrollDistance < 0) {
        window.scrollTo(0, startScroll + scrollDistance * ease);
      }

      if (containerRef.current) {
        containerRef.current.style.height = `${startHeight + heightDistance * ease}px`;
      }

      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      } else {
        if (containerRef.current) {
          containerRef.current.style.height = `${targetHeight}px`;
        }
        setVisibleCount(getInitialVisibleCount());
        setIsExpanded(false);
        setIsAnimating(false);
      }
    }
    requestAnimationFrame(animation);
  };

  return (
    <div className={className}>
      <div ref={containerRef} className="transition-height">
        <div ref={listRef}>
          <GridList>
            {displayedVideos.slice(0, visibleCount).map((item, index) => {
              let responsiveClass = "flex";
              if (!isExpanded) {
                if (index >= 4 && index < 6) responsiveClass = "hidden md:flex";
                else if (index >= 6 && index < 8)
                  responsiveClass = "hidden lg:flex";
                else if (index >= 8) responsiveClass = "hidden xl:flex";
              }

              return (
                <MovieCard
                  key={item.id}
                  item={item}
                  index={index}
                  className={responsiveClass}
                  hoverEffect="scale"
                />
              );
            })}
          </GridList>
        </div>
      </div>
      {shouldShowButtons && (
        <div className="mt-4 md:mt-8 mb-2 flex justify-center items-center relative h-10">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 border hidden md:block w-full border-white/20 h-[0.1px]"></div>

          {hasMoreVideos ? (
            <button
              onClick={handleLoadMore}
              disabled={isAnimating}
              className="flex items-center z-2 justify-center gap-2 w-[160px] md:w-[400px] px-6 py-2 rounded-full border-2 border-white/20 bg-tv-dark text-gray-400 hover:text-white text-[15px] font-medium transition-all active:scale-95"
            >
              មើលបន្ថែម
              <ChevronDown className="w-4 h-4 transition-transform" />
            </button>
          ) : (
            <button
              onClick={handleCollapse}
              disabled={isAnimating}
              className="flex items-center z-2 justify-center gap-2 w-[160px] md:w-[400px] px-6 py-2 rounded-full border-2 border-white/20 bg-tv-dark text-gray-400 hover:text-white text-[15px] font-medium transition-all active:scale-95"
            >
              {isAnimating ? "កំពុងបង្រួម..." : "តិចជាង"}
              <ChevronUp className="w-4 h-4 transition-transform" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
