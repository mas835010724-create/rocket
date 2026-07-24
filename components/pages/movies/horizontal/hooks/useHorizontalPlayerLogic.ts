import { useState, useEffect, useRef } from "react";
import { useMediaState, useMediaRemote } from "@vidstack/react";
import { logView, logViewTime } from "@/services/movieService";
import { useSubscribeModalGlobal } from "@/hooks/useSubscribeModalGlobal";
import { analytics } from "@/utils/google-analytics";

interface UseHorizontalPlayerLogicProps {
  videoId: string | number;
  title?: string;
  packageId?: string | number;
  trialDuration: number;
}

export function useHorizontalPlayerLogic({
  videoId,
  title,
  packageId,
  trialDuration,
}: UseHorizontalPlayerLogicProps) {
  const isPaused = useMediaState("paused");
  const hasStarted = useMediaState("started");
  const isFullscreen = useMediaState("fullscreen");
  const pointerType = useMediaState("pointer");
  const isSeeking = useMediaState("seeking");
  const playbackRate = useMediaState("playbackRate");

  const remote = useMediaRemote();

  const [showControls, setShowControls] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPCSettingsOpen, setIsPCSettingsOpen] = useState(false);
  const [isHoveringControls, setIsHoveringControls] = useState(false);
  const [isAdOpen, setIsAdOpen] = useState(false);
  const [hasAdShown, setHasAdShown] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [remainingTime, setRemainingTime] = useState(trialDuration);

  const totalWatchTimeRef = useRef(0);
  const sessionIdRef = useRef<string | null>(null);
  const isPlaying = !isPaused;
  const isGlobalModalOpen = useSubscribeModalGlobal();

  // 1. Log View on Start
  useEffect(() => {
    if (hasStarted && !sessionIdRef.current) {
      logView({
        video_id: videoId,
        timestamp: Date.now(),
      }).then((response) => {
        if (response && response.result) {
          sessionIdRef.current = response.result;
        }
      });
    }
  }, [hasStarted, videoId]);

  // 2. Track Watch Time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        totalWatchTimeRef.current += 1;
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // 2.5 Log GA4 Play/Pause
  useEffect(() => {
    if (hasStarted) {
      if (isPlaying) {
        analytics.videoPlay({ video_id: videoId as number, title });
      } else {
        analytics.videoPause({ video_id: videoId as number, title });
      }
    }
  }, [isPlaying, hasStarted, videoId, title]);
  const duration = useMediaState("duration");
  const currentTime = useMediaState("currentTime");
  const progressLogged = useRef<{ [key: number]: boolean }>({});

  useEffect(() => {
    if (!hasStarted || !duration || duration <= 0) return;

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
  }, [currentTime, duration, hasStarted, videoId, title]);

  // 3. Send Log on Unload
  useEffect(() => {
    const handleUnload = () => {
      if (totalWatchTimeRef.current > 0 && sessionIdRef.current) {
        const url = `http://192.168.1.158:8085/api/landing-page/log-view-time?session_id=${sessionIdRef.current}&video_id=${videoId}&watch_duration=${totalWatchTimeRef.current}&timestamp=${Date.now()}`;
        fetch(url, {
          method: "POST",
          keepalive: true,
          headers: {
            "X-API-KEY": "X9gPqF6m4Qd2Zy8e3R5uWb7cA0hVj1KxL2MfTqS8aYz",
          },
          cache: "no-store",
        });
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      if (totalWatchTimeRef.current > 0 && sessionIdRef.current) {
        logViewTime({
          session_id: sessionIdRef.current,
          video_id: videoId,
          watch_duration: totalWatchTimeRef.current,
          timestamp: Date.now(),
        });
      }
    };
  }, [videoId]);

  // Trial Timer Logic
  useEffect(() => {
    setRemainingTime(trialDuration);
  }, [trialDuration]);

  useEffect(() => {
    if (hasStarted && remainingTime > 0 && !hasAdShown) {
      const timer = setInterval(() => {
        setRemainingTime((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [hasStarted, remainingTime, hasAdShown]);

  // Trigger Ad on Timer End
  useEffect(() => {
    if (remainingTime === 0 && !hasAdShown) {
      if (!isGlobalModalOpen) {
        setIsAdOpen(true);
        remote.pause();
      }
      setHasAdShown(true);
    }
  }, [remainingTime, hasAdShown, remote, isGlobalModalOpen]);

  // Auto-hide controls logic
  useEffect(() => {
    const shouldRunTimer =
      hasStarted &&
      !isPaused &&
      showControls &&
      !isSeeking &&
      !isPCSettingsOpen;
    const isHoveringBlocked = pointerType === "fine" && isHoveringControls;

    if (shouldRunTimer && !isHoveringBlocked) {
      const timer = setTimeout(() => setShowControls(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [
    hasStarted,
    isPaused,
    showControls,
    isHoveringControls,
    pointerType,
    isSeeking,
    isPCSettingsOpen,
  ]);

  // Close PC settings when controls hide
  useEffect(() => {
    if (!showControls) {
      setIsPCSettingsOpen(false);
    }
  }, [showControls]);

  // Close mobile settings on fullscreen toggle
  useEffect(() => {
    setIsSettingsOpen(false);
  }, [isFullscreen]);

  // Handlers
  const handleAdClose = () => {
    setIsAdOpen(false);
    remote.play();
  };

  const handleSkipSubscription = (e: React.MouseEvent) => {
    e.stopPropagation();
    analytics.subscribeSkipTrial({ video_id: videoId as number, title });
    setIsAdOpen(true);
    remote.pause();
  };

  const handleMouseDown = (e: React.MouseEvent) =>
    setDragStart({ x: e.clientX, y: e.clientY });

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!dragStart) return;
    const isClick =
      Math.abs(e.clientX - dragStart.x) < 10 &&
      Math.abs(e.clientY - dragStart.y) < 10;
    if (isClick && !isPCSettingsOpen) setShowControls((prev) => !prev);
    setDragStart(null);
  };

  const toggleControls = () => {
    if (!isPCSettingsOpen) {
      setShowControls((prev) => !prev);
    }
  };

  const handlers = {
    setShowControls,
    setIsSettingsOpen,
    setIsPCSettingsOpen,
    setIsHoveringControls,
    handleAdClose,
    handleSkipSubscription,
    handleMouseDown,
    handleMouseUp,
    toggleControls,
  };

  const state = {
    isPaused,
    hasStarted,
    isFullscreen,
    playbackRate,
    showControls,
    isSettingsOpen,
    isPCSettingsOpen,
    isHoveringControls,
    isAdOpen,
    remainingTime,
    isVisible: !hasStarted || isPaused || showControls || isPCSettingsOpen,
  };

  return { state, handlers, remote };
}
