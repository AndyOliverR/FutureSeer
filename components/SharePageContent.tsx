"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { X, Share2, Mail, MessageCircle, Copy, Check, Facebook, Twitter, MessageSquare, Linkedin } from "lucide-react";

export function SharePageContent() {
  const router = useRouter();
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
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
    <>
      <div className="flex justify-end mb-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 border border-amber-500/30 rounded-lg"
          aria-label="Close"
        >
          <X className="w-4 h-4 mr-1" />
          Close
        </Button>
      </div>
      <div className="flex flex-col items-center text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-500/20 border border-amber-500/30 mb-4">
          <Share2 className="w-7 h-7 text-amber-400" />
        </div>
        <h1 className="text-2xl font-bold text-amber-400 mb-2">Share FutureSeer</h1>
        <p className="text-white/80 text-sm font-light">Spread the word with friends</p>
      </div>
      <div className="space-y-6">
        {hasNativeShare && (
          <Button
            variant="filled"
            onClick={handleNativeShare}
            className="w-full bg-amber-500 hover:bg-amber-500/90 text-slate-900 font-semibold py-3 rounded-lg"
          >
            <Share2 className="w-5 h-5 mr-2" />
            Share with Native Share
          </Button>
        )}
        <div>
          <p className="text-sm font-medium text-amber-400 mb-2">Share on Social Media</p>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={() => handleSocialShare("whatsapp")}
              className="flex flex-col items-center gap-1 p-3 bg-slate-800/50 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-xl h-auto"
              title="Share on WhatsApp"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="text-xs">WhatsApp</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialShare("twitter")}
              className="flex flex-col items-center gap-1 p-3 bg-slate-800/50 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-xl h-auto"
              title="Share on Twitter/X"
            >
              <Twitter className="w-5 h-5" />
              <span className="text-xs">Twitter</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialShare("facebook")}
              className="flex flex-col items-center gap-1 p-3 bg-slate-800/50 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-xl h-auto"
              title="Share on Facebook"
            >
              <Facebook className="w-5 h-5" />
              <span className="text-xs">Facebook</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialShare("linkedin")}
              className="flex flex-col items-center gap-1 p-3 bg-slate-800/50 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-xl h-auto"
              title="Share on LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
              <span className="text-xs">LinkedIn</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialShare("email")}
              className="flex flex-col items-center gap-1 p-3 bg-slate-800/50 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-xl h-auto"
              title="Share via Email"
            >
              <Mail className="w-5 h-5" />
              <span className="text-xs">Email</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialShare("sms")}
              className="flex flex-col items-center gap-1 p-3 bg-slate-800/50 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 rounded-xl h-auto"
              title="Share via SMS"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-xs">SMS</span>
            </Button>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-amber-400 mb-2">Or copy link</p>
          <div className="flex gap-2">
            <Input
              value={shareLink}
              readOnly
              onClick={(e) => {
                (e.target as HTMLInputElement).select();
                handleCopyLink();
              }}
              className="flex-1 bg-slate-800/50 border-amber-500/30 text-white rounded-lg cursor-pointer"
              title="Click to select and copy"
            />
            <Button
              onClick={handleCopyLink}
              aria-label={copied ? "Link copied" : "Copy share link"}
              className={`px-3 rounded-lg h-9 ${copied ? "bg-green-600 text-white" : "bg-amber-500 hover:bg-amber-500/90 text-slate-900"}`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
