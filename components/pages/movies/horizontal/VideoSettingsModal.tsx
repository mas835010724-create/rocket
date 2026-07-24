import React, { useEffect, useState } from "react";
import {
  Settings,
  Captions,
  ChevronRight,
  Gauge,
  ChevronLeft,
  Check,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useMediaRemote, useMediaState } from "@vidstack/react";
import { analytics } from "@/utils/google-analytics";

interface VideoSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  disablePortal?: boolean;
}

type SettingsView = "main" | "speed" | "quality" | "subtitles";

export default function VideoSettingsModal({
  isOpen,
  onClose,
  disablePortal = false,
}: VideoSettingsModalProps) {
  const [isRendered, setIsRendered] = useState(false);
  const [view, setView] = useState<SettingsView>("main");

  const remote = useMediaRemote();

  const playbackRate = useMediaState("playbackRate");
  const currentQuality = useMediaState("quality");
  const qualities = useMediaState("qualities");
  const isAutoQuality = useMediaState("autoQuality");
  const textTracks = useMediaState("textTracks");
  const currentTextTrack = useMediaState("textTrack");

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setView("main");
    } else {
      const timer = setTimeout(() => setIsRendered(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isRendered) return null;

  const subtitleTracks = textTracks.filter(
    (track) => track.kind === "subtitles" || track.kind === "captions",
  );
  const currentSubtitle =
    currentTextTrack?.kind === "subtitles" ||
    currentTextTrack?.kind === "captions"
      ? currentTextTrack
      : null;

  const renderMain = () => (
    <div className="flex flex-col gap-1">
      <SettingItem
        icon={<Settings size={20} />}
        label="គុណភាព"
        value={
          isAutoQuality
            ? `ស្វ័យប្រវត្តិ (${currentQuality?.height || "HD"})`
            : `${currentQuality?.height ? currentQuality.height + "p" : "ស្វ័យប្រវត្តិ"}`
        }
        onClick={() => setView("quality")}
      />
      <SettingItem
        icon={<Gauge size={20} />}
        label="ល្បឿន"
        value={playbackRate === 1 ? "ធម្មតា" : `${playbackRate}x`}
        onClick={() => setView("speed")}
      />
      <SettingItem
        icon={<Captions size={20} />}
        label="អក្សររត់ក្រោម"
        value={currentSubtitle ? currentSubtitle.label : "បិទ"}
        onClick={() => setView("subtitles")}
      />
    </div>
  );

  const renderSpeed = () => {
    const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    return (
      <div className="flex flex-col h-full">
        <Header title="ល្បឿន" onBack={() => setView("main")} />
        <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[50vh]">
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
    <div className="flex flex-col h-full">
      <Header title="គុណភាព" onBack={() => setView("main")} />
      <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[50vh]">
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
          .map((quality, idx) => (
            <SelectionItem
              key={`${quality.height}_${idx}`}
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
    <div className="flex flex-col h-full">
      <Header title="អក្សររត់ក្រោម" onBack={() => setView("main")} />
      <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[50vh]">
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
        {subtitleTracks.map((track, idx) => {
          return (
            <SelectionItem
              key={`${track.id || "track"}_${track.label}_${idx}`}
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

  const content = (
    <div
      className={`${disablePortal ? "absolute" : "fixed"} inset-0 z-[9999] flex flex-col justify-end pointer-events-auto`}
    >
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`relative w-full bg-[#1e1e1e] rounded-t-2xl p-4 flex flex-col transition-transform duration-300 ease-out max-h-[70vh] ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {view === "main" && (
          <div
            className="w-full flex justify-center mb-4 cursor-grab active:cursor-grabbing"
            onClick={onClose}
          >
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>
        )}
        {view === "main" && renderMain()}
        {view === "speed" && renderSpeed()}
        {view === "quality" && renderQuality()}
        {view === "subtitles" && renderSubtitles()}
      </div>
    </div>
  );

  if (disablePortal) {
    return content;
  }

  return createPortal(content, document.body);
}

function SettingItem({
  icon,
  label,
  value,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full py-4 px-2 active:bg-white/5 rounded-lg transition-colors group"
    >
      <div className="flex items-center gap-4 text-white">
        <span className="text-gray-300 group-hover:text-white transition-colors">
          {icon}
        </span>
        <span className="text-[16px] font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2 text-gray-400">
        {value && <span className="text-[14px]">{value}</span>}
        <ChevronRight size={18} />
      </div>
    </button>
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
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full py-3.5 px-4 active:bg-white/5 rounded-lg transition-colors"
    >
      <span
        className={`text-[15px] ${isSelected ? "text-white font-medium" : "text-gray-300"}`}
      >
        {label}
      </span>
      {isSelected && <Check size={18} className="text-white" />}
    </button>
  );
}

function Header({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-2 pb-4 mb-2 border-b border-white/10">
      <button
        onClick={() => {
          onBack();
          analytics.navBackClick({ from_view: title });
        }}
        className="p-1 -ml-1 hover:bg-white/10 rounded-full text-white transition-colors"
      >
        <ChevronLeft size={24} />
      </button>
      <span className="text-[16px] font-medium text-white">{title}</span>
    </div>
  );
}
