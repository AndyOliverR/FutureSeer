"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { TipJarModal } from "./TipJarModal";
import { useAuth } from "@/hooks/use-auth";

type TipJarContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const TipJarContext = createContext<TipJarContextValue | null>(null);

export function TipJarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const { userProfile } = useAuth();
  const countryCode = userProfile?.country || "IN";

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <TipJarContext.Provider value={{ isOpen, open, close }}>
      {children}
      <TipJarModal
        isOpen={isOpen}
        onClose={close}
        countryCode={countryCode}
      />
    </TipJarContext.Provider>
  );
}

export function useTipJar(): TipJarContextValue {
  const ctx = useContext(TipJarContext);
  if (!ctx) {
    return {
      isOpen: false,
      open: () => {},
      close: () => {},
    };
  }
  return ctx;
}
