"use client";

import { useSubscribe } from "@/hooks/useSubscribe";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap } from "lucide-react";

export default function SubscribePage() {
  const {
    loading,
    error,
    subscriptionConfig,
    subscribeToPlan,
  } = useSubscribe();

  const handleSubscribe = async (planId: string) => {
    try {
      await subscribeToPlan(planId);
    } catch (err) {
      console.error("Subscription error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription options...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-amber-300 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Unlock the full potential of FutureSeer with our premium subscription plans
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {subscriptionConfig.plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative overflow-hidden transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? "border-2 border-amber-500 shadow-lg shadow-amber-500/20"
                  : "border border-gray-700"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-amber-500 text-black px-3 py-1 text-sm font-bold rounded-bl-lg">
                  <Star className="w-4 h-4 inline mr-1" />
                  Most Popular
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-amber-300">
                  {plan.name}
                </CardTitle>
                <div className="text-4xl font-bold text-white">
                  ${plan.price}
                  <span className="text-lg text-gray-400 font-normal">
                    /{plan.interval}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-gray-300">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={!subscriptionConfig.available}
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-600 hover:to-yellow-600"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  }`}
                >
                  {subscriptionConfig.available ? (
                    `Subscribe to ${plan.name}`
                  ) : (
                    "Coming Soon"
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-amber-300 mb-8">
            What You'll Get
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Advanced AI Predictions
              </h3>
              <p className="text-gray-400">
                Get personalized insights powered by cutting-edge AI technology
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Premium Tools
              </h3>
              <p className="text-gray-400">
                Access to all 18+ divination tools and advanced features
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Priority Support
              </h3>
              <p className="text-gray-400">
                Get help when you need it with our dedicated support team
              </p>
            </div>
          </div>
        </div>

        {/* Coming Soon Notice */}
        {!subscriptionConfig.available && (
          <div className="mt-12 text-center">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/30">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-amber-500 mr-2" />
                  <h3 className="text-xl font-semibold text-amber-300">
                    Payment System Coming Soon
                  </h3>
                </div>
                <p className="text-gray-300">
                  We're working on implementing a new payment system. 
                  Subscribe to our newsletter to be notified when subscriptions are available!
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
