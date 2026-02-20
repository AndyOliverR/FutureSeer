import { AboutSection } from './AboutSection';

export function AboutInnovation() {
  return (
    <AboutSection 
      title="Innovation Experiment Phase" 
      subtitle="Join us on this journey"
    >
      <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 rounded-2xl transition-colors duration-300">
        <p className="text-sm text-white/80 leading-relaxed font-light">
          We're in the early stages of this innovation experiment. As we scale and learn from users like you, plans may evolve to stay accessible while we improve accuracy and quality. As an early adopter, your usage and feedback directly shape the product—you're part of the team.
        </p>
      </div>
    </AboutSection>
  );
}
