"use client";
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const [modal, setModal] = useState<null | "journey" | "invite">(null)
  const router = useRouter()

  function handleTest() {
    setModal(null)
    router.push("/dashboard")
  }

  return (
    <section className="flex flex-col items-center justify-start min-h-screen px-6 text-center pt-20">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Main Headline */}
        <h1 className="text-6xl md:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-600 leading-tight tracking-wide">
          Ask the Seer
        </h1>
        
        {/* J.P. Morgan Quote */}
        <div className="group relative p-4 rounded-2xl max-w-2xl mx-auto mb-4 mt-2">
          {/* Gold glow background (hover only) */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-lg md:text-xl italic text-amber-300 font-serif mb-1 text-center">
              "Millionaires don't use astrology, billionaires do."
            </p>
            <p className="text-soft/70 text-sm text-right text-amber-200 pr-2">— J.P. Morgan</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
          <Button
            size="lg"
            className="group relative px-8 py-4 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-900 font-semibold text-lg border-0 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-amber-400/40 hover:scale-105"
            onClick={() => setModal("journey")}
          >
            <span className="relative z-10">Begin Your Journey</span>
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="group relative px-8 py-4 border-2 border-amber-500/50 text-amber-200 hover:text-slate-900 bg-transparent hover:bg-amber-400 font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-400/25 hover:scale-105"
            onClick={() => setModal("invite")}
          >
            I Have an Invite
          </Button>
        </div>
        {/* Subheading moved below CTA */}
        <p className="text-white text-center text-sm md:text-base font-light drop-shadow-lg font-serif max-w-full mx-auto mt-8">
          Where ancient wisdom meets artificial intelligence. Unlock the mysteries of your path through personalized divination.
        </p>

        {/* Modals */}
      </div>
      {modal === "journey" && (
        <Modal onClose={() => setModal(null)}>
          <h2 className="text-2xl font-serif text-amber-200 mb-4">Begin Your Journey</h2>
          <p className="text-slate-300 mb-6">Sign in to unlock your cosmic dashboard. (TEST only for now)</p>
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold text-lg"
            onClick={handleTest}
          >
            TEST
          </Button>
        </Modal>
      )}
      
      {modal === "invite" && (
        <Modal onClose={() => setModal(null)}>
          <h2 className="text-2xl font-serif text-amber-200 mb-4">Enter Your Invite Code</h2>
          <p className="text-slate-300 mb-6">Enter your invite code to access FutureSeer. (TEST only for now)</p>
          <input
            type="text"
            className="w-full mb-4 px-4 py-3 rounded-xl bg-slate-900/60 border border-amber-400/30 text-lg font-serif text-amber-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 backdrop-blur-md shadow-lg"
            placeholder="Invite Code (TEST)"
            disabled
          />
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-900 font-semibold text-lg"
            onClick={handleTest}
          >
            TEST
          </Button>
        </Modal>
      )}
    </section>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-slate-900/90 rounded-2xl shadow-2xl p-8 max-w-md w-full relative border border-amber-400/20">
        <button
          className="absolute top-3 right-3 text-amber-300 hover:text-amber-100 text-2xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  )
} 