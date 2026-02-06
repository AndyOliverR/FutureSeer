"use client";

import React, { createContext, useContext, useCallback } from "react";
import { useRouter } from "next/navigation";

type TipJarContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const TipJarContext = createContext<TipJarContextValue | null>(null);

export function TipJarProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const open = useCallback(() => {
    router.push("/tip-jar");
  }, [router]);

  const close = useCallback(() => {}, []);

  return (
    <TipJarContext.Provider value={{ isOpen: false, open, close }}>
      {children}
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
