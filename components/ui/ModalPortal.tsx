"use client";

import { createPortal } from "react-dom";

interface ModalPortalProps {
  open: boolean;
  children: React.ReactNode;
}

/**
 * Portals modal content to document.body so it is not affected by
 * ancestor overflow/transform/stacking context. Use for all custom modals.
 */
export function ModalPortal({ open, children }: ModalPortalProps) {
  if (!open || typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
