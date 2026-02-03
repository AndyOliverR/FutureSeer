import { AboutSection } from './AboutSection';

export function AboutInnovation() {
  return (
    <AboutSection 
      title="Innovation Experiment Phase" 
      subtitle="Join us on this journey"
    >
      <div className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 rounded-2xl transition-all duration-300 hover:scale-105">
        <div className="text-sm text-white/80 space-y-4 leading-relaxed font-light">
          <p>
            We're in the early stages of this innovation experiment. As we scale and learn from power users like you, 
            contribution levels may evolve to ensure the innovation remains accessible to all while improving accuracy and quality.
          </p>
          <p>
            <strong className="text-amber-400 font-normal">Your Usage Matters:</strong> Every reading you generate, every tool you explore, 
            and every piece of feedback you share helps improve the accuracy and precision of FutureSeer for everyone in our community.
          </p>
          <p>
            <strong className="text-amber-400 font-normal">Power User Benefits:</strong> As an early adopter, you're not just a user—you're part 
            of the innovation team. Your contributions help shape the product roadmap and ensure FutureSeer serves the needs of the community.
          </p>
        </div>
      </div>
    </AboutSection>
  );
}
