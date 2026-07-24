import Header from "@/components/layout/Header";
import HomeBanner from "@/components/pages/home/HomeBanner";
import TrendingNow from "@/components/pages/home/TrendingNow";
import TopVideoSection from "@/components/pages/home/TopVideoSection";
import TopViewSection from "@/components/pages/home/TopViewSection";
import ShortVideoSection from "@/components/pages/home/ShortVideoSection";
import DiscoverSection from "@/components/pages/home/DiscoverSection";
import React from "react";

import { getHome } from "@/services/movieService";
import TwoRowScroll from "@/components/pages/home/TwoRowScroll";
import GAInitializer from "@/components/shared/GAInitializer";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ cp?: string }>;
}) {
  const { cp } = await searchParams;
  const {
    shortVideos,
    homeSections = [],
    banners = [],
    discoverCategories = [],
  } = await getHome(cp);

  const hasData =
    (banners && banners.length > 0) ||
    (homeSections && homeSections.length > 0) ||
    (shortVideos && shortVideos.length > 0);

  if (!hasData) {
    // Import HomeNoData dynamically or at top level if it's a server component (it's a client component wrapping Header)
    // Since Next.js App Router allows importing client components in server components:
    const HomeNoData = (await import("@/components/pages/home/HomeNoData"))
      .default;
    return <HomeNoData />;
  }

  return (
    <main className="min-h-screen bg-tv-dark pb-10">
      <GAInitializer />
      <React.Suspense fallback={<div className="h-[60px]" />}>
        <Header />
      </React.Suspense>
      {banners.length > 0 && <HomeBanner banners={banners} />}

      <div className="flex flex-col gap-5 2xl:gap-8">
        {homeSections.map((section) => {
          switch (section.layoutType) {
            case "top-video":
              return (
                <TopVideoSection
                  key={section.id}
                  title={section.title}
                  videos={section.videos}
                  viewAllHref={`/movies/all?type=${encodeURIComponent(section.title)}&cate_id=${section.id}`}
                />
              );
            case "top-view":
              return (
                <TopViewSection
                  key={section.id}
                  title={section.title}
                  videos={section.videos}
                  viewAllHref={`/movies/all?type=${encodeURIComponent(section.title)}&cate_id=${section.id}`}
                />
              );
            case "trending":
              return (
                <TrendingNow
                  key={section.id}
                  title={section.title}
                  videos={section.videos}
                  viewAllHref={`/movies/all?type=${encodeURIComponent(section.title)}&cate_id=${section.id}`}
                />
              );
            case "two-row":
              return (
                <TwoRowScroll
                  key={section.id}
                  title={section.title}
                  videos={section.videos}
                  viewAllHref={`/movies/all?type=${encodeURIComponent(section.title)}&cate_id=${section.id}`}
                />
              );
            case "discover":
              return (
                <DiscoverSection
                  key={section.id}
                  title={"ទស្សនាមាតិកាផ្សេងៗ"} // e.g. "Action Movies"
                  videos={section.videos}
                  categories={discoverCategories}
                  viewAllHref={`/movies/all?type=${encodeURIComponent(section.title)}&cate_id=${section.id}`}
                />
              );
            default:
              return (
                <TrendingNow
                  key={section.id}
                  title={section.title}
                  videos={section.videos}
                />
              );
          }
        })}
      </div>
    </main>
  );
}
