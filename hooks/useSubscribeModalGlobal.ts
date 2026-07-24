"use client";

import { useState, useEffect } from "react";

// Singleton state
let globalIsOpen = false;
const listeners = new Set<(isOpen: boolean) => void>();

export const setGlobalSubscribeModalOpen = (isOpen: boolean) => {
  if (globalIsOpen !== isOpen) {
    globalIsOpen = isOpen;
    listeners.forEach((listener) => listener(isOpen));
  }
};

export const getGlobalSubscribeModalOpen = () => globalIsOpen;

export const useSubscribeModalGlobal = () => {
  const [isOpen, setIsOpen] = useState(globalIsOpen);

  useEffect(() => {
    const listener = (newIsOpen: boolean) => {
      setIsOpen(newIsOpen);
    };
    listeners.add(listener);
    // Sync immediately
    if (globalIsOpen !== isOpen) {
        setIsOpen(globalIsOpen);
    }
    return () => {
      listeners.delete(listener);
    };
  }, [isOpen]);

  return isOpen;
};
