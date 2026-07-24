import React from "react";
import {
  SeekButton,
  PlayButton,
  Time,
  TimeSlider,
  VolumeSlider,
  MuteButton,
  FullscreenButton,
  useMediaState,
  useMediaRemote,
} from "@vidstack/react";
import { analytics } from "@/utils/google-analytics";
import {
  Play,
  Pause,
  SkipForward as SkipIcon,
  VolumeX,
  Volume2,
  Settings,
  Minimize,
  Maximize,
} from "lucide-react";
import VideoSettingsModal from "../VideoSettingsModal";
import { Replay15Icon, Forward15Icon } from "./SharedControls";

interface MobileOverlayProps {
  logic: any;
}

export default function MobileOverlay({ logic }: MobileOverlayProps) {
  const { state, handlers, remote } = logic;
  const {
    isPaused,
    isVisible,
    remainingTime,
    isSettingsOpen,
    isFullscreen,
    playbackRate,
  } = state;
  const { setShowControls, setIsSettingsOpen, handleSkipSubscription } =
    handlers;

  const isMuted = useMediaState("muted");

  const pointerEventsClass = isVisible
    ? "pointer-events-auto"
    : "pointer-events-none";

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-between md:rounded-xl">
      <VideoSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        disablePortal={isFullscreen}
      />
      <div
        className="absolute inset-0 z-0 pointer-events-auto"
        onClick={() => setShowControls((prev: boolean) => !prev)}
      />

      <div
        className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none transition-opacity duration-500 z-10 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute inset-0 flex items-center justify-center gap-6 z-20 transition-opacity duration-500 pointer-events-none ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <SeekButton
          seconds={-15}
          className={`${pointerEventsClass} active:scale-90`}
        >
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white border border-white/10">
            <Replay15Icon className="w-5 h-5" />
          </div>
        </SeekButton>
        <PlayButton
          className={`w-14 h-14 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/20 ${pointerEventsClass}`}
        >
          {isPaused ? (
            <Play size={28} fill="white" className="ml-1 xl:ml-0" />
          ) : (
            <Pause size={28} fill="white" />
          )}
        </PlayButton>
        <SeekButton
          seconds={15}
          className={`${pointerEventsClass} active:scale-90`}
        >
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white border border-white/10">
            <Forward15Icon className="w-5 h-5" />
          </div>
        </SeekButton>
      </div>

      <div className="relative z-10 w-full mt-auto flex flex-col bg-gradient-to-t from-black/90 via-black/40 to-transparent pb-0 pointer-events-none">
        <div
          className={`flex justify-end pointer-events-none transition-all duration-500 ${
            isVisible ? "translate-y-0" : "translate-y-8"
          }`}
        >
          {remainingTime > 0 ? (
            <div
              className={`px-3 py-1 ${isVisible ? "mb-1" : "mb-2 lg:mb-4"} rounded-l-full text-sm md:text-base font-bold shadow-lg pointer-events-auto`}
              style={{
                background:
                  "linear-gradient(98.85deg, #FFDEA8 -8.66%, #FFA702 91.77%)",
              }}
            >
              <span
                className={remainingTime <= 5 ? "text-tv-red" : "text-white"}
              >
                {remainingTime}s Free Trial
              </span>
            </div>
          ) : (
            <button
              onClick={handleSkipSubscription}
              className={`px-3 py-1 ${isVisible ? "mb-1" : "mb-2 lg:mb-4"} rounded-l-full text-sm md:text-base font-bold flex items-center gap-1 pointer-events-auto transition-all text-tv-red`}
              style={{
                background:
                  "linear-gradient(98.85deg, #FFDEA8 -8.66%, #FFA702 91.77%)",
              }}
            >
              Skip <SkipIcon size={12} className="fill-current" />
            </button>
          )}
        </div>

        <div
          className={`transition-opacity duration-500 ${
            isVisible ? "opacity-100" : "opacity-0"
          } pb-1`}
        >
          <div
            className={`flex items-center gap-1 xl:gap-4 px-2 xl:px-4 w-full ${pointerEventsClass}`}
          >
            <div className="text-white text-xs md:text-sm font-medium min-w-[35px] text-center">
              <Time type="current" />
            </div>

            <div className="flex-1 h-8 flex items-center relative group/slider">
              <TimeSlider.Root
                className={`vds-slider relative w-full !h-4 flex items-center ${pointerEventsClass} ${
                  isVisible
                    ? "cursor-pointer"
                    : "!pointer-events-none cursor-none"
                }`}
              >
                <TimeSlider.Track className="w-full h-[3px] bg-white/30 relative rounded-full overflow-hidden">
                  <div
                    className="vds-track-fill absolute top-0 left-0 h-full"
                    style={{
                      width: "var(--slider-fill, 0%)",
                      backgroundColor: "#E30613",
                    }}
                  />
                </TimeSlider.Track>
                <TimeSlider.Thumb className="vds-thumb absolute top-1/2 left-[var(--slider-fill)] -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover/slider:opacity-100 transition-opacity" />
              </TimeSlider.Root>
            </div>

            <div className="text-white text-xs md:text-sm font-medium min-w-[35px] text-center">
              <Time type="duration" />
            </div>

            <div className="group/volume relative flex items-center justify-center">
              <div className="absolute bottom-full mb-3 px-3 py-4 bg-[#1e1e1e]/90 backdrop-blur-md rounded-3xl invisible group-hover/volume:visible opacity-0 group-hover/volume:opacity-100 transition-all duration-300 flex flex-col items-center shadow-xl border border-white/10">
                <VolumeSlider.Root
                  className="relative flex flex-col items-center h-24 w-6 cursor-pointer"
                  orientation="vertical"
                >
                  <VolumeSlider.Track className="relative w-1 h-full bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="vds-track-fill absolute bottom-0 left-0 w-full bg-white rounded-full"
                      style={{ height: "var(--slider-fill, 0%)" }}
                    />
                  </VolumeSlider.Track>
                  <VolumeSlider.Thumb className="vds-thumb absolute left-1/2 -translate-x-1/2 bottom-[var(--slider-fill)] translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg border border-gray-200 opacity-0 group-hover/volume:opacity-100 transition-opacity" />
                </VolumeSlider.Root>
              </div>
              <MuteButton className="text-white hover:text-gray-200 relative z-10 p-1 cursor-pointer">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </MuteButton>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Cycle speeds: 1 -> 1.25 -> 1.5 -> 2 -> 0.5 -> 1
                const speeds = [1, 1.25, 1.5, 2, 0.5];
                const currentIndex = speeds.indexOf(playbackRate);
                let nextSpeed = speeds[(currentIndex + 1) % speeds.length];
                if (!nextSpeed) nextSpeed = 1;
                remote.changePlaybackRate(nextSpeed);
                analytics.videoChangeSpeed({ speed: nextSpeed });
              }}
              className="text-white text-sm font-bold hover:text-gray-200 cursor-pointer min-w-[24px]"
            >
              {playbackRate}x
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsSettingsOpen(true);
              }}
              className="text-white hover:text-gray-200 cursor-pointer p-1"
            >
              <Settings size={20} />
            </button>

            <div
              onClick={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
            >
              <FullscreenButton className="text-white hover:text-gray-200 cursor-pointer p-1">
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </FullscreenButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
