"use client";
import { useEffect, useState } from "react";

const stats = [
  { value: "10K+", label: "Active Users", icon: "👥" },
  { value: "50K+", label: "Readings Generated", icon: "🔮" },
  { value: "98%", label: "Accuracy Rate", icon: "⭐" },
  { value: "24/7", label: "AI Support", icon: "🤖" },
];

export function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [countedValues, setCountedValues] = useState<Record<number, number>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    const section = document.querySelector('[data-stats-section]');
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  return (
    <section 
      data-stats-section
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl bg-slate-900/20 backdrop-blur-sm border border-slate-700/30 hover:border-amber-500/30 transition-all duration-300"
            >
              <div className="text-3xl sm:text-4xl mb-2">{stat.icon}</div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-400 mb-1">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-slate-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

