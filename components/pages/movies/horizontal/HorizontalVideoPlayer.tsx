"use client";

import React from "react";

import { useIsMobile } from "@/hooks/useIsMobile";

import "@vidstack/react/player/styles/default/theme.css";

import {
  MediaProvider,
  MediaPlayer,
  MediaPlayerInstance,
  Captions,
  useMediaState,
  Poster,
  useMediaRemote,
} from "@vidstack/react";
import { analytics } from "@/utils/google-analytics";
import { getAssetPath } from "@/utils/path";
import SubscribeModal from "@/components/shared/SubscribeModal";

import { useHorizontalPlayerLogic } from "./hooks/useHorizontalPlayerLogic";
import MobileOverlay from "./components/MobileOverlay";
import DesktopOverlay from "./components/DesktopOverlay";

// Helper: Convert YouTube URL to Vidstack format
function getVidstackSrc(src: string): string {
  if (!src) return "";

  // Check if it's a YouTube URL
  const youtubeMatch = src.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/,
  );
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return `youtube/${videoId}`;
  }

  return src;
}

function VideoPlayerOverlay({
  trialDuration = 25,
  title,
  thumbnail,
  videoId,
  packageId,
  packageDescription,
  packageName,
}: {
  trialDuration?: number;
  title?: string;
  thumbnail: string;
  videoId: string | number;
  packageId?: string | number;
  packageDescription?: string;
  packageName?: string;
}) {
  const logic = useHorizontalPlayerLogic({
    videoId,
    title,
    packageId,
    trialDuration,
  });

  const { state, handlers } = logic;
  const isMobile = useIsMobile(1536);

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-between rounded-xl pointer-events-none">
      <SubscribeModal
        isOpen={state.isAdOpen}
        onClose={handlers.handleAdClose}
        variant="center"
        packageDescription={packageDescription}
        title="ការទស្សនាសាកល្បងបានបញ្ចប់"
        packageId={packageId}
        packageName={packageName}
        fromSource={1}
        sourceId={videoId}
      />

      {isMobile ? (
        <MobileOverlay logic={logic} />
      ) : (
        <DesktopOverlay logic={logic} />
      )}
    </div>
  );
}

export default function VideoPlayer({
  src,
  poster,
  title,
  trialDuration,
  videoId,
  packageId,
  packageDescription,
  packageName,
}: any) {
  const effectiveTrialDuration =
    !trialDuration || trialDuration === 0 ? 10 : trialDuration;
  const isMobile = useIsMobile(1536);
  const player = React.useRef<MediaPlayerInstance>(null);
  const hasValidSrc = !!src;
  const waiting = useMediaState("waiting", player);
  const canPlay = useMediaState("canPlay", player);
  const isStarted = useMediaState("started", player);
  const isPaused = useMediaState("paused", player);
  const isPlayingState = useMediaState("playing", player);

  const attemptPlay = React.useCallback(async () => {
    if (!player.current || !hasValidSrc) return;

    try {
      player.current.currentTime = 0;
      await player.current.play();
    } catch (error: any) {
      if (error.name === "NotAllowedError") {
        if (player.current) {
          player.current.muted = true;
          try {
            await player.current.play();
          } catch (mutedErr) {
            console.error("[HorizontalVideo] Muted play failed:", mutedErr);
          }
        }
      } else if (error.name !== "AbortError") {
        console.error("[HorizontalVideo] Play failed:", error);
      }
    }
  }, [hasValidSrc]);

  React.useEffect(() => {
    if (canPlay) {
      attemptPlay();
    }
  }, [src, attemptPlay, canPlay]);

  return (
    <div
      className={`relative bg-black overflow-hidden group/player mx-auto flex items-center justify-center aspect-video w-full`}
      style={{
        isolation: "isolate",
      }}
    >
      <MediaPlayer
        ref={player}
        src={getVidstackSrc(src)}
        title={title}
        load="eager"
        // poster={poster || "/images/trendingNow.png"}
        controls={false}
        playsInline
        crossOrigin="anonymous"
        onCanPlay={attemptPlay}
        onEnded={() => {
          analytics.videoComplete({
            video_id: videoId as number,
            title: title,
          });
        }}
        className="w-full h-full !bg-black"
      >
        <MediaProvider
          className="h-full relative flex items-center justify-center bg-black object-contain"
          style={
            {
              "--media-object-fit": "contain",
            } as any
          }
        >
          <style
            dangerouslySetInnerHTML={{
              __html: `
    .vds-media-provider video {
      height: 100% !important;
      width: auto !important;
      max-width: 100%;
      margin: 0 auto;
      object-fit: contain !important;
    }
  `,
            }}
          />
          <Poster
            className="vds-poster w-full h-full absolute inset-0 object-cover"
            src={getAssetPath("/images/banner/posterHorizon.png")}
            alt="Movie Poster"
          />
        </MediaProvider>
        <Captions
          className="
    vds-captions absolute inset-0 z-10 
    pointer-events-none
    /* Mobile: 14px, PC: 16px */
    [--media-cue-font-size:16px] md:[--media-cue-font-size:30px]
    !bottom-[30px] !md:bottom-[80px]
    /* Tùy chỉnh thêm nếu cần */
    [--media-cue-color:white] 
    [--media-cue-bg-color:rgba(0,0,0,0.7)]
    [--media-cue-padding-x:4px]
  "
        />
        {!isPlayingState && (waiting || !isStarted) && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/10 pointer-events-none">
            <div className="w-16 h-16 border-4 border-white/20 border-t-tv-red rounded-full animate-spin"></div>
          </div>
        )}
        <VideoPlayerOverlay
          trialDuration={effectiveTrialDuration}
          title={title}
          thumbnail={poster || getAssetPath("/images/trendingNow.png")}
          videoId={videoId}
          packageId={packageId}
          packageDescription={packageDescription}
          packageName={packageName}
        />
      </MediaPlayer>
    </div>
  );
}
