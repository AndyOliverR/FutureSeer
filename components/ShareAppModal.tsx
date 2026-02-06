"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Mail, MessageCircle, Copy, Check, Facebook, Twitter, MessageSquare, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-mobile";

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareAppModal({ isOpen, onClose }: ShareAppModalProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);

  const shareLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://futureseer.app"}?ref=${userProfile?.referralCode || user?.uid || "anonymous"}`;
  const defaultShareMessage =
    "I've discovered this amazing AI-powered mystical platform called FutureSeer! It combines ancient wisdom with modern AI to provide personalized divination insights. You should check it out! ✨🔮";

  useEffect(() => {
    setHasNativeShare(typeof navigator !== "undefined" && "share" in navigator);
  }, []);

  const handleNativeShare = async () => {
    if (hasNativeShare && navigator.share) {
      try {
        await navigator.share({
          title: "FutureSeer - AI-Powered Mystic",
          text: defaultShareMessage,
          url: shareLink,
        });
        toast({
          title: "Shared! ✨",
          description: "Thank you for sharing FutureSeer!",
        });
      } catch (err: unknown) {
        if (err && typeof err === "object" && "name" in err && (err as { name: string }).name !== "AbortError") {
          toast({
            title: "Share Failed",
            description: "Please try another sharing method",
            variant: "destructive",
          });
        }
      }
    }
  };

  const getShareUrls = () => {
    const encodedMessage = encodeURIComponent(defaultShareMessage);
    const encodedUrl = encodeURIComponent(shareLink);
    return {
      whatsapp: `https://web.whatsapp.com/send?text=${encodedMessage}%20${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodeURIComponent("Check out FutureSeer!")}&body=${encodedMessage}%20${encodedUrl}`,
      sms: `sms:?body=${encodedMessage}%20${encodedUrl}`,
    };
  };

  const handleSocialShare = (platform: "whatsapp" | "twitter" | "facebook" | "linkedin" | "email" | "sms") => {
    const urls = getShareUrls();
    const url = urls[platform];
    if (platform === "email" || platform === "sms") {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "width=600,height=400");
    }
    toast({
      title: `Opening ${platform.charAt(0).toUpperCase() + platform.slice(1)}...`,
      description: "Share with your friends!",
    });
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast({
        title: "Link Copied! 📋",
        description: "Share link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Share FutureSeer"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            className={
              isMobile
                ? "fixed bottom-0 left-0 right-0 w-full max-h-[90vh] overflow-y-auto bg-[var(--m3-surface-container-high)]/95 backdrop-blur-xl border border-[var(--m3-outline-variant)] border-b-0 rounded-t-2xl m3-elevation-3 m3-elevation-transition m3-gpu-accelerated z-[9999]"
                : "fixed bg-[var(--m3-surface-container-high)]/95 backdrop-blur-xl border border-[var(--m3-outline-variant)] rounded-2xl m3-elevation-3 hover:m3-elevation-4 m3-elevation-transition m3-gpu-accelerated w-[calc(100vw-32px)] sm:w-[400px] md:w-[500px] h-auto max-h-[90vh] overflow-y-auto left-1/2 -translate-x-1/2 bottom-4 sm:bottom-16 z-[9999]"
            }
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[var(--m3-outline-variant)]">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-[var(--m3-secondary-container)] rounded-lg">
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--m3-on-secondary-container)]" />
                </div>
                <div>
                  <h3 className="m3-title-large text-[var(--m3-on-surface)]">Share FutureSeer</h3>
                  <p className="m3-label-medium text-[var(--m3-on-surface-variant)]">Spread the word with friends</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-secondary)] hover:bg-[var(--m3-secondary-container)] rounded-lg m3-transition-standard p-1.5 sm:p-2"
                aria-label="Close"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden />
              </Button>
            </div>

            <div className="overflow-y-auto max-h-[400px] sm:max-h-[450px] p-3 sm:p-4 space-y-4">
              {hasNativeShare && (
                <Button
                  variant="filled"
                  onClick={handleNativeShare}
                  className="w-full bg-[var(--m3-primary)] hover:bg-[var(--m3-primary)]/90 text-[var(--m3-on-primary)] font-semibold py-3 rounded-lg"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share with Native Share
                </Button>
              )}
              <div>
                <p className="text-sm font-medium text-[var(--m3-on-surface-variant)] mb-2">Share on Social Media</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare("whatsapp")}
                    className="flex flex-col items-center gap-1 p-3 bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] hover:bg-[var(--m3-primary-container)] hover:text-[var(--m3-primary)] rounded-xl h-auto"
                    aria-label="Share on WhatsApp"
                  >
                    <MessageSquare className="w-5 h-5" aria-hidden />
                    <span className="text-xs">WhatsApp</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare("twitter")}
                    className="flex flex-col items-center gap-1 p-3 bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] hover:bg-[var(--m3-primary-container)] hover:text-[var(--m3-primary)] rounded-xl h-auto"
                    aria-label="Share on Twitter/X"
                  >
                    <Twitter className="w-5 h-5" aria-hidden />
                    <span className="text-xs">Twitter</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare("facebook")}
                    className="flex flex-col items-center gap-1 p-3 bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] hover:bg-[var(--m3-primary-container)] hover:text-[var(--m3-primary)] rounded-xl h-auto"
                    aria-label="Share on Facebook"
                  >
                    <Facebook className="w-5 h-5" aria-hidden />
                    <span className="text-xs">Facebook</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare("linkedin")}
                    className="flex flex-col items-center gap-1 p-3 bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] hover:bg-[var(--m3-primary-container)] hover:text-[var(--m3-primary)] rounded-xl h-auto"
                    aria-label="Share on LinkedIn"
                  >
                    <Linkedin className="w-5 h-5" aria-hidden />
                    <span className="text-xs">LinkedIn</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare("email")}
                    className="flex flex-col items-center gap-1 p-3 bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] hover:bg-[var(--m3-primary-container)] hover:text-[var(--m3-primary)] rounded-xl h-auto"
                    aria-label="Share via Email"
                  >
                    <Mail className="w-5 h-5" aria-hidden />
                    <span className="text-xs">Email</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSocialShare("sms")}
                    className="flex flex-col items-center gap-1 p-3 bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] hover:bg-[var(--m3-primary-container)] hover:text-[var(--m3-primary)] rounded-xl h-auto"
                    aria-label="Share via SMS"
                  >
                    <MessageCircle className="w-5 h-5" aria-hidden />
                    <span className="text-xs">SMS</span>
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--m3-on-surface-variant)] mb-2">Or copy link</p>
                <div className="flex gap-2">
                  <Input
                    value={shareLink}
                    readOnly
                    onClick={(e) => {
                      (e.target as HTMLInputElement).select();
                      handleCopyLink();
                    }}
                    className="flex-1 bg-[var(--m3-surface-container-low)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] rounded-lg cursor-pointer"
                    title="Click to select and copy"
                  />
                  <Button
                    onClick={handleCopyLink}
                    aria-label={copied ? "Link copied" : "Copy share link"}
                    className={`px-3 rounded-lg h-9 ${copied ? "bg-green-600 text-white" : "bg-[var(--m3-primary)] hover:bg-[var(--m3-primary)]/90 text-[var(--m3-on-primary)]"}`}
                  >
                    {copied ? <Check className="w-4 h-4" aria-hidden /> : <Copy className="w-4 h-4" aria-hidden />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
