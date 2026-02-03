"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AskHistory } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

interface ReadingDetailsModalProps {
  reading: AskHistory | null
  isOpen: boolean
  onClose: () => void
  formatDate: (timestamp: number) => string
}

export function ReadingDetailsModal({ 
  reading, 
  isOpen, 
  onClose,
  formatDate 
}: ReadingDetailsModalProps) {
  if (!reading) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 m3-transition-standard"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Card elevation={3} className="backdrop-blur-sm bg-[var(--m3-surface-container-high)]/95 border border-[var(--m3-outline-variant)] m3-elevation-transition rounded-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle id="modal-title" className="m3-headline-small text-[var(--m3-on-surface)] font-serif">
                    Reading Details
                  </CardTitle>
                  <Button
                    onClick={onClose}
                    variant="text"
                    size="sm"
                    className="border-none text-[var(--m3-on-surface-variant)] hover:bg-[var(--m3-primary-container)] hover:text-[var(--m3-primary)] rounded-lg m3-transition-standard"
                    aria-label="Close modal"
                  >
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question */}
                <div>
                  <h3 className="m3-title-medium text-[var(--m3-primary)] font-serif font-semibold mb-2">Your Question</h3>
                  <p className="m3-body-large text-[var(--m3-on-surface)]">{reading.question}</p>
                </div>

                {/* Astrological Data */}
                {reading.scientificData && (
                  <div>
                    <h3 className="m3-title-medium text-[var(--m3-primary)] font-serif font-semibold mb-3">Astrological Profile</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-xl">
                        <div className="m3-label-small text-[var(--m3-on-surface-variant)]">Sun Sign</div>
                        <div className="m3-title-small text-[var(--m3-primary)] font-serif">{reading.scientificData.sun_sign}</div>
                      </div>
                      <div className="p-3 bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-xl">
                        <div className="m3-label-small text-[var(--m3-on-surface-variant)]">Moon Sign</div>
                        <div className="m3-title-small text-[var(--m3-primary)] font-serif">{reading.scientificData.moon_sign}</div>
                      </div>
                      <div className="p-3 bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-xl">
                        <div className="m3-label-small text-[var(--m3-on-surface-variant)]">Rising Sign</div>
                        <div className="m3-title-small text-[var(--m3-primary)] font-serif">{reading.scientificData.rising_sign}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Symbolic Data */}
                {reading.symbolicData && (
                  <div>
                    <h3 className="m3-title-medium text-[var(--m3-primary)] font-serif font-semibold mb-3">Symbolic Elements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-xl">
                        <div className="m3-label-small text-[var(--m3-on-surface-variant)]">Primary Symbol</div>
                        <div className="m3-title-small text-[var(--m3-primary)] font-serif">{reading.symbolicData.primarySymbol}</div>
                      </div>
                      <div className="p-3 bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-xl">
                        <div className="m3-label-small text-[var(--m3-on-surface-variant)]">Elemental Influence</div>
                        <div className="m3-title-small text-[var(--m3-primary)] font-serif">{reading.symbolicData.elementalInfluence}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Insight */}
                <div>
                  <h3 className="m3-title-medium text-[var(--m3-primary)] font-serif font-semibold mb-3">Seer's Insight</h3>
                  <div className="p-4 bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-xl">
                    <p className="m3-body-large text-[var(--m3-on-surface)] leading-relaxed whitespace-pre-line">
                      {reading.aiSummary}
                    </p>
                  </div>
                </div>

                {/* Remedies */}
                {reading.remedies && reading.remedies.length > 0 && (
                  <div>
                    <h3 className="m3-title-medium text-[var(--m3-primary)] font-serif font-semibold mb-3">Recommended Remedies</h3>
                    <div className="space-y-3">
                      {reading.remedies.map((remedy: any, index: number) => (
                        <div key={index} className="p-3 bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] rounded-xl">
                          <div className="m3-title-small text-[var(--m3-primary)] font-serif font-semibold">{remedy.title}</div>
                          <div className="m3-body-medium text-[var(--m3-on-surface-variant)]">{remedy.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                <div className="flex items-center justify-between pt-4 border-t border-[var(--m3-outline-variant)]">
                  <div className="m3-body-small text-[var(--m3-on-surface-variant)]">
                    <Clock className="inline w-4 h-4 mr-1" />
                    {formatDate(reading.timestamp)}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="m3-body-small text-[var(--m3-primary)]">
                      Confidence: {reading.symbolicData?.confidence || 75}%
                    </div>
                    <div className="w-16 h-2 bg-[var(--m3-surface-container-low)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[var(--m3-primary)] to-[var(--m3-tertiary)] rounded-full"
                        style={{ width: `${reading.symbolicData?.confidence || 75}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
