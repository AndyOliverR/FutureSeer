"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TipJarForm } from "@/components/TipJarForm";
import { useIsMobile } from "@/hooks/use-mobile";

interface TipJarModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryCode?: string;
}

export function TipJarModal({ isOpen, onClose, countryCode = "IN" }: TipJarModalProps) {
  const isMobile = useIsMobile();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Tip Jar"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
          className={
            isMobile
              ? "fixed bottom-0 left-0 right-0 w-full max-h-[90vh] overflow-y-auto bg-[var(--m3-surface-container-high)]/95 backdrop-blur-xl border border-[var(--m3-outline-variant)] border-b-0 rounded-t-2xl m3-elevation-3 m3-elevation-transition m3-gpu-accelerated z-[9999]"
              : "fixed bg-[var(--m3-surface-container-high)]/95 backdrop-blur-xl border border-[var(--m3-outline-variant)] rounded-2xl m3-elevation-3 hover:m3-elevation-4 m3-elevation-transition m3-gpu-accelerated w-[calc(100vw-32px)] sm:w-[400px] md:w-[500px] h-auto max-h-[90vh] sm:max-h-[500px] md:max-h-[600px] overflow-y-auto left-1/2 -translate-x-1/2 bottom-4 sm:bottom-16 z-[9999]"
          }
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--m3-secondary)]/8 via-transparent to-[var(--m3-secondary)]/8 rounded-2xl animate-pulse pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-tr from-[var(--m3-secondary)]/5 via-transparent to-[var(--m3-secondary)]/5 rounded-2xl pointer-events-none" />

          <div className="relative flex flex-col">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[var(--m3-outline-variant)] flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-[var(--m3-secondary-container)] rounded-lg">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--m3-on-secondary-container)]" />
                </div>
                <div>
                  <h3 className="m3-title-large text-[var(--m3-on-surface)]">Tip Jar</h3>
                  <p className="m3-label-medium text-[var(--m3-on-surface-variant)]">Show your appreciation</p>
                </div>
              </div>
              <div className="flex gap-1 sm:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-secondary)] hover:bg-[var(--m3-secondary-container)] rounded-lg m3-transition-standard p-1.5 sm:p-2"
                  aria-label="Minimize"
                >
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-secondary)] hover:bg-[var(--m3-secondary-container)] rounded-lg m3-transition-standard p-1.5 sm:p-2"
                  aria-label="Close"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[400px] sm:max-h-[450px] p-3 sm:p-4 space-y-2 sm:space-y-3">
              <TipJarForm countryCode={countryCode} onSuccess={onClose} />
            </div>
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
