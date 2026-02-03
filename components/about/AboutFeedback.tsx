import { AboutSection } from './AboutSection';

export function AboutFeedback() {
  return (
    <AboutSection 
      title="Feedback & Improvements" 
      subtitle="Your voice shapes our product in real-time"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Implementation Promise */}
        <div className="p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-green-500/30 hover:border-green-500/50 rounded-2xl text-center transition-all duration-300 hover:scale-105">
          <h3 className="text-2xl font-bold text-amber-400 mb-4">24-48 Hour Implementation</h3>
          <p className="text-white/60 text-sm mb-6 font-light">
            We believe in a one-to-one, face-to-face approach. FutureSeer might not be perfect yet, but every feedback 
            from our users is considered and implemented almost instantly to make the tool better.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
            <span className="text-green-400 text-sm font-semibold">Average implementation time: 24-48 hours</span>
          </div>
        </div>

        {/* Recent Improvements */}
        <div className="p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 rounded-2xl transition-all duration-300 hover:scale-105">
          <h4 className="text-2xl font-bold text-amber-400 mb-6">Recent Improvements from User Feedback</h4>
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
