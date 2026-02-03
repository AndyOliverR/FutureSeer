"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, CreditCard, X, Coffee, Gift, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CancelSubscriptionModal } from './CancelSubscriptionModal';
import { UserProfile } from '@/lib/firebase';

interface SubscriptionStatusProps {
  userProfile: UserProfile | null;
  onCancel?: () => void;
  onUpdatePaymentClick?: () => void;
}

export function SubscriptionStatus({ userProfile, onCancel, onUpdatePaymentClick }: SubscriptionStatusProps) {
  const [showCancelModal, setShowCancelModal] = useState(false);

  if (!userProfile) {
    return null;
  }

  const { subscriptionStatus, selectedPlan, trialEndDate, nextBillingDate, subscriptionId } = userProfile;

  // Calculate days remaining in trial
  const getTrialDaysRemaining = () => {
    if (!trialEndDate || subscriptionStatus !== 'trial') return 0;
    const now = Math.floor(Date.now() / 1000);
    const days = Math.ceil((trialEndDate - now) / (24 * 60 * 60));
    return Math.max(0, days);
  };

  const getPlanName = () => {
    switch (selectedPlan) {
      case 'power-user-trial':
        return 'Power User Trial';
      case 'buy-coffee':
        return 'Coffee (Monthly)';
      case 'treat-me':
        return 'Treat (Quarterly)';
      case 'festive-hamper':
        return 'Hamper (Annual)';
      default:
        return 'No Plan Selected';
    }
  };

  const getPlanIcon = () => {
    const iconClass = "w-5 h-5 text-amber-400";
    switch (selectedPlan) {
      case 'power-user-trial':
        return <Sparkles className={iconClass} />;
      case 'buy-coffee':
        return <Coffee className={iconClass} />;
      case 'treat-me':
      case 'festive-hamper':
        return <Gift className={iconClass} />;
      default:
        return <CreditCard className={iconClass} />;
    }
  };

  const getStatusBadge = () => {
    switch (subscriptionStatus) {
      case 'trial':
        return <Badge className="bg-slate-800/50 text-amber-400 border border-amber-500/30 m3-label-small">Free Trial</Badge>;
      case 'active':
        return <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/50 m3-label-small">Active</Badge>;
      case 'cancelled':
        return <Badge className="bg-slate-800/50 text-white/80 border border-amber-500/30 m3-label-small">Cancelled</Badge>;
      case 'expired':
        return <Badge className="bg-red-500/20 text-red-400 border border-red-500/50 m3-label-small">Expired</Badge>;
      default:
        return null;
    }
  };

  const trialDaysRemaining = getTrialDaysRemaining();
  const isTrial = subscriptionStatus === 'trial';
  const isActive = subscriptionStatus === 'active';
  const isCancelled = subscriptionStatus === 'cancelled';

  return (
    <>
      <Card elevation={2} className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getPlanIcon()}
              <div>
                <CardTitle className="m3-headline-small font-serif text-amber-400">Your Contribution</CardTitle>
                <CardDescription className="text-white/80 m3-body-medium">
                  {getPlanName()}
                </CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Trial Status */}
          {isTrial && trialDaysRemaining > 0 && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-amber-400 m3-title-small font-semibold">
                    {trialDaysRemaining} {trialDaysRemaining === 1 ? 'day' : 'days'} left in your free trial
                  </p>
                  <p className="m3-body-small text-white/80">
                    Your contribution will start automatically after the trial ends
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Active Subscription */}
          {isActive && nextBillingDate && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-amber-400 m3-title-small font-semibold">Next Contribution</p>
                  <p className="m3-body-small text-white/80">
                    {new Date(nextBillingDate * 1000).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cancelled Status */}
          {isCancelled && (
            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <X className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-amber-400 m3-title-small font-semibold">Contribution Cancelled</p>
                  <p className="m3-body-small text-white/80">
                    You can rejoin the innovation experiment anytime
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Update payment method */}
          {onUpdatePaymentClick && !isCancelled && (
            <Button
              onClick={onUpdatePaymentClick}
              variant="outline"
              className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 text-amber-400 m3-ripple m3-button-bounce"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Update payment method
            </Button>
          )}

          {/* Cancel Button */}
          {!isCancelled && (
            <Button
              onClick={() => setShowCancelModal(true)}
              variant="outline"
              className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-red-500/30 hover:border-red-500/50 transition-all duration-300 hover:scale-105 text-red-400 m3-ripple m3-button-bounce"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel Contribution
            </Button>
          )}

          {/* Info */}
          <div className="m3-body-small text-center text-white/80 pt-2 border-t border-amber-500/30">
            <p>
              You're part of the FutureSeer innovation experiment.{' '}
              <span className="text-amber-400">Thank you for your support!</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <CancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={async () => {
          if (subscriptionId && userProfile?.uid) {
            try {
              const response = await fetch('/api/payments/cancel-subscription', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  subscriptionId,
                  userId: userProfile.uid,
                }),
              });

              if (!response.ok) {
                throw new Error('Failed to cancel subscription');
              }

              setShowCancelModal(false);
              if (onCancel) {
                onCancel();
              }
            } catch (error: any) {
              console.error('Error cancelling subscription:', error);
            }
          }
        }}
      />
    </>
  );
}
