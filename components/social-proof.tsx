"use client";
import { Star, Users, TrendingUp } from "lucide-react";

export function SocialProof() {
  return (
    <section className="py-10 md:py-12 px-6 bg-slate-950/50">
      <div className="max-w-6xl mx-auto">
        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-400 mb-2">10,000+</div>
            <div className="text-slate-400 flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              Active Users
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-400 mb-2">50,000+</div>
            <div className="text-slate-400 flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Readings Generated
            </div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-amber-400 mb-2">4.9/5</div>
            <div className="text-slate-400 flex items-center justify-center gap-2">
              <Star className="w-4 h-4 fill-amber-400" />
              User Rating
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <h2 className="text-3xl font-serif text-amber-200 text-center mb-12">
          Trusted by Seekers Worldwide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-slate-900/50 border border-slate-700/50 backdrop-blur-sm hover:border-amber-500/30 transition-all duration-300"
            >
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 mb-4 italic">{testimonial.text}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center text-amber-300 font-semibold">
                  {testimonial.initial}
                </div>
                <div>
                  <div className="text-sm font-semibold text-amber-200">{testimonial.name}</div>
                  <div className="text-xs text-slate-500">{testimonial.location}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const testimonials = [
  {
    text: "The Vedic astrology insights were incredibly accurate. FutureSeer helped me understand my career path with clarity I never had before.",
    name: "Sarah M.",
    initial: "S",
    location: "New York, USA"
  },
  {
    text: "I was skeptical at first, but the AI-powered readings are remarkably personalized. The tarot spreads gave me guidance during a difficult time.",
    name: "James K.",
    initial: "J",
    location: "London, UK"
  },
  {
    text: "As a professional trader, I use FutureSeer's financial astrology tools. The planetary transit insights have improved my timing significantly.",
    name: "Priya R.",
    initial: "P",
    location: "Mumbai, India"
  }
];
