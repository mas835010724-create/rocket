import PlayerHeader from "@/components/pages/movies/common/PlayerHeader";
import VideoInfo from "@/components/pages/movies/common/VideoInfo";
import VideoPlayerWrapper from "@/components/pages/movies/VideoPlayerWrapper";
import VerticalVideoFeed from "@/components/pages/movies/vertical/VerticalVideoFeed";
import RecommendedSection from "@/components/pages/movies/common/RecommendedSection";
import VerticalMovieLayout from "@/components/pages/movies/vertical/VerticalMovieLayout";
import ResponsiveContainer from "@/components/shared/ResponsiveContainer";
import NotFound from "@/components/shared/NotFound";
import Header from "@/components/layout/Header";
import { getVideoById, getRecommendedVideos } from "@/services/movieService";

export default async function MovieDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { type, cp } = await searchParams;

  const movieData = await getVideoById(id, cp as string);

  // Check if movie data is valid
  if (!movieData || !movieData.title || !movieData.src) {
    return (
      <div className="min-h-screen bg-tv-dark flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center pt-[60px] md:pt-[70px]">
          <NotFound
            title="រកមិនឃើញវីដេអូ"
            description="វីដេអូដែលអ្នកកំពុងស្វែងរកមិនមាន ឬត្រូវបានលុបចេញ។ សូមពិនិត្យមើល URL ម្តងទៀត។"
          />
        </div>
      </div>
    );
  }

  const recommendations = await getRecommendedVideos(
    id,
    movieData.cateId,
    cp as string,
  );

  const isVertical = type === "vertical" || (movieData as any).video_type === 1;

  const feedVideos = [movieData, ...recommendations];

  if (isVertical) {
    return (
      <VerticalMovieLayout
        initialMovie={movieData}
        feedVideos={feedVideos}
        recommendations={recommendations}
        cp={cp as string}
      />
    );
  }

  return (
    <div className="min-h-screen bg-tv-dark flex flex-col items-center">
      <PlayerHeader title={movieData.title} cp={cp as string} />
      <main className="w-full max-w-full flex flex-col items-center lg:max-w-[1800px] lg:mx-auto">
        <div className="w-full flex flex-col xl:flex-row xl:items-start xl:gap-10 md:px-6 lg:px-10">
          <ResponsiveContainer className="w-full xl:flex-1 xl:min-w-0 xl:w-auto xl:mx-0">
            <VideoPlayerWrapper
              src={movieData.src}
              poster={movieData.poster}
              title={movieData.title}
              movieId={movieData.id}
              isVertical={isVertical}
              trialDuration={movieData.trial_duration}
              packageId={movieData.package_id}
              packageDescription={movieData.package_description}
              packageName={movieData.package_name}
            />
          </ResponsiveContainer>

          <div className="w-full xl:w-[450px] xl:shrink-0 xl:sticky xl:top-8">
            <VideoInfo
              title={movieData.title}
              thumbnail={movieData.poster}
              description={movieData.description}
              package_description={movieData.package_description}
              videoId={movieData.id}
              packageId={movieData.package_id}
              packageName={movieData.package_name}
            />
          </div>
        </div>

        <div className="w-full px-2 md:px-10 lg:px-10 lg:mt-2">
          <RecommendedSection videos={recommendations} />
        </div>
      </main>
    </div>
  );
}
