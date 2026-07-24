import React from "react";
import {
  PlayButton,
  Time,
  TimeSlider,
  VolumeSlider,
  MuteButton,
  FullscreenButton,
  useMediaState,
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
import VideoSettingsPopup from "../VideoSettingsPopup";

interface DesktopOverlayProps {
  logic: any;
}

export default function DesktopOverlay({ logic }: DesktopOverlayProps) {
  const { state, handlers, remote } = logic;
  const {
    isPaused,
    isVisible,
    remainingTime,
    isPCSettingsOpen,
    isFullscreen,
    playbackRate,
  } = state;
  const {
    toggleControls,
    setIsPCSettingsOpen,
    handleSkipSubscription,
    setIsHoveringControls,
  } = handlers;

  const isMuted = useMediaState("muted");
  const pointerEventsClass = isVisible
    ? "pointer-events-auto"
    : "pointer-events-none";

  return (
    <div className="flex flex-col w-full h-full relative">
      {isPCSettingsOpen && (
        <div
          className="absolute inset-0 z-40 w-full h-full pointer-events-auto"
          onClick={() => setIsPCSettingsOpen(false)}
        />
      )}
      <VideoSettingsPopup
        isOpen={isPCSettingsOpen}
        onClose={() => setIsPCSettingsOpen(false)}
      />

      <div
        className="absolute inset-0 z-0 pointer-events-auto"
        onClick={toggleControls}
      />
      <div
        className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none transition-opacity duration-500 z-10 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-tv-dark via-tv-dark/70 to-transparent pointer-events-none transition-opacity duration-500 z-10 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <PlayButton
          className={`w-20 h-20 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white border border-white/20 hover:bg-red-600/80 transition-all ${pointerEventsClass}`}
        >
          {isPaused ? (
            <Play size={40} fill="white" className="ml-1" />
          ) : (
            <Pause size={40} fill="white" />
          )}
        </PlayButton>
      </div>
      <div className="mt-auto relative z-20 w-full pointer-events-none">
        <div className="flex justify-end items-end w-full">
          <div
            className={`flex flex-col justify-end items-end gap-2 pb-2 pointer-events-auto transition-all duration-500 ${
              isVisible ? "translate-y-0" : "translate-y-12"
            }`}
          >
            {remainingTime > 0 ? (
              <span
                style={{
                  background:
                    "linear-gradient(98.85deg, #FFDEA8 -8.66%, #FFA702 91.77%)",
                }}
                className="font-bold px-4 py-1.5 rounded-l-full shadow-lg text-sm md:text-base lg:text-lg"
              >
                <span className={remainingTime <= 5 ? "text-tv-red" : "text-white"}>
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
                className="text-tv-red font-bold px-4 py-1.5 rounded-l-full flex items-center gap-1 transition-colors text-sm md:text-base lg:text-lg"
              >
                Skip <SkipIcon size={14} className="fill-current" />
              </button>
            )}
          </div>
        </div>
        <div
          className={`transition-opacity duration-500 ${
            isVisible ? "opacity-100" : "opacity-0"
          } pb-4`}
          onMouseEnter={() => setIsHoveringControls(true)}
          onMouseLeave={() => setIsHoveringControls(false)}
        >
          <div
            className={`flex items-center px-4 w-full xl:gap-2 ${pointerEventsClass}`}
          >
            <div className="text-white text-sm font-medium min-w-[35px] text-center">
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
                <TimeSlider.Track className="w-full h-[3px] bg-white/20 rounded-full relative group-hover/slider:h-[5px] transition-all">
                  <div
                    className="vds-track-fill absolute top-0 left-0 h-full rounded-full"
                    style={{
                      width: "var(--slider-fill, 0%)",
                      backgroundColor: "#e30613",
                    }}
                  />
                </TimeSlider.Track>
                <TimeSlider.Thumb className="vds-thumb absolute top-1/2 left-[var(--slider-fill)] -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/slider:opacity-100 transition-opacity" />
              </TimeSlider.Root>
            </div>
            <div className="text-white text-sm font-medium min-w-[35px] text-center">
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
              className="text-white hover:text-gray-200 cursor-pointer p-1"
              onClick={(e) => {
                e.stopPropagation();
                setIsPCSettingsOpen(!isPCSettingsOpen);
              }}
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
