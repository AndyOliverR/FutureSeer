"use client";

import { StandardsBadges } from './StandardsBadges';
import { CheckCircle2, Shield, Award, BookOpen } from 'lucide-react';

export function AccreditationSection() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl bg-slate-900/30 border border-slate-700/50 shadow-[0_30px_60px_rgba(0,0,0,0.55)] backdrop-blur-sm p-6 sm:p-8 md:p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-amber-400" />
              <h2 className="text-3xl sm:text-4xl font-serif text-white font-normal">
                Standards & Accuracy
              </h2>
            </div>
            <p className="text-base sm:text-lg text-slate-300 font-light max-w-2xl mx-auto">
              FutureSeer combines ancient wisdom with modern precision. All our tools are built on validated standards and time-tested traditional methods.
            </p>
          </div>

          {/* Main Standards Display */}
          <div className="mb-8">
            <StandardsBadges variant="compact" showToolCount={true} />
          </div>

          {/* Key Points */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20">
              <CheckCircle2 className="w-8 h-8 text-amber-400 mb-3" />
              <h3 className="text-sm font-semibold text-white mb-2">NASA-Validated</h3>
              <p className="text-xs text-slate-300 font-light leading-relaxed">
                Astronomical calculations cross-validated with NASA Horizons system
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-700/30">
              <Award className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-sm font-semibold text-white mb-2">Traditional Methods</h3>
              <p className="text-xs text-slate-300 font-light leading-relaxed">
                Based on classical texts and time-tested divination systems
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-br from-blue-900/20 to-blue-800/20 border border-blue-700/30">
              <BookOpen className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-sm font-semibold text-white mb-2">37+ Tools</h3>
              <p className="text-xs text-slate-300 font-light leading-relaxed">
                Comprehensive collection of occult sciences and divination methods
              </p>
            </div>
          </div>

          {/* Detailed Standards */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <StandardsBadges variant="detailed" />
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-slate-400 font-light italic">
              All calculations and interpretations are based on validated traditional methods and modern astronomical data.
              Results are for guidance and self-reflection purposes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}