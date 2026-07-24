"use client";

import { useSearchParams } from "next/navigation";
import { useState, Suspense, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import SmartLink from "@/components/shared/SmartLink";
import SubHeader from "@/components/layout/SubHeader";
import GridList from "@/components/shared/GridList";
import Pagination from "@/components/shared/Pagination";
import NotFound from "@/components/shared/NotFound";
import { Movie } from "@/services/movieService";
import { fetchVideoByCategoryAction } from "@/actions/movie";

const getItemsPerLoad = () => {
  if (typeof window === "undefined") return 20;
  const width = window.innerWidth;

  if (width >= 1280) return 5 * 4;
  if (width >= 1024) return 4 * 4;
  if (width >= 768) return 3 * 4;
  return 2 * 4;
};

function ViewAllContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "វីដេអូទាំងអស់";
  const cateId = searchParams.get("cate_id");
  const cp = searchParams.get("cp") || "1";
  const pageTitle = type.replace(/-/g, " ");

  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [displayItems, setDisplayItems] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const observerTarget = useRef(null);

  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const fetchData = useCallback(
    async (page: number, isAppend: boolean) => {
      if (!cateId && !type) return;
      if (isAppend) setIsLoadingMore(true);
      else setIsLoading(true);
      try {
        const limit = getItemsPerLoad();
        const offset = isAppend ? displayItems.length : (page - 1) * limit;
        const videos = await fetchVideoByCategoryAction({
          cp_id: cp,
          cate_id: cateId || undefined,
          limit: limit,
          offset: offset,
        });
        if (isAppend) {
          setDisplayItems((prev) => [...prev, ...videos]);
        } else {
          setDisplayItems(videos);
        }
        if (videos.length < limit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } catch (error) {
        console.error("Error loading view all data", error);
      } finally {
        if (isAppend) setIsLoadingMore(false);
        else setIsLoading(false);
      }
    },
    [cateId, type, cp, isMobile, displayItems.length],
  );

  useEffect(() => {
    if (isMobile === null) return;
    if (!isMobile) {
      fetchData(currentPage, false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      if (currentPage === 1 && displayItems.length === 0) {
        fetchData(1, false);
      }
    }
  }, [currentPage, isMobile, cateId]);

  const loadMoreItems = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    fetchData(currentPage + 1, true);
    setCurrentPage((prev) => prev + 1);
  }, [isLoadingMore, hasMore, fetchData, currentPage]);

  useEffect(() => {
    if (isMobile === null || isLoading || displayItems.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMoreItems();
        }
      },
      { threshold: 0.5 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [
    isMobile,
    loadMoreItems,
    hasMore,
    isLoadingMore,
    isLoading,
    displayItems.length,
  ]);

  const totalPages = hasMore ? currentPage + 1 : currentPage;

  return (
    <div className="min-h-screen bg-tv-dark flex flex-col">
      <SubHeader title={pageTitle} />

      <main className="px-2 pb-4 md:px-4 lg:px-10 flex-1">
        {isLoading || isMobile === null ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-tv-red border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <GridList className="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
              {displayItems.map((item, index) => (
                <SmartLink
                  key={`${item.id}-${index}`}
                  href={`/movies/${item.id}`}
                  className="group cursor-pointer flex flex-col gap-2"
                >
                  <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-white/10 bg-gray-900">
                    <Image
                      src={
                        item.poster || item.src || "/images/default-poster.png"
                      }
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-tv-red transition-colors">
                      {item.title}
                    </h3>
                  </div>
                </SmartLink>
              ))}
            </GridList>

            {displayItems.length === 0 && (
              <NotFound
                title="មិនមានទិន្នន័យ"
                description="រកមិនឃើញវីដេអូក្នុងប្រភេទនេះទេ។ សូមព្យាយាមម្តងទៀតនៅពេលក្រោយ ឬជ្រើសរើសប្រភេទផ្សេងទៀត។"
              />
            )}

            {hasMore && displayItems.length > 0 && (
              <div ref={observerTarget} className="flex justify-center py-8">
                {isLoadingMore && (
                  <div className="w-8 h-8 border-4 border-tv-red border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function ViewAllPage() {
  return (
    <Suspense fallback={<div className="text-white p-10">កំពុងផ្ទុក...</div>}>
      <ViewAllContent />
    </Suspense>
  );
}
