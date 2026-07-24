"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Gauge,
  Captions,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
} from "lucide-react";
import { useMediaRemote, useMediaState } from "@vidstack/react";
import { analytics } from "@/utils/google-analytics";

interface VerticalSettingsSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsView = "main" | "speed" | "quality" | "subtitles";

export default function VerticalSettingsSheet({
  isOpen,
  onClose,
}: VerticalSettingsSheetProps) {
  const [view, setView] = useState<SettingsView>("main");
  const remote = useMediaRemote();
  const [isClosing, setIsClosing] = useState(false);

  // Media State
  const playbackRate = useMediaState("playbackRate");
  const currentQuality = useMediaState("quality");
  const qualities = useMediaState("qualities");
  const isAutoQuality = useMediaState("autoQuality");
  const textTracks = useMediaState("textTracks");
  const currentTextTrack = useMediaState("textTrack");

  useEffect(() => {
    if (isOpen) {
      setView("main");
      setIsClosing(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300); // Animation duration
  };

  if (!isOpen && !isClosing) return null;

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
      <div className="flex flex-col h-full">
        <SettingsHeader title="ល្បឿន" onBack={() => setView("main")} />
        <div className="overflow-y-auto custom-scrollbar max-h-[50vh]">
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
      <SettingsHeader title="គុណភាព" onBack={() => setView("main")} />
      <div className="overflow-y-auto custom-scrollbar max-h-[50vh]">
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
    <div className="flex flex-col h-full">
      <SettingsHeader title="អក្សររត់ក្រោម" onBack={() => setView("main")} />
      <div className="overflow-y-auto custom-scrollbar max-h-[50vh]">
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
    <>
      <div
        className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 pointer-events-auto ${
          isClosing ? "opacity-0" : "opacity-100"
        }`}
        onClick={handleClose}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 bg-[#1e1e1e] z-[70] rounded-t-2xl p-4 pb-6 transition-transform duration-300 ease-out transform pointer-events-auto ${
          isClosing ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {view === "main" && (
          <div className="flex justify-between items-center mb-4 px-2">
            <h3 className="text-white font-bold text-lg">ការកំណត់</h3>
            <button
              onClick={handleClose}
              className="text-white/70 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        )}

        <div>
          {view === "main" && renderMain()}
          {view === "speed" && renderSpeed()}
          {view === "quality" && renderQuality()}
          {view === "subtitles" && renderSubtitles()}
        </div>
      </div>
    </>
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
      className="flex items-center justify-between px-4 py-3 hover:bg-white/5 active:bg-white/10 rounded-lg cursor-pointer transition-colors group"
    >
      <div className="flex items-center gap-3 text-white">
        {icon}
        <span className="text-[16px] font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-1 text-gray-400 group-hover:text-white transition-colors">
        <span className="text-[14px]">{value}</span>
        <ChevronRight size={18} />
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
      className="flex items-center justify-between px-4 py-3 hover:bg-white/5 active:bg-white/10 rounded-lg cursor-pointer transition-colors"
    >
      <span
        className={`text-[16px] ${
          isSelected ? "text-white font-bold" : "text-gray-300"
        }`}
      >
        {label}
      </span>
      {isSelected && <Check size={20} className="text-tv-red" />}
    </div>
  );
}

function SettingsHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-2 px-1 py-2 border-b border-white/10 mb-2">
      <button
        onClick={() => {
          onBack();
          analytics.navBackClick({ from_view: title });
        }}
        className="p-1.5 hover:bg-white/10 rounded-full text-white transition-colors"
      >
        <ChevronLeft size={24} />
      </button>
      <span className="text-[16px] font-bold text-white">{title}</span>
    </div>
  );
}
