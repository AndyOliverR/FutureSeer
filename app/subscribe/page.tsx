"use client";

import Link from "next/link";
import { devLog } from '@/lib/devLogger';
import { useSubscribe } from "@/hooks/useSubscribe";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Users, Crown, Sparkles, TrendingUp, Shield, BookOpen, Heart, LogIn } from "lucide-react";
const PLAN_DISPLAY_NAME: Record<string, string> = {
  'power-user-trial': 'Trial',
  'buy-coffee': 'Coffee',
  'treat-me': 'Treat',
  'festive-hamper': 'Hamper',
};

export default function SubscribePage() {
  const { user } = useAuth();
  const {
    loading,
    error,
    subscriptionConfig,
    subscribeToPlan,
    trackPricingEvent,
  } = useSubscribe();

  const handleSubscribe = async (planId: string) => {
    try {
      trackPricingEvent('plan_selected', planId);
      await subscribeToPlan(planId);
    } catch (err) {
      devLog.error("Subscription error:", err, 'page');
    }
  };

  const handlePlanHover = (planId: string) => {
    trackPricingEvent('plan_hovered', planId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cosmic pricing options...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <Zap className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Error Loading Subscriptions</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 starfield-ultra-sharp">
      <div className="max-w-7xl mx-auto">
        {/* Sign-in CTA for guests */}
        {!user && (
          <Card className="mb-8 border-amber-500/40 bg-amber-500/10">
            <CardContent className="py-4 flex flex-wrap items-center justify-center gap-4">
              <p className="text-amber-200 font-medium">
                Sign in to choose a paid plan and support FutureSeer.
              </p>
              <Button asChild className="bg-amber-600 hover:bg-amber-500 text-slate-900">
                <Link href="/signin?redirect=/subscribe">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign in
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-amber-300 mb-6">
            Choose Your Cosmic Path
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Embark on a mystical journey with AI-powered divination. From curious seekers to cosmic masters, 
            find your perfect level of spiritual guidance.
          </p>
        </div>

        {/* Value Proposition */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-amber-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">AI-Powered Insights</h3>
            <p className="text-gray-400 leading-relaxed">
              Advanced artificial intelligence trained on ancient wisdom to provide personalized cosmic guidance
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Mystical Community</h3>
            <p className="text-gray-400 leading-relaxed">
              Connect with fellow seekers, share insights, and learn from certified astrologers and mystics
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-purple-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">Continuous Growth</h3>
            <p className="text-gray-400 leading-relaxed">
              Your AI learns and adapts to your unique spiritual journey, providing ever-deeper insights
            </p>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 mb-16">
          {subscriptionConfig.plans.map((plan) => (
            <Card
              key={plan.id}
              onMouseEnter={() => handlePlanHover(plan.id)}
              className={`relative overflow-hidden transition-all duration-300  ${
                plan.popular
                  ? "border-2 border-amber-500 shadow-lg shadow-amber-500/20"
                  : plan.id === "power-user-trial"
                  ? "border-2 border-green-500 shadow-lg shadow-green-500/20"
                  : "border border-gray-700"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-4 py-2 text-sm font-bold rounded-bl-lg">
                  <Star className="w-4 h-4 inline mr-1" />
                  Most Popular
                </div>
              )}
              
              {plan.id === "power-user-trial" && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-emerald-500 text-black px-4 py-2 text-sm font-bold rounded-bl-lg">
                  <Zap className="w-4 h-4 inline mr-1" />
                  Free Forever
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-amber-300 mb-2">
                  {plan.name}
                </CardTitle>
                <div className="text-4xl font-bold text-white mb-2">
                  {plan.price === 0 ? (
                    "Free"
                  ) : (
                    <>
                      {plan.formatted ?? `${plan.currencySymbol ?? '$'}${plan.price}`}
                      <span className="text-lg text-gray-400 font-normal">
                        /{plan.interval}
                      </span>
                    </>
                  )}
                </div>
                {plan.originalPrice && (
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-lg text-gray-400 line-through">
                      ${plan.originalPrice}
                    </span>
                    <Badge className="bg-green-500 text-white">
                      Save ${plan.savings}
                    </Badge>
                  </div>
                )}
                <p className="text-sm text-gray-400 mt-2">
                  {plan.targetAudience}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start text-gray-300">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={!subscriptionConfig.available}
                  className={`w-full ${
                    plan.id === "power-user-trial"
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      : plan.popular
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-600 hover:to-yellow-600"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  }`}
                >
                  {subscriptionConfig.available ? (
                    plan.id === "power-user-trial" ? "Start Free" : `Choose ${plan.name}`
                  ) : (
                    "Coming Soon"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Community Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-amber-300 text-center mb-12">
            Join Our Safe Mystical Community
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {subscriptionConfig.communityFeatures.map((feature, index) => (
              <Card key={index} className="border border-gray-700 hover:border-amber-500/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      {feature.name.includes("Safety") ? (
                        <Shield className="w-6 h-6 text-amber-500" />
                      ) : feature.name.includes("Expert") ? (
                        <Star className="w-6 h-6 text-amber-500" />
                      ) : feature.name.includes("Study") ? (
                        <BookOpen className="w-6 h-6 text-amber-500" />
                      ) : (
                        <Users className="w-6 h-6 text-amber-500" />
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{feature.description}</p>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {feature.availableIn.map((plan) => (
                        <Badge key={plan} variant="outline" className="text-xs">
                          {PLAN_DISPLAY_NAME[plan] ?? plan}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Value Tiers */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-amber-300 text-center mb-12">
            Value Progression
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {subscriptionConfig.features.map((tier, index) => (
              <Card key={index} className="border border-gray-700">
                <CardHeader>
                  <CardTitle className="text-xl text-amber-300 text-center">
                    {tier.tier}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 text-center mb-4">{tier.value}</p>
                  <ul className="space-y-2">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-300 text-sm">
                        <Check className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Safety & Trust Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-amber-300 text-center mb-12">
            Your Safety is Our Priority
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border border-green-500/30 bg-green-500/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Safety</h3>
                  <p className="text-gray-400">
                    Advanced AI moderation with real-time content filtering and crisis detection
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-blue-500/30 bg-blue-500/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Human Oversight</h3>
                  <p className="text-gray-400">
                    Dedicated moderation team with mental health professionals for crisis situations
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-purple-500/30 bg-purple-500/5">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Mental Health First</h3>
                  <p className="text-gray-400">
                    Zero tolerance for harmful content with immediate crisis response protocols
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8 text-center">
            <Card className="max-w-4xl mx-auto bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold text-amber-300 mb-4">
                  Independent Expert Network
                </h3>
                <p className="text-gray-300 mb-4">
                  Our experts are independent community contributors who share knowledge voluntarily. 
                  They are verified through AI-powered background checks and community feedback, 
                  but operate independently of FutureSeer.
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
                  <div>
                    <div className="font-semibold text-amber-300 mb-1">🔍 AI Verification</div>
                    <div>Automated background checks and credential verification</div>
                  </div>
                  <div>
                    <div className="font-semibold text-amber-300 mb-1">🌟 Community Driven</div>
                    <div>Experts contribute freely to help fellow seekers</div>
                  </div>
                  <div>
                    <div className="font-semibold text-amber-300 mb-1">🛡️ Safety First</div>
                    <div>Strict guidelines with immediate violation response</div>
                  </div>
                  <div>
                    <div className="font-semibold text-amber-300 mb-1">📧 Transparent Process</div>
                    <div>Clear communication about all moderation decisions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Coming Soon Notice */}
        {!subscriptionConfig.available && (
          <div className="text-center">
            <Card className="max-w-3xl mx-auto bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center justify-center mb-6">
                  <Crown className="w-12 h-12 text-amber-500 mr-3" />
                  <h3 className="text-2xl font-semibold text-amber-300">
                    Payment System Coming Soon
                  </h3>
                </div>
                <p className="text-gray-300 text-lg mb-6">
                  We're implementing a revolutionary payment system that will make your cosmic journey seamless and secure.
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-400">
                  <div>
                    <div className="font-semibold text-amber-300 mb-1">🔮 AI-Powered</div>
                    <div>Smart recommendations based on your journey</div>
                  </div>
                  <div>
                    <div className="font-semibold text-amber-300 mb-1">🌍 Global</div>
                    <div>Support for multiple currencies and regions</div>
                  </div>
                  <div>
                    <div className="font-semibold text-amber-300 mb-1">⚡ Instant</div>
                    <div>Immediate access to all features</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
