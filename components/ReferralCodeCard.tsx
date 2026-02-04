"use client";

import { useState, useEffect } from 'react';
import { Copy, Check, Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { getReferralStats } from '@/lib/referralUtils';
import { getFirebaseDB } from '@/lib/firebase';

interface ReferralCodeCardProps {
  userId: string;
}

export function ReferralCodeCard({ userId }: ReferralCodeCardProps) {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [referralStats, setReferralStats] = useState({
    referralCode: '',
    referralCount: 0,
    freeMonthsRemaining: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMissingCode = async () => {
    if (isGenerating) return; // Prevent duplicate calls
    
    setIsGenerating(true);
    setError(null);
    try {
      const response = await fetch('/api/referrals/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Complete your profile to get a referral code.');
          return;
        }
        throw new Error('Failed to generate referral code');
      }

      const data = await response.json();
      
      if (data.success && data.referralCode) {
        setReferralStats(prev => ({
          ...prev,
          referralCode: data.referralCode
        }));
        setError(null);
        toast({
          title: "Success!",
          description: "Your referral code has been generated",
          duration: 3000
        });
      }
    } catch (err) {
      console.error('Error generating referral code:', err);
      setError('Failed to generate referral code. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (userId) {
      const fetchStats = async () => {
        try {
          const db = getFirebaseDB();
          if (db) {
            const stats = await getReferralStats(userId, db);
            
            if (!isMounted) return;
            
            setReferralStats(stats);
            
            // Auto-generate if missing
            if (!stats.referralCode && isMounted) {
              await generateMissingCode();
            }
          }
        } catch (error) {
          console.error('Error fetching referral stats:', error);
          if (isMounted) {
            setError('Failed to load referral information');
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };
      fetchStats();
    }

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleCopyCode = () => {
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

  const handleCopyLink = () => {
    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://futureseer.app'}?ref=${referralStats.referralCode}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    toast({
      title: "Link copied!",
      description: "Share link copied to clipboard",
      duration: 2000
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShare = (platform: string) => {
    const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://futureseer.app'}?ref=${referralStats.referralCode}`;
    const shareText = "Join me on FutureSeer - AI-powered mystic insights!";

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`);
        break;
    }
  };

  if (isLoading) {
    return (
      <Card elevation={1} className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 rounded-2xl">
        <CardContent className="p-6 text-center">
          <div className="text-white/80 m3-body-medium">Loading referral information...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card elevation={2} className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 rounded-2xl">
      <CardContent className="p-6">
        {/* Referral Code Display */}
        <div className="mb-6">
          <label className="block text-amber-400 m3-label-medium mb-2 font-semibold">Your Referral Code</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 px-4 py-3 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 rounded-lg text-amber-400 font-mono m3-body-large">
              {error ? (
                <div className="flex flex-col gap-2">
                  <div className="text-red-400 m3-body-small">{error}</div>
                  <Button
                    onClick={generateMissingCode}
                    disabled={isGenerating}
                    className="m3-body-small bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-red-500/30 hover:border-red-500/50 transition-all duration-300 hover:scale-105 text-red-400 w-full m3-ripple m3-button-bounce"
                    size="sm"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Retry'
                    )}
                  </Button>
                </div>
              ) : isGenerating ? (
                <div className="flex items-center gap-2 text-amber-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="m3-body-medium">Generating your unique referral code...</span>
                </div>
              ) : (
                referralStats.referralCode || 'Loading...'
              )}
            </div>
            <Button
              onClick={handleCopyCode}
              className="px-4 py-3 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 text-amber-400 m3-ripple m3-button-bounce"
              disabled={!referralStats.referralCode || error !== null}
            >
              {copiedCode ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-6 p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 rounded-lg">
          <h4 className="text-amber-400 m3-title-small font-semibold mb-3">How Referrals Work</h4>
          <ul className="space-y-2 m3-body-small text-white/80">
            <li>• Share your code with friends</li>
            <li>• They get their first month free</li>
            <li>• You get an additional free month (₹99 credit)</li>
            <li>• Stack unlimited free months!</li>
          </ul>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-3 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 rounded-lg text-center">
            <div className="m3-headline-small font-bold text-amber-400">{referralStats.referralCount}</div>
            <div className="m3-body-small text-white/80">Friends Referred</div>
          </div>
          <div className="p-3 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 rounded-lg text-center">
            <div className="m3-headline-small font-bold text-amber-400">{referralStats.freeMonthsRemaining}</div>
            <div className="m3-body-small text-white/80">Free Months Left</div>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleCopyLink}
            className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 text-amber-400 m3-label-large font-semibold m3-ripple m3-button-bounce"
            disabled={!referralStats.referralCode || error !== null || isGenerating}
          >
            {copiedLink ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            Copy Share Link
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => handleShare('whatsapp')}
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 text-amber-400 m3-label-medium m3-ripple m3-button-bounce"
              disabled={!referralStats.referralCode || error !== null || isGenerating}
            >
              <Share2 className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
            <Button
              onClick={() => handleShare('twitter')}
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 transition-all duration-300 hover:scale-105 text-amber-400 m3-label-medium m3-ripple m3-button-bounce"
              disabled={!referralStats.referralCode || error !== null || isGenerating}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Twitter
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
