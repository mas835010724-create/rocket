"use client";

import React from "react";
import { useDraggableScroll } from "@/hooks/useDraggableScroll";

interface CarouselListProps {
  children: React.ReactNode;
  className?: string;
  listClassName?: string;
}

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

export default function CarouselList({
  children,
  className = "",
  listClassName,
}: CarouselListProps) {
  const { ref, events, isDragging, wasDragged } = useDraggableScroll();
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = useCallback(() => {
    if (ref.current) {
      const { scrollLeft, scrollWidth, clientWidth } = ref.current;
      setShowLeftArrow(scrollLeft > 0);
      // Use a small buffer (e.g. 1px) to handle fractional pixel recurring issues
      setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  }, [ref]);

  useEffect(() => {
    checkScroll();
    // Add resize listener to recheck arrows
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

  // Custom smooth scroll function
  const scrollToSmooth = (
    element: HTMLElement,
    target: number,
    duration: number,
  ) => {
    const start = element.scrollLeft;
    const change = target - start;
    const startTime = performance.now();

    // Disable snap to prevent conflict with JS animation
    element.style.scrollSnapType = "none";

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      if (elapsed < duration) {
        // Ease In Out Quad
        let t = elapsed / (duration / 2);
        let val;
        if (t < 1) {
          val = (change / 2) * t * t + start;
        } else {
          t--;
          val = (-change / 2) * (t * (t - 2) - 1) + start;
        }

        element.scrollLeft = val;
        requestAnimationFrame(animateScroll);
      } else {
        element.scrollLeft = target;
        element.style.scrollSnapType = "";
        setTimeout(checkScroll, 50); // Check arrows after scroll finishes
      }
    };
    requestAnimationFrame(animateScroll);
  };

  const scroll = (direction: "left" | "right") => {
    if (ref.current) {
      const container = ref.current;
      const children = Array.from(container.children) as HTMLElement[];

      if (children.length === 0) return;

      const startOffset = children[0].offsetLeft;
      const currentScroll = container.scrollLeft;

      // Find the index of the item currently closest to the "start" position (relative to viewport)
      let currentIndex = 0;
      let minDiff = Infinity;

      for (let i = 0; i < children.length; i++) {
        const itemScrollPos = children[i].offsetLeft - startOffset;
        const diff = Math.abs(itemScrollPos - currentScroll);
        if (diff < minDiff) {
          minDiff = diff;
          currentIndex = i;
        }
      }

      let nextIndex = currentIndex;

      const currentItemScrollPos =
        children[currentIndex].offsetLeft - startOffset;

      if (direction === "right") {
        // If we are essentially at the current item, move to next
        // Add a small tolerance (2px) for sub-pixel rendering issues
        if (currentScroll >= currentItemScrollPos - 2) {
          nextIndex = currentIndex + 1;
        } else {
          nextIndex = currentIndex + 1;
        }
      } else {
        // Left
        if (currentScroll <= currentItemScrollPos + 2) {
          nextIndex = currentIndex - 1;
        } else {
          nextIndex = currentIndex - 1;
        }
      }

      // Clamp
      nextIndex = Math.max(0, Math.min(children.length - 1, nextIndex));

      const targetScroll = children[nextIndex].offsetLeft - startOffset;

      // Bounds Check
      const maxScroll = container.scrollWidth - container.clientWidth;
      const clampedTarget = Math.max(0, Math.min(maxScroll, targetScroll));

      scrollToSmooth(container, clampedTarget, 600);
    }
  };

  // Clear inline snap style when dragging stops to allow CSS class to take over
  useEffect(() => {
    if (!isDragging && ref.current) {
      ref.current.style.scrollSnapType = "";
    }
  }, [isDragging]);

  const onMouseDownWrapped = (e: React.MouseEvent) => {
    // Instantly disable snap to prevent jitter before React re-renders
    if (ref.current) {
      ref.current.style.scrollSnapType = "none";
    }
    events.onMouseDown(e);
  };

  return (
    <div className={`relative group/carousel ${className}`}>
      <button
        onClick={() => scroll("left")}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-full bg-gradient-to-r from-black/30 to-transparent flex items-center justify-start pl-2 transition-opacity duration-300 hidden md:flex ${
          showLeftArrow
            ? "opacity-0 group-hover/carousel:opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <ChevronLeft className="text-white w-8 h-8 hover:scale-110 transition-transform" />
      </button>

      <div
        {...events}
        onMouseDown={onMouseDownWrapped}
        ref={ref}
        onScroll={checkScroll}
        onClickCapture={(e) => {
          if (wasDragged) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className={`w-full overflow-x-auto no-scrollbar cursor-grab scroll-p-2 ${
          isDragging
            ? "cursor-grabbing select-none snap-none"
            : "snap-x snap-mandatory"
        } ${listClassName || "flex gap-4"}`}
      >
        {children}
      </div>
      <button
        onClick={() => scroll("right")}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-full bg-gradient-to-l from-black/30 to-transparent flex items-center justify-end pr-2 transition-opacity duration-300 hidden md:flex ${
          showRightArrow
            ? "opacity-0 group-hover/carousel:opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <ChevronRight className="text-white w-8 h-8 hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}
