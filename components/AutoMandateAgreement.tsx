"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

interface AutoMandateAgreementProps {
  selectedPlan: 'power-user-trial' | 'buy-coffee' | 'treat-me' | 'festive-hamper';
  onAgreementAccepted: (accepted: boolean) => void;
}

export function AutoMandateAgreement({
  selectedPlan,
  onAgreementAccepted,
}: AutoMandateAgreementProps) {
  const [agreed, setAgreed] = useState(false);
  const [showFullTerms, setShowFullTerms] = useState(false);

  const handleAgreementChange = (checked: boolean) => {
    setAgreed(checked);
    onAgreementAccepted(checked);
  };

  const isTrial = selectedPlan === 'power-user-trial';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Card className="bg-slate-900/40 border-amber-500/30 backdrop-blur-xl">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/30">
              <FileText className="w-6 h-6 text-amber-400" />
            </div>
            <CardTitle className="text-xl font-serif text-white">
              Join the Innovation Team
            </CardTitle>
          </div>
          <CardDescription className="text-slate-300 font-serif">
            {isTrial
              ? 'Agree to support the innovation experiment after your free 30 days'
              : 'Agree to support the innovation experiment with your contribution'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Main Agreement */}
          <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <Checkbox
              id="auto-mandate-agreement"
              checked={agreed}
              onCheckedChange={(checked) => handleAgreementChange(checked === true)}
              className="mt-1"
            />
            <Label
              htmlFor="auto-mandate-agreement"
              className="text-sm text-slate-200 cursor-pointer leading-relaxed"
            >
              <span className="font-semibold text-amber-300">
                I agree to support the FutureSeer innovation experiment
              </span>
              {isTrial ? (
                <>
                  {' '}
                  after my free 30 days. I understand that my contribution will automatically continue
                  to support the innovation, but I can cancel anytime with no questions asked.
                </>
              ) : (
                <>
                  {' '}
                  with my selected contribution tier. I understand that my contribution will
                  automatically continue to support the innovation, but I can cancel anytime with no
                  questions asked.
                </>
              )}
            </Label>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-2 p-3 bg-slate-800/50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-400" />
              <span className="text-xs text-slate-300">Cancel Anytime</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 bg-slate-800/50 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-400" />
              <span className="text-xs text-slate-300">No Commitment</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 bg-slate-800/50 rounded-lg">
              <FileText className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-slate-300">Full Control</span>
            </div>
          </div>

          {/* Regulatory Compliance (Subtle) */}
          <div className="pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={() => setShowFullTerms(!showFullTerms)}
              className="text-xs text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <LinkIcon className="w-3 h-3" />
              {showFullTerms ? 'Hide' : 'Show'} regulatory compliance details
            </button>

            {showFullTerms && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-3 bg-slate-800/50 rounded-lg text-xs text-slate-400 space-y-2"
              >
                <p>
                  <strong className="text-slate-300">Auto-Mandate Agreement:</strong> By agreeing,
                  you authorize FutureSeer to automatically charge your payment method for recurring
                  contributions according to your selected plan. This authorization is required for
                  regulatory compliance (RBI guidelines for recurring payments in India, similar
                  regulations in other countries).
                </p>
                <p>
                  <strong className="text-slate-300">Your Rights:</strong> You can cancel this
                  authorization at any time through your profile settings. Cancellation will take
                  effect at the end of your current billing cycle. No charges will be made after
                  cancellation.
                </p>
                <p>
                  <strong className="text-slate-300">Transparency:</strong> You will receive email
                  notifications before any charges are made. All charges are clearly displayed in
                  your account.
                </p>
              </motion.div>
            )}
          </div>

          {/* Terms Links */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-400">
              Read our{' '}
              <Link href="/terms" className="text-amber-400 hover:text-amber-300 underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-amber-400 hover:text-amber-300 underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
