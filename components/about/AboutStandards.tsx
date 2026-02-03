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

        {/* Category Breakdown */}
        <div className="p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 rounded-2xl transition-all duration-300 hover:scale-105">
          <h4 className="text-2xl font-bold text-white mb-6">Category Standards</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">⭐</span>
                <div>
                  <h5 className="text-amber-400 font-semibold">Astrology</h5>
                  <p className="text-xs text-white/60 font-light">Swiss Ephemeris (NASA JPL Validated)</p>
                </div>
              </div>
              <p className="text-amber-400 text-sm">31 tools</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🔢</span>
                <div>
                  <h5 className="text-amber-400 font-semibold">Numerology</h5>
                  <p className="text-xs text-white/60 font-light">Traditional Methods + Mathematical Precision</p>
                </div>
              </div>
              <p className="text-amber-400 text-sm">4 tools</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🔮</span>
                <div>
                  <h5 className="text-amber-400 font-semibold">Divination</h5>
                  <p className="text-xs text-white/60 font-light">Time-Tested Methods + Symbolic Interpretation</p>
                </div>
              </div>
              <p className="text-amber-400 text-sm">13 tools</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📖</span>
                <div>
                  <h5 className="text-amber-400 font-semibold">Reading</h5>
                  <p className="text-xs text-white/60 font-light">Classical Analysis + Modern AI Enhancement</p>
                </div>
              </div>
              <p className="text-amber-400 text-sm">4 tools</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🐉</span>
                <div>
                  <h5 className="text-amber-400 font-semibold">Chinese</h5>
                  <p className="text-xs text-white/60 font-light">Traditional Chinese Methods</p>
                </div>
              </div>
              <p className="text-amber-400 text-sm">4 tools</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🕉️</span>
                <div>
                  <h5 className="text-amber-400 font-semibold">Indian</h5>
                  <p className="text-xs text-white/60 font-light">Classical Indian Traditions</p>
                </div>
              </div>
              <p className="text-amber-400 text-sm">1 tool</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">✨</span>
                <div>
                  <h5 className="text-amber-400 font-semibold">Energy</h5>
                  <p className="text-xs text-white/60 font-light">Holistic Energy Practices</p>
                </div>
              </div>
              <p className="text-amber-400 text-sm">5 tools</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🔍</span>
                <div>
                  <h5 className="text-amber-400 font-semibold">Analysis</h5>
                  <p className="text-xs text-white/60 font-light">Synthesized Systems + Modern Research</p>
                </div>
              </div>
              <p className="text-amber-400 text-sm">2 tools</p>
            </div>
          </div>
          <p className="text-white/60 text-sm mt-6 text-center font-light">
            All calculations and interpretations are based on validated traditional methods and modern astronomical data. 
            Results are for guidance and self-reflection purposes.
          </p>
        </div>
      </div>
    </AboutSection>
  );
}
