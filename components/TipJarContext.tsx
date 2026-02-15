"use client";

import React, { createContext, useContext, useCallback, useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { TipJarModal } from "@/components/TipJarModal";
import { useModalOpen } from "@/components/ModalOpenContext";

type TipJarContextValue = {
  isOpen: boolean;
  open: (anchorRect?: DOMRect) => void;
  close: () => void;
};

const TipJarContext = createContext<TipJarContextValue | null>(null);

export function TipJarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const { userProfile } = useAuth();
  const { registerModal } = useModalOpen();
  const countryCode = userProfile?.country ?? "IN";

  const open = useCallback((anchorRect?: DOMRect) => {
    setAnchorRect(anchorRect ?? null);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => {
    setIsOpen(false);
    setAnchorRect(null);
  }, []);

  useEffect(() => {
    if (isOpen) {
      return registerModal();
    }
  }, [isOpen, registerModal]);

  return (
    <TipJarContext.Provider value={{ isOpen, open, close }}>
      {children}
      <TipJarModal isOpen={isOpen} onClose={close} countryCode={countryCode} anchorRect={anchorRect} />
    </TipJarContext.Provider>
  );
}

export function useTipJar(): TipJarContextValue {
  const ctx = useContext(TipJarContext);
  if (!ctx) {
    return {
      isOpen: false,
      open: (_anchorRect?: DOMRect) => {},
      close: () => {},
    };
  }
  return ctx;
}
