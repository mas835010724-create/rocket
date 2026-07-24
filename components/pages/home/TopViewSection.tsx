"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import SmartLink from "../../shared/SmartLink";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SectionTitle from "../../shared/SectionTitle";
import { Movie } from "@/services/movieService";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";
import { getAssetPath } from "@/utils/path";
import { formatViewCount } from "@/utils/formatHelper";
import { analytics } from "@/utils/google-analytics";

interface TopViewSectionProps {
  videos?: Movie[];
  title?: string;
  viewAllHref?: string;
}

export default function TopViewSection({
  videos = [],
  title,
  viewAllHref,
}: TopViewSectionProps) {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const {
    ref: scrollRef,
    events,
    isDragging,
    wasDragged,
  } = useDraggableScroll();

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 10);
    }
  }, [scrollRef]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      checkScroll();
      el.addEventListener("scroll", checkScroll, { passive: true });
      window.addEventListener("resize", checkScroll);
      return () => {
        el.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [checkScroll, videos, scrollRef]);

  /**
   * Adjust Animation: Slower, smoother and stops exactly at the margin
   */
  const smoothScrollTo = (target: number) => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const start = el.scrollLeft;
    const roundedTarget = Math.round(target);
    const change = roundedTarget - start;
    const duration = 900; // Increased to 900ms for smoother pagination
    let startTime: number | null = null;

    // Vô hiệu hóa Snap để JS kiểm soát hoàn toàn tọa độ dừng
    // el.style.scrollSnapType = 'none';
    el.style.scrollBehavior = "auto";

    function animate(currentTime: number) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);

      // Easing: Cubic Ease-In-Out cho cảm giác mượt mà
      const ease =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      el.scrollLeft = start + change * ease;

      if (timeElapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        el.scrollLeft = roundedTarget;
        // Khôi phục trạng thái ban đầu sau khi đã dừng đúng lề
        setTimeout(() => {
          if (el) {
            // el.style.scrollSnapType = '';
            el.style.scrollBehavior = "";
            checkScroll();
          }
        }, 30);
      }
    }
    requestAnimationFrame(animate);
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const children = Array.from(container.children).filter(
        (c) => c.tagName === "A",
      ) as HTMLElement[];
      if (children.length === 0) return;

      const currentScroll = container.scrollLeft;
      let targetIndex = 0;

      if (direction === "right") {
        // Find the next column based on the element's left margin
        const nextItem = children.find(
          (child) => child.offsetLeft > currentScroll + 30,
        );
        targetIndex = nextItem
          ? children.indexOf(nextItem)
          : children.length - 1;
      } else {
        // Find the previous column
        const prevItem = [...children]
          .reverse()
          .find((child) => child.offsetLeft < currentScroll - 30);
        targetIndex = prevItem ? children.indexOf(prevItem) : 0;
      }

      // Pagination jumps to exactly offsetLeft but subtracts a gap (padding) so it's not flush against the edge
      smoothScrollTo(Math.max(0, children[targetIndex].offsetLeft - 10));
    }
  };

  if (!videos || videos.length === 0) return null;
  const featuredVideo = videos[0];

  const getRankStyle = (rank: number) => {
    if (rank === 1)
      return {
        background: "linear-gradient(300.83deg, #A1041E 8.83%, #FF8C3A 88.61%)",
      };
    if (rank === 2)
      return {
        background: "linear-gradient(300.83deg, #4680FF 8.83%, #6459E1 88.61%)",
      };
    if (rank === 3)
      return {
        background: "linear-gradient(300.83deg, #39BC6C 8.83%, #009439 88.61%)",
      };
    return {
      background: "linear-gradient(300.83deg, #0B0B0B 8.83%, #464646 88.61%)",
    };
  };

  return (
    <section
      className="relative mx-2 md:mx-4 lg:mx-10 rounded-2xl px-2 md:px-4 py-4 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #670A0B 0%, #212121 100%)",
      }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-50 pointer-events-none z-0">
        <Image
          src={getAssetPath("/images/FireBg.png")}
          alt="Fire"
          fill
          sizes="128px"
          className="object-contain object-top-right"
        />
      </div>

      <div className="relative z-10">
        <SectionTitle title={title || "Top View"} viewAllHref={viewAllHref} />

        <div className="flex flex-col md:flex-row gap-4 xl:gap-8 mt-2">
          <div className="hidden md:flex w-[400px] xl:w-[480px] shrink-0 group cursor-pointer relative">
            <span
              className="absolute -top-2 left-2 w-10 h-8 flex items-center justify-center text-sm font-bold text-white z-20 shadow-md rounded-br-lg rounded-tl-lg"
              style={getRankStyle(1)}
            >
              1
            </span>
            <SmartLink
              href={`/movies/${featuredVideo.id}?type=${featuredVideo.type || "horizontal"}`}
              className="flex flex-col h-full w-full"
            >
              <div className="relative w-full flex-1 aspect-[16/9] rounded-lg border-t border-l border-white/20 overflow-hidden">
                <Image
                  src={featuredVideo.poster}
                  alt={featuredVideo.title}
                  fill
                  sizes="480px"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="pt-4">
                <h4 className="text-xl md:text-2xl font-bold text-white line-clamp-2 group-hover:text-red-500 transition-colors uppercase leading-tight">
                  {featuredVideo.title}
                </h4>
                <p className="text-[12px] text-gray-400 mt-2">
                  {formatViewCount(featuredVideo.views)} មើល
                </p>
              </div>
            </SmartLink>
          </div>

          <div className="relative flex-1 min-w-0 group/carousel">
            <button
              onClick={() => {
                handleScroll("left");
              }}
              className={`absolute left-0 top-0 z-20 w-12 h-full bg-gradient-to-r from-black/60 to-transparent items-center justify-start pl-2 transition-opacity duration-300 hidden md:flex ${
                showLeftArrow
                  ? "opacity-0 group-hover/carousel:opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <ChevronLeft className="text-white w-10 h-10 hover:scale-110 transition-transform" />
            </button>

            <div
              ref={scrollRef}
              {...events}
              className={`w-full overflow-x-auto no-scrollbar pt-2 px-2 grid grid-rows-3 grid-flow-col gap-x-4 gap-y-3 ${
                isDragging ? "cursor-grabbing select-none" : ""
              }`}
              style={{
                WebkitOverflowScrolling: "touch",
              }}
            >
              {videos.map((video, index) => {
                const rank = index + 1;
                const isRank1OnDesktop = index === 0;

                return (
                  <SmartLink
                    key={video.id}
                    href={`/movies/${video.id}?type=${video.type || "horizontal"}`}
                    draggable={false}
                    onClick={(e) => wasDragged && e.preventDefault()}
                    className={`flex gap-4 w-[75vw] max-w-[85vw] md:w-[420px] group cursor-pointer select-none ${isRank1OnDesktop ? "md:hidden" : ""}`}
                  >
                    <div className="relative shrink-0">
                      <span
                        style={getRankStyle(rank)}
                        className="absolute -top-2 left-2 w-7 h-5 md:w-8 md:h-6 flex items-center justify-center text-[10px] md:text-xs font-bold text-white rounded-br-lg rounded-tl-lg z-20 shadow-md"
                      >
                        {rank}
                      </span>
                      <div className="relative w-36 md:w-48 aspect-[16/9] rounded-lg border-t border-l border-white/20 overflow-hidden">
                        <Image
                          src={video.poster}
                          alt={video.title}
                          fill
                          sizes="(max-width: 768px) 144px, 192px"
                          draggable={false}
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col justify-start overflow-hidden py-1">
                      <h4 className="text-base md:text-lg text-white font-bold line-clamp-2 group-hover:text-red-500 transition-colors leading-snug">
                        {video.title}
                      </h4>
                      <p className="text-[12px] text-gray-400 mt-1 line-clamp-2">
                        {video.description || `${formatViewCount(video.views)} មើល`}
                      </p>
                    </div>
                  </SmartLink>
                );
              })}
            </div>

            <button
              onClick={() => {
                handleScroll("right");
              }}
              className={`absolute right-[-16px] top-0 z-20 w-12 h-full bg-gradient-to-l from-black/60 to-transparent items-center justify-end pr-2 transition-opacity duration-300 hidden md:flex ${
                showRightArrow
                  ? "opacity-0 group-hover/carousel:opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <ChevronRight className="text-white w-10 h-10 hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
