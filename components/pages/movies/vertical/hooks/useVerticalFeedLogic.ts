import { useState, useRef, useCallback, useEffect } from "react";
import { Movie } from "@/services/movieService";
import { fetchVideoByIdAction } from "@/actions/movie";

export function useVerticalFeedLogic(initialMovie: Movie, feedVideos: Movie[]) {
  const [currentVideo, setCurrentVideo] = useState<Movie>(initialMovie);
  const [videoList, setVideoList] = useState<Movie[]>(feedVideos);
  const apiTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Infinite Scroll Logic
  const [offset, setOffset] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const hasMoreRef = useRef(true);

  const handleVideoChange = useCallback((video: Movie) => {
    // 1. Optimistic update (show feed data immediately)
    setCurrentVideo((prev) => (prev.id === video.id ? prev : video));

    // 2. Update URL
    const currentPath = window.location.pathname;
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    const prefix = basePath && currentPath.startsWith(basePath) ? basePath : "";
    const newUrl = `${prefix}/movies/${video.id}?type=vertical`;
    window.history.replaceState(null, "", newUrl);

    // 3. Debounced Fetch fresh details
    if (apiTimeoutRef.current) {
      clearTimeout(apiTimeoutRef.current);
    }

    apiTimeoutRef.current = setTimeout(async () => {
      try {
        const freshData = await fetchVideoByIdAction(video.id.toString());
        if (freshData) {
          setCurrentVideo(freshData);

          // Update the list with fresh data to ensure src is correct
          setVideoList((prevList) =>
            prevList.map((v) => (v.id === freshData.id ? freshData : v)),
          );
        }
      } catch (error) {
        console.error("Failed to fetch fresh video details:", error);
      }
    }, 500); // Debounce 500ms
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMoreRef.current) return;
    setIsLoadingMore(true);

    try {
      const nextOffset = offset + 10;
      const { fetchVideoByCategoryAction } = await import("@/actions/movie");

      const currentCateId = currentVideo.cateId || currentVideo.category;

      const newVideos = await fetchVideoByCategoryAction({
        offset: nextOffset,
        limit: 5,
        cate_id: currentCateId ? currentCateId.toString() : undefined,
      });

      if (newVideos.length > 0) {
        setVideoList((prev) => [...prev, ...newVideos]);
        setOffset(nextOffset);
      } else {
        hasMoreRef.current = false;
      }
    } catch (error) {
      console.error("Failed to load more videos:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [offset, isLoadingMore, currentVideo.cateId, currentVideo.category]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (apiTimeoutRef.current) {
        clearTimeout(apiTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentVideo,
    videoList,
    handleVideoChange,
    handleLoadMore,
  };
}
