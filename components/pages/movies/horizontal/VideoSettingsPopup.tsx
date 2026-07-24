import React, { useState } from "react";
import {
  Settings,
  Gauge,
  Captions,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import {
  useMediaRemote,
  useMediaState,
  type VideoQuality,
} from "@vidstack/react";
import { analytics } from "@/utils/google-analytics";

interface VideoSettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsView = "main" | "speed" | "quality" | "subtitles";

export default function VideoSettingsPopup({
  isOpen,
  onClose,
}: VideoSettingsPopupProps) {
  const [view, setView] = useState<SettingsView>("main");
  const remote = useMediaRemote();

  // Media State
  const playbackRate = useMediaState("playbackRate");
  const currentQuality = useMediaState("quality");
  const qualities = useMediaState("qualities");
  const isAutoQuality = useMediaState("autoQuality");
  const textTracks = useMediaState("textTracks");
  const currentTextTrack = useMediaState("textTrack");

  // Reset view when closed
  React.useEffect(() => {
    if (!isOpen) setView("main");
  }, [isOpen]);

  if (!isOpen) return null;

  const subtitleTracks = textTracks.filter(
    (track) => track.kind === "subtitles" || track.kind === "captions",
  );
  const currentSubtitle =
    currentTextTrack?.kind === "subtitles" ||
    currentTextTrack?.kind === "captions"
      ? currentTextTrack
      : null;

  const renderMain = () => (
    <div className="flex flex-col">
      <MenuItem
        icon={<Captions size={20} className="text-white" />}
        label="អក្សររត់ក្រោម"
        value={currentSubtitle ? currentSubtitle.label : "បិទ"}
        onClick={() => setView("subtitles")}
      />

      <MenuItem
        icon={<Gauge size={20} className="text-white" />}
        label="ល្បឿន"
        value={playbackRate === 1 ? "ធម្មតា" : `${playbackRate}x`}
        onClick={() => setView("speed")}
      />

      <MenuItem
        icon={<Settings size={20} className="text-white" />}
        label="គុណភាព"
        value={
          isAutoQuality
            ? `ស្វ័យប្រវត្តិ (${currentQuality?.height || "HD"})`
            : `${currentQuality?.height ? currentQuality.height + "p" : "ស្វ័យប្រវត្តិ"}`
        }
        onClick={() => setView("quality")}
      />
    </div>
  );

  const renderSpeed = () => {
    const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    return (
      <div className="flex flex-col">
        <Header title="ល្បឿន" onBack={() => {
            setView("main");
        }} />
        <div className="max-h-60 overflow-y-auto custom-scrollbar">
          {speeds.map((rate) => (
            <SelectionItem
              key={rate}
              label={rate === 1 ? "ធម្មតា" : `${rate}x`}
              isSelected={playbackRate === rate}
              onClick={() => {
                remote.changePlaybackRate(rate);
                analytics.videoChangeSpeed({ speed: rate });
              }}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderQuality = () => (
    <div className="flex flex-col">
      <Header title="គុណភាព" onBack={() => {
          setView("main");
      }} />
      <div className="max-h-60 overflow-y-auto custom-scrollbar">
        <SelectionItem
          label="ស្វ័យប្រវត្តិ"
          isSelected={!!isAutoQuality}
          onClick={() => {
            remote.requestAutoQuality();
            analytics.videoChangeQuality({ quality: "Auto" });
          }}
        />
        {qualities
          .slice()
          .reverse()
          .filter((q) => q.height > 0)
          .map((quality) => (
            <SelectionItem
              key={quality.height}
              label={`${quality.height}p`}
              isSelected={
                !isAutoQuality && currentQuality?.height === quality.height
              }
              onClick={() => {
                const index = qualities.findIndex(
                  (q) => q.height === quality.height,
                );
                if (index !== -1) {
                  remote.changeQuality(index);
                  analytics.videoChangeQuality({ quality: `${quality.height}p` });
                }
              }}
            />
          ))}
      </div>
    </div>
  );

  const renderSubtitles = () => (
    <div className="flex flex-col">
      <Header title="អក្សររត់ក្រោម" onBack={() => {
          setView("main");
      }} />
      <div className="max-h-60 overflow-y-auto custom-scrollbar">
        <SelectionItem
          label="បិទ"
          isSelected={!currentSubtitle}
          onClick={() => {
            const activeIndex = textTracks.findIndex(
              (t) => t.mode === "showing",
            );
            if (activeIndex !== -1) {
              remote.changeTextTrackMode(activeIndex, "disabled");
              analytics.videoToggleSubtitle({ subtitle: "បិទ" });
            }
          }}
        />
        {subtitleTracks.map((track) => {
          const index = textTracks.findIndex(
            (t) => t.id === track.id && t.label === track.label,
          );
          return (
            <SelectionItem
              key={track.id + track.label}
              label={track.label}
              isSelected={
                currentSubtitle?.id === track.id &&
                currentSubtitle?.label === track.label
              }
              onClick={() => {
                const index = textTracks.findIndex(
                  (t) => t.id === track.id && t.label === track.label,
                );
                if (index !== -1) {
                  remote.changeTextTrackMode(index, "showing");
                  analytics.videoToggleSubtitle({ subtitle: track.label });
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="absolute bottom-14 right-0 z-50 w-72 bg-[#1e1e1e]/95 backdrop-blur-sm rounded-xl py-2 shadow-xl border border-white/10 overflow-hidden font-sans pointer-events-auto">
      {view === "main" && renderMain()}
      {view === "speed" && renderSpeed()}
      {view === "quality" && renderQuality()}
      {view === "subtitles" && renderSubtitles()}
    </div>
  );
}

// Sub-components
function MenuItem({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-4 py-3 hover:bg-white/10 cursor-pointer transition-colors group"
    >
      <div className="flex items-center gap-3 text-white">
        {icon}
        <span className="text-[14px] font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-1 text-gray-400 group-hover:text-white transition-colors">
        <span className="text-[13px]">{value}</span>
        <ChevronRight size={16} />
      </div>
    </div>
  );
}

function SelectionItem({
  label,
  isSelected,
  onClick,
}: {
  label: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between px-4 py-2.5 hover:bg-white/10 cursor-pointer transition-colors"
    >
      <span
        className={`text-[14px] ${isSelected ? "text-white font-medium" : "text-gray-300"}`}
      >
        {label}
      </span>
      {isSelected && <Check size={16} className="text-white" />}
    </div>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-2 px-2 py-2 border-b border-white/10 mb-1">
      <button
        onClick={() => {
            onBack();
            analytics.navBackClick({ from_view: title });
        }}
        className="p-1 hover:bg-white/10 rounded-full text-white transition-colors"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="text-[14px] font-medium text-white">{title}</span>
    </div>
  );
}
