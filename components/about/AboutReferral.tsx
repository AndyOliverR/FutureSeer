"use client";

import { useState, useEffect } from 'react';
import { devLog } from '@/lib/devLogger';
import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';
import { getReferralStats } from '@/lib/referralUtils';
import { getFirebaseDB } from '@/lib/firebase';
import { safeCopyToClipboard } from '@/lib/safeClipboard';
import { AboutSection } from './AboutSection';
import { motion } from 'framer-motion';

export function AboutReferral() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralStats, setReferralStats] = useState({
    referralCode: '',
    referralCount: 0,
    freeMonthsRemaining: 0
  });
  const [copiedCode, setCopiedCode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      const fetchReferralStats = async () => {
        try {
          setLoading(true);
          const db = getFirebaseDB();
          if (db) {
            const stats = await getReferralStats(user.uid, db);
            setReferralStats(stats);
          }
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            devLog.debug('Error fetching referral stats:', error);
          }
        } finally {
          setLoading(false);
        }
      };
      fetchReferralStats();
    }
  }, [user]);

  const handleCopyReferralCode = async () => {
    if (!referralStats.referralCode) return;
    const ok = await safeCopyToClipboard(referralStats.referralCode);
    if (ok) {
      setCopiedCode(true);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
        duration: 2000
      });
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleShareReferral = async (platform: string) => {
    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://futureseer.app'}?ref=${referralStats.referralCode}`;
    const shareText = "Join me on FutureSeer - AI-powered mystic insights!";

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
        break;
      case 'copy':
        if (await safeCopyToClipboard(shareUrl)) {
          toast({
            title: "Link copied!",
            description: "Share link copied to clipboard",
            duration: 2000
          });
        }
        break;
    }
  };

  if (!user) return null;

  return (
    <AboutSection 
      title="Referral Program" 
      subtitle="Share with friends, everyone benefits"
    >
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Referral Card */}
        <div className="p-6 sm:p-8 bg-surface-container rounded-[32px] border border-outline-variant shadow-lg">
          {/* Referral Code Display */}
          <div className="mb-8">
            <label className="block text-surface-on-variant text-xs uppercase tracking-widest font-bold mb-3">Your Referral Code</label>
            <div className="flex items-center gap-2 p-1 bg-surface-container-low rounded-2xl border border-outline-variant">
              <div className="flex-1 px-4 py-2 text-amber-400 font-mono text-xl font-bold tracking-wider">
                {loading ? '...' : (referralStats.referralCode || '---')}
              </div>
              <Button
                onClick={handleCopyReferralCode}
                className="h-12 px-6 bg-primary text-on-primary rounded-xl font-bold"
                disabled={!referralStats.referralCode || loading}
              >
                {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* How It Works */}
          <div className="mb-8 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest opacity-70">How It Works</h4>
            <div className="space-y-3">
              {[
                "Share your code with friends",
                "They get first month free (default)",
                "YOU get an additional month free",
                "Stack unlimited free months!"
              ].map((text, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="shrink-0 w-6 h-6 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-xs font-bold">
                    {i + 1}
                  </div>
                  <span className="text-sm text-surface-on font-normal">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Grid */}
          {!loading && (
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant text-center">
                <div className="text-3xl font-bold text-amber-400">{referralStats.referralCount}</div>
                <div className="text-[10px] text-surface-on-variant uppercase font-bold tracking-tighter">Referred</div>
              </div>
              <div className="p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant text-center">
                <div className="text-3xl font-bold text-green-400">{referralStats.freeMonthsRemaining}</div>
                <div className="text-[10px] text-surface-on-variant uppercase font-bold tracking-tighter">Free Months</div>
              </div>
            </div>
          )}

          {/* Share Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleShareReferral('whatsapp')}
              className="bg-[#25D366] hover:bg-[#25D366]/90 text-white rounded-2xl h-12 font-bold"
              disabled={!referralStats.referralCode}
            >
              <Share2 className="w-4 h-4 mr-2" /> WhatsApp
            </Button>
            <Button
              onClick={() => handleShareReferral('copy')}
              variant="outline"
              className="border-outline-variant text-surface-on rounded-2xl h-12 font-bold"
              disabled={!referralStats.referralCode}
            >
              <Copy className="w-4 h-4 mr-2" /> Copy Link
            </Button>
          </div>
        </div>
      </div>
    </AboutSection>
  );
}
