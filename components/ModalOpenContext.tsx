"use client";

import React, { createContext, useContext, useCallback, useState } from "react";

type ModalOpenContextValue = {
  isAnyModalOpen: boolean;
  registerModal: () => () => void;
};

const ModalOpenContext = createContext<ModalOpenContextValue | null>(null);

export function ModalOpenProvider({ children }: { children: React.ReactNode }) {
  const [openCount, setOpenCount] = useState(0);

  const registerModal = useCallback(() => {
    setOpenCount((c) => c + 1);
    return () => setOpenCount((c) => Math.max(0, c - 1));
  }, []);

  return (
    <ModalOpenContext.Provider
      value={{ isAnyModalOpen: openCount > 0, registerModal }}
    >
      {children}
    </ModalOpenContext.Provider>
  );
}

export function useModalOpen(): ModalOpenContextValue {
  const ctx = useContext(ModalOpenContext);
  if (!ctx) {
    return {
      isAnyModalOpen: false,
      registerModal: () => () => {},
    };
  }
  return ctx;
}
