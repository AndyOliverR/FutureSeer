"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, User, BarChart3, MessageCircle, Users, Trophy, ArrowRight } from "lucide-react";

export function WelcomeGuide() {
  const [currentStep, setCurrentStep] = useState(0);
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  // Don't show the guide if still loading
  if (loading) return null;

  // If user is not authenticated, show a simple welcome message
  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed bottom-4 left-4 z-50 max-w-sm"
      >
        <Card className="backdrop-blur-md bg-slate-900/90 border border-amber-500/30 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" />
              <CardTitle className="text-lg text-amber-200">Welcome to FutureSeer! ✨</CardTitle>
            </div>
            <CardDescription className="text-slate-300">
              Click "Begin Your Journey" to start your mystical experience.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Button
              onClick={() => router.push("/signin")}
              className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-900 font-semibold"
            >
              Begin Your Journey
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const steps = [
    {
      title: "Complete Your Profile",
      description: "Add your birth details and photos for personalized readings",
      icon: <User className="h-8 w-8 text-amber-400" />,
      action: "Go to Profile",
      path: "/profile-setup",
      condition: !userProfile?.birthDate || !userProfile?.birthTime || !userProfile?.birthPlace
    },
    {
      title: "Explore Your Dashboard",
      description: "View your personalized insights and reading history",
      icon: <BarChart3 className="h-8 w-8 text-amber-400" />,
      action: "View Dashboard",
      path: "/dashboard",
      condition: userProfile?.birthDate && userProfile?.birthTime && userProfile?.birthPlace
    },
    {
      title: "Individual Divination Tools",
      description: "Explore specific occult fields: Astrology, Numerology, Tarot, and more",
      icon: <Sparkles className="h-8 w-8 text-amber-400" />,
      action: "Explore Tools",
      path: "/readings",
      condition: true
    },
    {
      title: "Ask the Seer",
      description: "Get personalized answers to your specific questions",
      icon: <MessageCircle className="h-8 w-8 text-amber-400" />,
      action: "Ask Questions",
      path: "/ask-seer",
      condition: true
    },
    {
      title: "AI Seer Chat",
      description: "Discuss your readings and get deeper insights from our AI",
      icon: <MessageCircle className="h-8 w-8 text-amber-400" />,
      action: "Chat with AI",
      path: "/chat",
      condition: true
    },
    {
      title: "Community & Gamification",
      description: "Connect with other seekers and earn achievements",
      icon: <Users className="h-8 w-8 text-amber-400" />,
      action: "Join Community",
      path: "/community",
      condition: true
    }
  ];

  const handleStepAction = (path: string) => {
    router.push(path);
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed bottom-4 left-4 z-50 max-w-sm"
    >
      <Card className="backdrop-blur-md bg-slate-900/90 border border-amber-500/30 shadow-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <CardTitle className="text-lg text-amber-200">Welcome to FutureSeer! ✨</CardTitle>
          </div>
          <CardDescription className="text-slate-300">
            Your mystical journey begins now. Let's guide you through your experience.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Current Step */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {steps[currentStep].icon}
              <div>
                <h3 className="font-semibold text-white">{steps[currentStep].title}</h3>
                <p className="text-sm text-slate-300">{steps[currentStep].description}</p>
              </div>
            </div>
            
            <Button
              onClick={() => handleStepAction(steps[currentStep].path)}
              className="w-full bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-900 font-semibold"
            >
              {steps[currentStep].action}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-between items-center">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === currentStep ? 'bg-amber-400' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="text-xs border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextStep}
                disabled={currentStep === steps.length - 1}
                className="text-xs border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Next
              </Button>
            </div>
          </div>

          {/* Quick Access */}
          <div className="pt-2 border-t border-slate-700">
            <p className="text-xs text-slate-400 mb-2">Quick Access:</p>
            <div className="flex flex-wrap gap-1">
              {steps.map((step, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(index)}
                  className={`text-xs h-6 px-2 ${
                    index === currentStep 
                      ? 'bg-amber-500/20 text-amber-300' 
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
} 