"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Brain, Globe, Users, Heart } from "lucide-react";
import Link from "next/link";

export function PersonalNote() {
  const [imageError, setImageError] = useState(false);
  return (
    <motion.section 
      className="px-4 sm:px-6 pt-20 pb-20 m3-gpu-accelerated max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ease: [0, 0, 0.2, 1], duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105">
        <CardContent className="p-8 md:p-12">
          {/* Profile Picture and Header */}
          <motion.div 
            className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-amber-400/50 shadow-lg flex-shrink-0">
              {imageError ? (
                <div className="w-full h-full bg-gradient-to-br from-[var(--m3-primary-container)] to-[var(--m3-tertiary-container)] flex items-center justify-center">
                  <span className="text-[var(--m3-on-primary-container)] m3-display-small">A</span>
                </div>
              ) : (
                <Image
                  src="/assets/images/andy-rozario.jpg"
                  alt="AnDY"
                  fill
                  sizes="(max-width: 768px) 128px, 160px"
                  className="object-cover"
                  priority
                  onError={() => setImageError(true)}
                />
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-amber-400 mb-2">
                A Note From Me
              </h1>
              <p className="text-xl font-semibold text-white mb-1">
                AnDY
              </p>
              <p className="text-white/60 text-sm font-light">
                Founder, FutureSeer
              </p>
            </div>
          </motion.div>

          {/* Personal Note Content */}
          <motion.div 
            className="max-w-none space-y-6 text-white/80 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm text-white/80">
              I've always been fascinated by culture, curious about the many wonders of the occult world, and drawn to the mysteries that have guided humanity for millennia. Throughout my journey, I've noticed something profound: while the wealthy and powerful have quietly relied on these ancient sciences—astrology, numerology, tarot, vastu, and countless other divination practices—most of us have been left in the dark, unable to access this wisdom at an affordable price.
            </p>

            <p className="text-sm text-white/80">
              This observation isn't just my own. As one <Link href="https://www.instagram.com/reel/DTGwc16AjHZ/?igsh=MTE0cml2dWFyeWlpdQ==" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline transition-colors">influencer recently highlighted</Link>, billionaires and the world's elite have been using astrology and these ancient practices to guide their decisions for generations. Yet traditional consultations come at a premium, making regular access unaffordable for most people. The knowledge that could help us all navigate life's complexities has remained locked away, accessible only to those who can pay premium prices.
            </p>

            <p className="text-sm text-white/80">
              This realization sparked an idea: What if we could democratize this wisdom? What if we could combine the precision of artificial intelligence with the depth of ancient knowledge to create something truly transformative? That's how FutureSeer was born.
            </p>

            <div className="my-8 p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 rounded-xl transition-all duration-300 hover:scale-105">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4">
                <Sparkles className="w-7 h-7 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-amber-400 mb-4">
                What Makes FutureSeer Different
              </h2>
              <ul className="space-y-3 text-sm text-white/80">
                <li className="flex items-start gap-2">
                  <Brain className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-amber-400">AI-Powered Accuracy:</strong> We combine in-house AI expertise with deep knowledge of spiritual sciences to deliver unbiased, precise interpretations—eliminating human bias while preserving authenticity.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Globe className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-amber-400">Comprehensive Coverage:</strong> We bring 33+ divination tools—from Vedic and Western astrology to numerology, tarot, vastu, I Ching, and more—into one unified platform, breaking down the fragmentation that has kept these sciences separate.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Heart className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-amber-400">Affordable Access:</strong> At just ₹99 per month, we make personalized guidance accessible to everyone, disrupting the costly consultation model that has excluded so many.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span><strong className="text-amber-400">Global Appeal:</strong> We cater to both Indian and international audiences, integrating diverse divination tools that speak to people across cultures and traditions.</span>
                </li>
              </ul>
            </div>

            <p className="text-sm text-white/80">
              But here's what truly excites me: <strong className="text-amber-400">this is just the beginning.</strong> FutureSeer isn't just my vision—it's a platform that grows and evolves with every person who uses it. Your feedback, your experiences, and your contributions shape what we become. When you share a screenshot with a suggestion, when you tell us what's working and what isn't, when you help us understand what you need—we listen, and we implement. Almost instantly.
            </p>

            <p className="text-sm text-white/80">
              I've built FutureSeer because I believe that the wisdom that has guided the world's most successful people shouldn't be a luxury. It should be accessible, affordable, and available to anyone with the curiosity to explore. Whether you're a spiritual seeker looking for personal guidance, someone seeking affordable alternatives to expensive consultations, or a digital native exploring these ancient practices for the first time—FutureSeer is here for you.
            </p>

            <p className="text-sm text-white/80">
              With your support, your contributions, and your trust, we can only get better. Every feature we add, every tool we refine, every insight we provide—it all comes from understanding what you need and delivering it at a price that makes sense.
            </p>

            <div className="my-8 p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 rounded-xl text-center transition-all duration-300 hover:scale-105">
              <p className="text-2xl font-bold text-amber-400 mb-2">
                Join Us on This Journey
              </p>
              <p className="text-white/60 text-sm mb-4 font-light">
                Start with your first month free, then choose a plan that works for you:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <span className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-sm text-white">Coffee: ₹99/month</span>
                <span className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-sm text-white">Treat: ₹199/quarter</span>
                <span className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-sm text-white">Hamper: ₹999/year</span>
              </div>
            </div>

            <p className="text-sm text-amber-400 italic text-center mt-8">
              Thank you for being part of this mission. Together, we're making ancient wisdom accessible to everyone.
            </p>
          </motion.div>
        </CardContent>
      </Card>
    </motion.section>
  );
}
