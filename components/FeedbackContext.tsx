"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

type FeedbackContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <FeedbackContext.Provider value={{ isOpen, open, close }}>
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback(): FeedbackContextValue {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    return {
      isOpen: false,
      open: () => {},
      close: () => {},
    };
  }
  return ctx;
}
