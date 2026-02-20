import { AboutSection } from './AboutSection';

export function AboutStandards() {
  return (
    <AboutSection 
      title="Standards & Accuracy" 
      subtitle="Ancient wisdom meets modern precision"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Main Badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-green-500/30 rounded-xl text-center">
            <div className="text-4xl mb-3">🌟</div>
            <h4 className="text-lg font-semibold text-amber-400 mb-2">Swiss Ephemeris</h4>
            <p className="text-sm text-white/60 font-light">NASA JPL DE431</p>
            <p className="text-xs text-green-400 mt-2">Precision: 0.001 arcseconds</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-blue-500/30 rounded-xl text-center">
            <div className="text-4xl mb-3">🛰️</div>
            <h4 className="text-lg font-semibold text-amber-400 mb-2">NASA Validated</h4>
            <p className="text-sm text-white/60 font-light">Cross-validated with NASA Horizons system</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-xl text-center">
            <div className="text-4xl mb-3">✨</div>
            <h4 className="text-lg font-semibold text-amber-400 mb-2">60+ Tools</h4>
            <p className="text-sm text-white/60 font-light">Time-tested traditional methods</p>
          </div>
        </div>

        <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 rounded-2xl transition-colors duration-300">
          <h4 className="text-lg font-semibold text-amber-400 mb-3">60+ tools across categories</h4>
          <p className="text-sm text-white/70 font-light mb-4">
            Astrology (Swiss Ephemeris, NASA-validated), numerology, divination, tarot, I Ching, Chinese & Indian systems, energy practices, and more—all using validated traditional methods and modern astronomical data.
          </p>
          <p className="text-white/60 text-xs font-light">
            Results are for guidance and self-reflection only.
          </p>
        </div>
      </div>
    </AboutSection>
  );
}
