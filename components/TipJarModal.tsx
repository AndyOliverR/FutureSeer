"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TipJarForm } from "@/components/TipJarForm";
import { ModalPortal } from "@/components/ui/ModalPortal";

interface TipJarModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryCode?: string;
  /** When set, panel is positioned as a popover just below and right-aligned to this rect */
  anchorRect?: DOMRect | null;
}

export function TipJarModal({ isOpen, onClose, countryCode = "IN", anchorRect }: TipJarModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Focus first focusable when open so focus does not jump and trigger page scroll
  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => {
      const el = contentRef.current?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      el?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  return (
    <ModalPortal open={isOpen}>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000]"
              style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 10000 }}
              onClick={onClose}
              role="dialog"
              aria-modal="true"
              aria-label="Tip Jar"
            />
            <motion.div
              ref={contentRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
              className="fixed w-[calc(100vw-32px)] sm:w-[400px] md:w-[500px] max-w-[90vw] max-h-[min(90dvh,90vh)] overflow-y-auto bg-[var(--m3-surface-container-high)]/95 backdrop-blur-xl border border-[var(--m3-outline-variant)] rounded-2xl m3-elevation-3 hover:m3-elevation-4 m3-elevation-transition m3-gpu-accelerated z-[10001]"
              style={{
                position: 'fixed',
                zIndex: 10001,
                ...(anchorRect
                  ? (() => {
                      // Position to the right of the icon, bottom-aligned so modal can use full height without scroll
                      const left = anchorRect.right + 8;
                      const bottom = 16;
                      // Allow modal to use most of viewport height so full content shows without scroll
                      const maxH = typeof window !== "undefined"
                        ? Math.min(window.innerHeight * 0.9, window.innerHeight - 32)
                        : undefined;
                      return {
                        left,
                        top: "auto",
                        right: "auto",
                        bottom,
                        transform: "none",
                        ...(maxH != null && maxH > 0 ? { maxHeight: maxH } : {}),
                      };
                    })()
                  : {
                      left: "50%",
                      top: "50%",
                      right: "auto",
                      transform: "translate(-50%, -50%)",
                    }),
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--m3-secondary)]/8 via-transparent to-[var(--m3-secondary)]/8 rounded-2xl animate-pulse pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-tr from-[var(--m3-secondary)]/5 via-transparent to-[var(--m3-secondary)]/5 rounded-2xl pointer-events-none" />

              <div className="relative flex flex-col">
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[var(--m3-outline-variant)] flex-shrink-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="shrink-0 p-1.5 sm:p-2 bg-[var(--m3-secondary-container)] rounded-lg">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--m3-on-secondary-container)]" />
                    </div>
                <div>
                  <h3 className="m3-title-large text-[var(--m3-on-surface)]">Tip Jar</h3>
                  <p className="m3-label-medium text-[var(--m3-on-surface-variant)]">Show your appreciation</p>
                </div>
              </div>
              <div className="flex gap-1 sm:gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-secondary)] hover:bg-[var(--m3-secondary-container)] rounded-lg m3-transition-standard p-1.5 sm:p-2"
                  aria-label="Minimize"
                >
                  <span className="shrink-0"><ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden /></span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-secondary)] hover:bg-[var(--m3-secondary-container)] rounded-lg m3-transition-standard p-1.5 sm:p-2"
                  aria-label="Close"
                >
                  <span className="shrink-0"><X className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden /></span>
                </Button>
              </div>
            </div>

            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
              <TipJarForm countryCode={countryCode} onSuccess={onClose} />
            </div>
          </div>
        </motion.div>
        </>
      )}
      </AnimatePresence>
    </ModalPortal>
  );
}
