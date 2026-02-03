"use client";

import { useState, useEffect } from 'react';
import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/components/ui/use-toast';
import { getReferralStats } from '@/lib/referralUtils';
import { getFirebaseDB } from '@/lib/firebase';
import { AboutSection } from './AboutSection';

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
          // Silent error handling in production
          if (process.env.NODE_ENV === 'development') {
            console.debug('Error fetching referral stats:', error);
          }
        } finally {
          setLoading(false);
        }
      };
      fetchReferralStats();
    }
  }, [user]);

  const handleCopyReferralCode = () => {
    if (referralStats.referralCode) {
      navigator.clipboard.writeText(referralStats.referralCode);
      setCopiedCode(true);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
        duration: 2000
      });
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleShareReferral = (platform: string) => {
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
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Share link copied to clipboard",
          duration: 2000
        });
        break;
    }
  };

  // Don't render if user not logged in
  if (!user) {
    return null;
  }

  return (
    <AboutSection 
      title="Referral Program" 
      subtitle="Share with friends, everyone benefits"
    >
      <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 rounded-2xl backdrop-blur-xl">
        {/* Referral Code Display */}
        <div className="mb-8">
          <label className="block text-white/80 text-sm mb-2 font-light">Your Referral Code</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 bg-slate-800 border border-amber-500/30 rounded-lg text-amber-400 font-mono text-lg">
              {loading ? 'Loading...' : (referralStats.referralCode || 'Generating...')}
            </div>
            <Button
              onClick={handleCopyReferralCode}
              className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900"
              disabled={!referralStats.referralCode || loading}
            >
              {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-8 p-6 bg-slate-800/50 border border-amber-500/20 rounded-xl">
          <h4 className="text-lg font-semibold text-white mb-4">How It Works</h4>
          <ul className="space-y-3 text-white/70 font-light">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm font-semibold">1</span>
              <span>Share your code with friends</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm font-semibold">2</span>
              <span>They get first month free (default for everyone)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm font-semibold">3</span>
              <span>YOU get an additional month free (₹99 credit)</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm font-semibold">4</span>
              <span>Stack unlimited free months!</span>
            </li>
          </ul>
        </div>

        {/* Referral Stats */}
        {!loading && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-slate-800/50 border border-amber-500/20 rounded-lg text-center">
                <div className="text-3xl font-bold text-amber-400">{referralStats.referralCount}</div>
                <div className="text-sm text-white/60 font-light">Friends Referred</div>
              </div>
              <div className="p-4 bg-slate-800/50 border border-amber-500/20 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-400">{referralStats.freeMonthsRemaining}</div>
                <div className="text-sm text-white/60 font-light">Free Months Left</div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => handleShareReferral('whatsapp')}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={!referralStats.referralCode}
              >
                <Share2 className="w-4 h-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={() => handleShareReferral('twitter')}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                disabled={!referralStats.referralCode}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Twitter
              </Button>
              <Button
                onClick={() => handleShareReferral('copy')}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white"
                disabled={!referralStats.referralCode}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
            </div>
          </>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p className="text-white/60 text-sm font-light">Loading referral stats...</p>
          </div>
        )}
      </div>
    </AboutSection>
  );
}
