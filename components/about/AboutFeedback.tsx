import { AboutSection } from './AboutSection';

export function AboutFeedback() {
  return (
    <AboutSection 
      title="Feedback & Improvements" 
      subtitle="Your voice shapes our product in real-time"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-green-500/30 hover:border-green-500/50 rounded-2xl transition-colors duration-300">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-bold text-amber-400">We implement your feedback fast</h3>
            <span className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm font-medium">Typically 24–48 hours</span>
          </div>

        {/* Recent Improvements */}
          <h4 className="text-lg font-semibold text-amber-400 mb-4">Recent improvements</h4>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="text-white font-medium">Improved chart rendering</span>
                <span className="text-xs text-amber-400">36 hours ago</span>
              </div>
              <p className="text-sm text-white/60 font-light">Enhanced visualization accuracy and performance</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="text-white font-medium">Added dark mode toggle</span>
                <span className="text-xs text-amber-400">24 hours ago</span>
              </div>
              <p className="text-sm text-white/60 font-light">User-requested feature for better viewing experience</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <span className="text-white font-medium">Enhanced tool selection UI</span>
                <span className="text-xs text-amber-400">48 hours ago</span>
              </div>
              <p className="text-sm text-white/60 font-light">Improved navigation and discoverability</p>
            </div>
          </div>
        </div>
      </div>
    </AboutSection>
  );
}
