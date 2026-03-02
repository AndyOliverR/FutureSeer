"use client";

import { Badge, Award, TrendingUp, Users, MessageSquare, Star, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function PowerUserBenefits() {
  const benefits = [
    {
      icon: <Award className="w-6 h-6" />,
      title: "Early Adopter Badge",
      description: "Recognition as a founding member of the innovation experiment"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Attribution on Leaderboard",
      description: "Your name forever on the innovation leaderboard"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Shape Features",
      description: "Your feedback shapes the future of divination"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Improve Accuracy",
      description: "Your usage improves accuracy and precision for everyone"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Innovation Team",
      description: "You're part of the innovation team, not just a customer"
    },
    {
      icon: <Crown className="w-6 h-6" />,
      title: "Priority Access",
      description: "Early access to new features and tools"
    }
  ];

  const impactPoints = [
    "Your contribution makes FutureSeer accessible to all",
    "Your usage data improves precision and quality",
    "Your feedback is implemented within 24-48 hours",
    "Your name forever on the innovation leaderboard"
  ];

  return (
    <div className="space-y-12 mb-16">
      {/* Power User Benefits Grid */}
      <div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 text-center">
          Power User <span className="text-amber-400">Benefits</span>
        </h2>
        <p className="text-center text-white/80 mb-8 max-w-2xl mx-auto">
          As a power user and early adopter, you're not just using FutureSeer—you're building it with us.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-amber-500/20 text-amber-400 flex-shrink-0">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-amber-400 font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-white/80 text-sm">{benefit.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contribution Impact */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 rounded-2xl p-8 md:p-12">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
          Your <span className="text-amber-400">Contribution Impact</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {impactPoints.map((point, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
              <p className="text-white/80 text-base">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
