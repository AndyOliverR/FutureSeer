"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TipJarForm } from "@/components/TipJarForm";
import { ModalPortal } from "@/components/ui/ModalPortal";

interface TipJarModalProps {
  isOpen: boolean;
  onClose: () => void;
  countryCode?: string;
}

export function TipJarModal({ isOpen, onClose, countryCode = "IN" }: TipJarModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  return (
    <ModalPortal open={isOpen}>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Modal Content - Matches Mystical Feedback style */}
            <motion.div
              ref={contentRef}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-surface-container-high border-t sm:border border-outline-variant rounded-t-3xl sm:rounded-3xl m3-elevation-3 overflow-hidden shadow-2xl z-[10001]"
              style={{ maxHeight: '90vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-outline-variant">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary-container rounded-xl">
                      <Sparkles className="w-5 h-5 text-secondary-on-container" />
                    </div>
                    <div>
                      <h3 className="text-xl font-heading font-bold text-surface-on uppercase tracking-tight">Tip Jar</h3>
                      <p className="text-xs text-surface-on-variant">Show your appreciation</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                {/* Form Content */}
                <div className="p-5 overflow-y-auto custom-scrollbar">
                  <TipJarForm countryCode={countryCode} onSuccess={onClose} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}
