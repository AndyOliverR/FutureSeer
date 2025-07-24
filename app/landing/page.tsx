"use client"

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const [openJourney, setOpenJourney] = useState(false);
  const [openInvite, setOpenInvite] = useState(false);
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Starry background effect */}
      <div className="absolute inset-0 bg-[url('/assets/bg/starfield.avif')] bg-cover bg-center opacity-30"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-transparent to-slate-950/40"></div>
      
      <div className="relative z-10">
        {/* TopNavBar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md shadow-lg">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <a href="/" className="flex items-center space-x-2">
              <img src="/assets/logo.png" alt="FutureSeer Logo" className="h-8" />
              <span className="text-2xl font-bold text-white">FutureSeer</span>
            </a>
            <button className="md:hidden text-white focus:outline-none">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
            </button>
          </div>
        </nav>
        <div className="flex flex-col items-center justify-center min-h-screen pt-32 pb-12 px-4">
          {/* Hero Section */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl heading-serif gold-glow text-center mb-6 font-bold">
            Unveil the mysteries of your destiny through ancient wisdom and AI insight.
          </h1>
          <div className="text-3xl md:text-4xl heading-serif text-white/90 text-center mb-6 italic font-light font-cedarville-cursive">
            "Ask the Seer"
          </div>
          
          {/* J.P. Morgan Quote */}
          <div className="glass-card rounded-2xl p-6 border border-amber-500/20 max-w-2xl mx-auto mb-10">
            <p className="text-xl italic text-amber-300 font-serif mb-2 text-center">
              "MILLIONAIRES DON'T USE ASTROLOGY, BILLIONAIRES DO."
            </p>
            <p className="text-soft/70 text-sm text-center">— J.P. MORGAN</p>
          </div>
          
          {/* CTA Buttons with Modals */}
          <div className="flex flex-col md:flex-row gap-6 mb-12 w-full max-w-2xl justify-center">
            <Dialog open={openJourney} onOpenChange={setOpenJourney}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full md:w-1/2 text-center border-2 border-amber-400 text-amber-200 font-serif text-lg hover:bg-amber-400/10">
                  Begin Your Journey
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ready to begin your journey?</DialogTitle>
                </DialogHeader>
                <div className="py-4 text-center text-lg">You are about to enter your cosmic dashboard.</div>
                <DialogFooter>
                  <Button onClick={() => { setOpenJourney(false); router.push("/dashboard"); }} className="w-full bg-amber-400 text-black font-bold">Continue</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={openInvite} onOpenChange={setOpenInvite}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full md:w-1/2 text-center border-2 border-amber-400 text-amber-200 font-serif text-lg hover:bg-amber-400/10">
                  I Have an Invite
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enter Your Invite Code</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-amber-400/30 text-lg font-serif text-amber-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 backdrop-blur-md shadow-lg"
                    placeholder="Enter your invite code"
                    disabled
                  />
                </div>
                <DialogFooter>
                  <Button onClick={() => { setOpenInvite(false); router.push("/dashboard"); }} className="w-full bg-amber-400 text-black font-bold">Continue</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          {/* Footer */}
          <footer className="text-center text-white/60 text-xs mt-12">
            2025 FutureSeer All Rights Reserved
          </footer>
        </div>
      </div>
    </div>
  );
} 