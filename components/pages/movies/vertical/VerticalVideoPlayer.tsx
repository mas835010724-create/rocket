"use client";
import React from "react";
import {
  useMediaState,
  useMediaRemote,
  MediaProvider,
  MediaPlayer,
  MediaPlayerInstance,
  Poster,
  PlayButton,
  MuteButton,
  Time,
  TimeSlider,
  Captions,
} from "@vidstack/react";
import "@vidstack/react/player/styles/default/theme.css";
import { SkipForward, Settings, Volume2, VolumeX } from "lucide-react";
import ButtonSub from "@/components/shared/ButtonSub";
import { getAssetPath } from "@/utils/path";
import SubscribeModal from "@/components/shared/SubscribeModal";
import VerticalSubscribeModal from "@/components/shared/VerticalSubscribeModal";
import { logView, logViewTime } from "@/services/movieService";
import VerticalSettingsSheet from "./VerticalSettingsSheet";
import { useSubscribeModalGlobal } from "@/hooks/useSubscribeModalGlobal";
import { analytics } from "@/utils/google-analytics";

const PlayIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 24 24"
    width="32"
    height="32"
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

function VerticalPlayerOverlay({
  title,
  thumbnail,
  videoId,
  isActive,
  description,
  packageDescription,
  packageId,
  packageName,
}: {
  title?: string;
  thumbnail: string;
  videoId: string | number;
  isActive: boolean;
  description?: string;
  packageDescription?: string;
  packageId?: string | number;
  packageName?: string;
}) {
  const [isMobile, setIsMobile] = React.useState(false);
  const isGlobalModalOpen = useSubscribeModalGlobal();

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isPaused = useMediaState("paused");
  const isMuted = useMediaState("muted");
  const currentTime = useMediaState("currentTime");
  const remote = useMediaRemote();

  const [showControls, setShowControls] = React.useState(true);
  const [isInfoModalOpen, setIsInfoModalOpen] = React.useState(false);
  const [isSubscribeFlowOpen, setIsSubscribeFlowOpen] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [hasAdShown, setHasAdShown] = React.useState(false);
  const [dragStart, setDragStart] = React.useState<{
    x: number;
    y: number;
  } | null>(null);

  const totalWatchTimeRef = React.useRef(0);
  const sessionIdRef = React.useRef<string | null>(null);
  const isStarted = useMediaState("started");
  const isPlaying = !isPaused;

  React.useEffect(() => {
    let isMounted = true;

    if (isActive && !sessionIdRef.current) {
      logView({
        video_id: videoId,
        timestamp: Date.now(),
      }).then((response) => {
        // Only assign session if component is still mounted and active
        if (isMounted && response && response.result) {
          sessionIdRef.current = response.result;
          totalWatchTimeRef.current = 0;
        }
      });
    }

    if (!isActive && sessionIdRef.current && totalWatchTimeRef.current > 0) {
      logViewTime({
        session_id: sessionIdRef.current,
        video_id: videoId,
        watch_duration: totalWatchTimeRef.current,
        timestamp: Date.now(),
      });
      sessionIdRef.current = null;
      totalWatchTimeRef.current = 0;
    }

    return () => {
      isMounted = false;
      if (sessionIdRef.current && totalWatchTimeRef.current > 0) {
        logViewTime({
          session_id: sessionIdRef.current,
          video_id: videoId,
          watch_duration: totalWatchTimeRef.current,
          timestamp: Date.now(),
        });
        sessionIdRef.current = null;
      }
    };
  }, [isActive, videoId]);

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && isActive) {
      interval = setInterval(() => {
        totalWatchTimeRef.current += 1;
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isActive]);

  const [remainingTime, setRemainingTime] = React.useState(25);

  // GA4: Log Video Play/Pause/Complete
  React.useEffect(() => {
    if (isActive) {
      if (isPlaying) {
        analytics.videoPlay({ video_id: videoId as number, title });
      } else {
        analytics.videoPause({ video_id: videoId as number, title });
      }
    }
  }, [isPlaying, isActive, videoId, title]);
  const duration = useMediaState("duration");
  const progressLogged = React.useRef<{ [key: number]: boolean }>({});

  React.useEffect(() => {
    if (!isActive || !duration || duration <= 0) return;

    const percent = (currentTime / duration) * 100;
    const milestones = [25, 50, 75];

    milestones.forEach((m) => {
      if (percent >= m && !progressLogged.current[m]) {
        analytics.videoProgress({
          video_id: videoId as number,
          title,
          percent: m,
        });
        progressLogged.current[m] = true;
      }
    });

    // Reset milestones if video is restarted or changed
    if (currentTime < 1) {
      progressLogged.current = {};
    }
  }, [currentTime, duration, isActive, videoId, title]);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isPaused && remainingTime > 0 && !hasAdShown) {
      timer = setInterval(() => {
        setRemainingTime((prev) => {
          const newState = prev - 1;
          return newState < 0 ? 0 : newState;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPaused, remainingTime, hasAdShown]);

  React.useEffect(() => {
    if (remainingTime === 0 && !hasAdShown) {
      if (!isGlobalModalOpen) {
        remote.pause();
        setIsSubscribeFlowOpen(true);
      }
      setHasAdShown(true);
    }
  }, [remainingTime, hasAdShown, remote, isGlobalModalOpen]);

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetIdleTimer = () => {
      setShowControls(true);
      clearTimeout(timeoutId);

      if (!isPaused) {
        timeoutId = setTimeout(() => {
          setShowControls(false);
        }, 5000);
      }
    };

    const events = ["mousemove", "mousedown", "touchstart", "click", "keydown"];
    events.forEach((event) => window.addEventListener(event, resetIdleTimer));

    resetIdleTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((event) =>
        window.removeEventListener(event, resetIdleTimer),
      );
    };
  }, [isPaused]);

  const handleAdClose = () => {
    setIsSubscribeFlowOpen(false);
    remote.play();
  };

  const handleSkipSubscription = (e: React.MouseEvent) => {
    e.stopPropagation();
    analytics.subscribeSkipTrial({ video_id: videoId as number, title });
    setIsSubscribeFlowOpen(true);
    remote.pause();
  };

  const handleProceedToSubscribe = () => {
    setIsInfoModalOpen(false);
    setIsSubscribeFlowOpen(true);
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!dragStart) return;
    const dx = Math.abs(e.clientX - dragStart.x);
    const dy = Math.abs(e.clientY - dragStart.y);

    if (dx < 10 && dy < 10) {
      remote.togglePaused();
    }
    setDragStart(null);
  };

  const handleScreenTap = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      remote.togglePaused();
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-between pointer-events-none">
      {/* VÙNG NHẬN TAP - Full Screen Click Area */}
      <div
        className="absolute inset-0 z-0 pointer-events-auto"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onClick={handleScreenTap}
      />

      {/* Nút Play to ở giữa */}
      <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
        {isPaused && (
          <PlayButton className="bg-black/30 backdrop-blur-sm p-4 rounded-full pointer-events-auto transition-transform active:scale-95 hover:bg-black/40">
            <PlayIcon className="w-12 h-12 text-white" />
          </PlayButton>
        )}
      </div>

      {/* CONTROL BUTTONS CONTAINER - BOTTOM */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end">
        {/* Background gradient: Shows/hides based on control state for a clean look */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none transition-all duration-500 ease-in-out ${
            showControls || isPaused ? "h-40 opacity-100" : "h-20 opacity-50"
          }`}
        />

        <div
          className={`relative z-20 flex flex-col w-full gap-3 pointer-events-auto transition-all duration-500 `}
        >
          {/* --- GROUP 1: ALWAYS VISIBLE BUTTONS (Trial + Subscribe) --- */}
          <div className="flex flex-col gap-3">
            {/* Trial Tag / Skip + Settings */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center justify-end ml-auto">
                {remainingTime > 0 ? (
                  <span
                    style={{
                      background:
                        "linear-gradient(98.85deg, #FFDEA8 -8.66%, #FFA702 91.77%)",
                    }}
                    className="font-bold px-3 py-1 rounded-l-full"
                  >
                    <span
                      className={
                        remainingTime <= 5 ? "text-tv-red" : "text-white"
                      }
                    >
                      {remainingTime}s Free Trial
                    </span>
                  </span>
                ) : (
                  <button
                    onClick={handleSkipSubscription}
                    style={{
                      background:
                        "linear-gradient(98.85deg, #FFDEA8 -8.66%, #FFA702 91.77%)",
                    }}
                    className="text-tv-red font-bold px-3 py-1 rounded-l-full shadow-lg flex items-center gap-1"
                  >
                    Skip <SkipForward size={12} className="fill-current" />
                  </button>
                )}
              </div>
            </div>

            {/* Subscribe Button (Restored visibility logic) */}
            {isMobile && (
              <div className="w-full px-10 pb-2 flex justify-center">
                <ButtonSub
                  size="lg"
                  className="w-full rounded-full shadow-lg"
                  packageDescription={packageDescription}
                  packageId={packageId}
                  packageName={packageName}
                  fromSource={1}
                  sourceId={videoId}
                  pageLocation="vertical_player"
                />
              </div>
            )}
          </div>

          {/* --- GROUP 2: PROGRESS + DESCRIPTION (Hide when Idle) --- */}
          <div
            className={`flex flex-col gap-2 px-2 md:pb-2 overflow-hidden transition-all duration-500 ease-in-out ${
              showControls || isPaused
                ? "max-h-[200px] opacity-100 mt-0 pointer-events-auto"
                : "max-h-0 opacity-0 mt-0 pointer-events-none"
            }`}
          >
            {/* Progress Bar + Settings Button */}
            <div className="w-full flex items-center mt-2 z-30 relative">
              {/* Settings Button */}

              <div
                className="flex-1 h-4 flex items-center swiper-no-swiping"
                onTouchStart={(e) => e.stopPropagation()}
                onTouchMove={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="text-white text-xs font-medium min-w-[30px] text-center">
                  <Time type="current" />
                </div>
                <TimeSlider.Root
                  className={`vds-slider relative flex-1 h-4 flex items-center group/slider ${
                    showControls || isPaused
                      ? "cursor-pointer pointer-events-auto"
                      : "!pointer-events-none cursor-none"
                  }`}
                >
                  <TimeSlider.Track className="relative w-full h-[2px] bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="vds-track-fill absolute top-0 left-0 h-full rounded-full"
                      style={{
                        width: "var(--slider-fill, 0%)",
                        backgroundColor: "#e30613",
                      }}
                    />
                  </TimeSlider.Track>
                  <TimeSlider.Thumb className="vds-thumb absolute top-1/2 left-[var(--slider-fill)] -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-100" />
                </TimeSlider.Root>
                <div className="text-white text-xs font-medium min-w-[30px] text-center">
                  <Time type="duration" />
                </div>
              </div>
              <div className="flex items-center shrink-0 gap-1 ml-1">
                <MuteButton className="p-1.5 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full text-white">
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </MuteButton>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSettingsClick();
                  }}
                  className="p-1 bg-black/30 hover:bg-black/50 backdrop-blur-md rounded-full text-white"
                >
                  <Settings size={18} />
                </button>
              </div>
            </div>

            {/* Description & More (Restored visibility logic) */}
            {isMobile && (
              <div
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsInfoModalOpen(true);
                }}
              >
                <p
                  className="text-tv-gray2 text-sm drop-shadow-md line-clamp-2"
                  dangerouslySetInnerHTML={{
                    __html:
                      packageDescription ||
                      "Don't miss the thrilling moment. Subscribe to TV360 to watch exclusive content.",
                  }}
                />
                <button className="text-tv-gray2 hover:underline inline-block">
                  បន្ថែម
                </button>
              </div>
            )}
          </div>
          {/* END OF GROUP 2 */}
        </div>
      </div>

      <VerticalSubscribeModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        onSubscribe={handleProceedToSubscribe}
        packageDescription={packageDescription}
        title={title}
        packageId={packageId}
        fromSource={1}
        sourceId={videoId}
      />

      <VerticalSettingsSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <SubscribeModal
        isOpen={isSubscribeFlowOpen}
        onClose={handleAdClose}
        variant="center"
        packageDescription={packageDescription}
        title="ការទស្សនាសាកល្បងបានបញ្ចប់"
        packageId={packageId}
        packageName={packageName}
        fromSource={1}
        sourceId={videoId}
      />
    </div>
  );
}

// Helper: Convert YouTube URL to Vidstack format
function getVidstackSrc(src: string): string {
  if (!src) return "";

  // Check if it's a YouTube URL (works for watch, shorts, and youtu.be)
  const youtubeMatch = src.match(
    /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/|youtu\.be\/)([a-zA-Z0-9_-]+)/,
  );
  if (youtubeMatch) {
    return `youtube/${youtubeMatch[1]}`;
  }

  return src;
}

interface VerticalVideoPlayerProps {
  src: string;
  poster: string;
  movieId: string | number;
  autoplay?: boolean;
  title?: string;
  description?: string;
  packageDescription?: string;
  packageId?: string | number;
  packageName?: string;
}

export default function VerticalVideoPlayer({
  src,
  poster,
  movieId,
  autoplay = false,
  title,
  description,
  packageDescription,
  packageId,
  packageName,
}: VerticalVideoPlayerProps) {
  // Normalize YouTube URLs to Vidstack format
  const normalizedSrc = React.useMemo(() => {
    return getVidstackSrc(src);
  }, [src]);

  const videoSrc = normalizedSrc;
  const posterSrc = poster;
  const videoId = movieId;
  const player = React.useRef<MediaPlayerInstance>(null);

  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const [isVertical, setIsVertical] = React.useState(false);

  // Check for valid src. If empty, using a dummy or returning null might be better.
  const hasValidSrc = !!videoSrc && videoSrc.trim() !== "";

  /*
   * Robust Playback Logic:
   * 1. Attempt to play when `autoplay` becomes true.
   * 2. Attempt to play when `can-play` event fires (if `autoplay` is already true).
   * 3. Handle 'NotAllowedError' by falling back to muted playback.
   */
  const waiting = useMediaState("waiting", player);
  const canPlay = useMediaState("canPlay", player);
  const isStarted = useMediaState("started", player);
  const isPaused = useMediaState("paused", player);
  const isPlayingState = useMediaState("playing", player);
  const currentTime = useMediaState("currentTime", player); // Add currentTime for spinner guard

  const attemptPlay = React.useCallback(async () => {
    const el = player.current;
    if (!el || !hasValidSrc) return;

    try {
      // Check if play is a function before calling to avoid "not a function" errors on unmount
      if (typeof el.play === "function") {
        el.currentTime = 0;
        await el.play();
      }
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        // Fallback to muted autoplay
        if (el) {
          el.muted = true;
          try {
            await el.play();
          } catch (mutedErr) {
            console.error("[VerticalVideo] Muted play failed:", mutedErr);
          }
        }
      } else if (error.name !== "AbortError") {
        // Ignore AbortError (happens when pausing while loading)
        console.error("[VerticalVideo] Play failed:", error);
      }
    }
  }, [hasValidSrc]);

  // Effect: React to autoplay prop change (e.g. scrolling into view)
  // Effect: React to autoplay prop change (e.g. scrolling into view)
  React.useEffect(() => {
    if (autoplay) {
      if (canPlay) {
        attemptPlay();
      }
    } else {
      // Stop immediately when scrolling away to free up HLS engine resources
      if (player.current) {
        player.current.pause();
      }
    }

    // Cleanup when component unmounts entirely
    return () => {
      if (player.current) {
        player.current.pause();
      }
    };
  }, [autoplay, canPlay, attemptPlay]);

  // Handler: Triggered when media is ready
  const onCanPlay = React.useCallback(() => {
    if (autoplay) {
      attemptPlay();
    }
  }, [autoplay, attemptPlay]);

  const onLoadedMetadata = React.useCallback((event: any) => {
    // Vidstack's onLoadedMetadata event might be a custom event or native event wrapped
    // Safely access properties
    try {
      const target = event?.target as HTMLVideoElement | undefined;
      const detail = event?.detail;

      const w = detail?.videoWidth || target?.videoWidth || 0;
      const h = detail?.videoHeight || target?.videoHeight || 0;

      // Only log if meaningful
      // console.log(`[VerticalVideo] Dimensions: ${w}x${h}`);

      if (w > 0 && h > 0) {
        setIsVertical(h > w);
      }
    } catch (err) {
      console.warn("[VerticalVideo] Error in onLoadedMetadata:", err);
    }
  }, []);

  if (!hasValidSrc) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center relative">
        {/* Show poster if available for smooth transition */}
        {posterSrc && (
          <img
            src={posterSrc}
            alt={title || "Video Loading"}
            className="absolute inset-0 w-full h-full object-cover opacity-50 blur-sm"
          />
        )}
        {/* Simple Spinner */}
        <div className="w-10 h-10 border-4 border-white/20 border-t-tv-red rounded-full animate-spin z-10 relative"></div>
      </div>
    );
  }

  return (
    <div
      data-desktop={!isMobile}
      className={`relative w-full h-full bg-black overflow-hidden group/player mx-auto md:rounded-xl`}
      style={{
        isolation: "isolate",
        // @ts-ignore
        "--media-object-fit": !isMobile || !isVertical ? "contain" : "cover",
      }}
    >
      <MediaPlayer
        ref={player}
        src={videoSrc}
        title="Vertical Movie Player"
        load="eager"
        poster={posterSrc}
        controls={false}
        playsInline
        loop
        onLoadedMetadata={onLoadedMetadata}
        onCanPlay={onCanPlay}
        onEnded={() => {
          analytics.videoComplete({
            video_id: movieId as number,
            title: title,
          });
        }}
        onLoadStart={() => {}} // Reduced logging
        onError={(e) =>
          console.error(`[VerticalVideo] onError for ${videoId}:`, e)
        }
        className="w-full h-full block bg-black overflow-hidden"
      >
        <MediaProvider
          className={`w-full h-full overflow-hidden [&_video]:!w-full [&_video]:!h-full ${
            isMobile && isVertical
              ? "[&_video]:!object-cover"
              : "[&_video]:!object-contain"
          }`}
        >
          <Poster
            className={`vds-poster w-full h-full block absolute inset-0 ${
              isMobile && isVertical ? "object-cover" : "object-contain"
            }`}
            src={getAssetPath("/images/banner/posterVertical.png")}
            alt="Movie Poster"
          />
        </MediaProvider>
        <Captions
          className="
    vds-captions absolute inset-0 z-10 
    pointer-events-none
    /* Mobile: 14px, PC: 16px */
    [--media-cue-font-size:16px] md:[--media-cue-font-size:20px]
    !bottom-[100px] !md:bottom-[80px]
    /* Tùy chỉnh thêm nếu cần */
    [--media-cue-color:white] 
    [--media-cue-bg-color:rgba(0,0,0,0.7)]
    [--media-cue-padding-x:4px]
  "
        />

        <VerticalPlayerOverlay
          title={title}
          thumbnail={posterSrc}
          videoId={videoId}
          isActive={autoplay}
          description={description}
          packageDescription={packageDescription}
          packageId={packageId}
          packageName={packageName}
        />
      </MediaPlayer>
    </div>
  );
}
