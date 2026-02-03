"use client";
import { useEffect, useState } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Entrepreneur",
    content: "FutureSeer's insights helped me make crucial business decisions. The AI-powered analysis is incredibly accurate.",
    rating: 5,
    avatar: "👩‍💼",
  },
  {
    name: "Michael Rodriguez",
    role: "Investor",
    content: "As someone who values data-driven decisions, I'm impressed by the scientific precision combined with ancient wisdom.",
    rating: 5,
    avatar: "👨‍💻",
  },
  {
    name: "Priya Sharma",
    role: "Life Coach",
    content: "My clients love the personalized readings. The combination of Vedic astrology and AI is revolutionary.",
    rating: 5,
    avatar: "👩‍🏫",
  },
];

export function TestimonialsSection() {
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    const section = document.querySelector('[data-testimonials-section]');
    if (section) observer.observe(section);

    return () => {
      if (section) observer.unobserve(section);
    };
  }, []);

  return (
    <section 
      data-testimonials-section
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif text-amber-200 mb-3 sm:mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            See what our users say about their FutureSeer experience
          </p>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative p-6 sm:p-8 rounded-2xl bg-slate-900/30 backdrop-blur-sm border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300 card-depth"
            >
              {/* Quote icon */}
              <Quote className="absolute top-4 right-4 w-8 h-8 text-amber-500/20" />
              
              {/* Rating stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-sm sm:text-base text-slate-300 mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-amber-200">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-slate-400">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

