"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Share2, Mail, MessageCircle, Copy, Check, Facebook, Twitter, Linkedin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { ModalPortal } from "@/components/ui/ModalPortal";
import { safeCopyToClipboard } from "@/lib/safeClipboard";

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareAppModal({ isOpen, onClose }: ShareAppModalProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const shareLink = `${process.env.NEXT_PUBLIC_APP_URL || "https://futureseer.app"}?ref=${userProfile?.referralCode || user?.uid || "anonymous"}`;
  const defaultShareMessage = "I've discovered this amazing AI-powered mystical platform called FutureSeer! It combines ancient wisdom with modern AI. ✨🔮";

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  const handleCopyLink = async () => {
    const ok = await safeCopyToClipboard(shareLink);
    if (ok) {
      setCopied(true);
      toast({ title: "Link Copied! 📋", description: "Share link copied to clipboard" });
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast({ title: "Copy Failed", variant: "destructive" });
    }
  };

  const handleSharePlatform = (platformId: string) => {
    const text = `${defaultShareMessage}\n\n${shareLink}`;
    const encodedUrl = encodeURIComponent(shareLink);
    const encodedText = encodeURIComponent(defaultShareMessage);

    const open = (url: string) => {
      if (typeof window === "undefined") return;
      window.open(url, "_blank", "noopener,noreferrer");
    };

    switch (platformId) {
      case "whatsapp":
        open(`https://wa.me/?text=${encodeURIComponent(text)}`);
        break;
      case "twitter":
        open(
          `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`
        );
        break;
      case "facebook":
        open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`);
        break;
      case "linkedin":
        open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        );
        break;
      case "email":
        open(
          `mailto:?subject=${encodeURIComponent("FutureSeer")}&body=${encodeURIComponent(text)}`
        );
        break;
      case "sms":
        open(`sms:?&body=${encodeURIComponent(text)}`);
        break;
      default:
        break;
    }
  };

  return (
    <ModalPortal open={isOpen}>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={onClose}
            />

            <motion.div
              ref={contentRef}
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-surface-container-high border-t sm:border border-outline-variant rounded-t-3xl sm:rounded-3xl m3-elevation-3 overflow-hidden shadow-2xl z-[10001]"
              style={{ maxHeight: '90vh' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex flex-col h-full">
                <div className="flex items-center justify-between p-5 border-b border-outline-variant">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary-container rounded-xl">
                      <Share2 className="w-5 h-5 text-secondary-on-container" />
                    </div>
                    <div>
                      <h3 className="text-xl font-heading font-bold text-surface-on uppercase tracking-tight">Share FutureSeer</h3>
                      <p className="text-xs text-surface-on-variant">Spread the word with friends</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                <div className="p-5 space-y-6 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'whatsapp', icon: MessageSquare, label: 'WhatsApp' },
                      { id: 'twitter', icon: Twitter, label: 'Twitter' },
                      { id: 'facebook', icon: Facebook, label: 'Facebook' },
                      { id: 'linkedin', icon: Linkedin, label: 'LinkedIn' },
                      { id: 'email', icon: Mail, label: 'Email' },
                      { id: 'sms', icon: MessageCircle, label: 'SMS' },
                    ].map((platform) => (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => handleSharePlatform(platform.id)}
                        className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-surface-container-low border border-outline-variant hover:bg-primary-container transition-all group cursor-pointer"
                      >
                        <platform.icon className="w-6 h-6 text-primary transition-transform" />
                        <span className="text-[10px] font-bold text-surface-on">{platform.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-surface-on opacity-70 uppercase tracking-widest px-1">Share Link</p>
                    <div className="flex gap-2 p-1 bg-surface-container-low rounded-2xl border border-outline-variant">
                      <Input
                        value={shareLink}
                        readOnly
                        className="bg-transparent border-none text-xs focus-visible:ring-0 flex-1 truncate"
                      />
                      <Button
                        onClick={handleCopyLink}
                        size="sm"
                        className={`rounded-xl px-4 ${copied ? "bg-green-600" : "bg-primary text-primary-foreground"}`}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}
