"use client";

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Share2, Mail, MessageCircle, Copy, Check, Facebook, Twitter, MessageSquare, Linkedin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

export function ShareAppModal({ isOpen, onClose, buttonRef }: ShareAppModalProps) {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [hasNativeShare, setHasNativeShare] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const shareLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://futureseer.app'}?ref=${userProfile?.referralCode || user?.uid || 'anonymous'}`;
  const defaultShareMessage = "I've discovered this amazing AI-powered mystical platform called FutureSeer! It combines ancient wisdom with modern AI to provide personalized divination insights. You should check it out! ✨🔮";
  
  // Check for native share API support
  useEffect(() => {
    setHasNativeShare(typeof navigator !== 'undefined' && 'share' in navigator);
  }, []);

  // Position popup near share button
  useEffect(() => {
    if (isOpen && buttonRef?.current && popupRef.current) {
      const updatePosition = () => {
        if (!buttonRef?.current || !popupRef.current) return;
        
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const popup = popupRef.current;
        const popupWidth = 380; // max width
        const popupHeight = popup.offsetHeight || 400;
        const isMobile = window.innerWidth < 768;
        
        if (isMobile) {
          // Mobile: center in viewport, constrain height so full modal visible in landscape
          popup.style.position = 'fixed';
          popup.style.bottom = '20px';
          popup.style.left = '50%';
          popup.style.transform = 'translateX(-50%)';
          popup.style.right = 'auto';
          popup.style.top = 'auto';
          popup.style.maxWidth = 'calc(100vw - 32px)';
          popup.style.maxHeight = '90vh';
          popup.style.overflowY = 'auto';
        } else {
          // Desktop: position to right and below button, or adjust if would go off-screen
          const spaceRight = window.innerWidth - buttonRect.right;
          const spaceLeft = buttonRect.left;
          const spaceBelow = window.innerHeight - buttonRect.bottom;
          
          popup.style.position = 'fixed';
          popup.style.maxWidth = '380px';
          
          // Position horizontally: prefer right, fallback to left if not enough space
          if (spaceRight >= popupWidth + 16) {
            // Enough space on right
            popup.style.left = `${buttonRect.right + 8}px`;
            popup.style.right = 'auto';
            popup.style.transform = 'none';
          } else if (spaceLeft >= popupWidth + 16) {
            // Not enough space on right, position on left
            popup.style.right = `${window.innerWidth - buttonRect.left + 8}px`;
            popup.style.left = 'auto';
            popup.style.transform = 'none';
          } else {
            // Not enough space on either side, center relative to button
            popup.style.left = `${buttonRect.left + (buttonRect.width / 2) - (popupWidth / 2)}px`;
            popup.style.right = 'auto';
            popup.style.transform = 'none';
          }
          
          // Position vertically: prefer below, fallback to above if not enough space
          if (spaceBelow >= popupHeight + 16) {
            popup.style.top = `${buttonRect.bottom + 8}px`;
            popup.style.bottom = 'auto';
          } else {
            popup.style.bottom = `${window.innerHeight - buttonRect.top + 8}px`;
            popup.style.top = 'auto';
          }
        }
      };
      
      // Update position on mount and window resize
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpen, buttonRef]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node) &&
          buttonRef?.current && !buttonRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Native Web Share API handler (most effortless)
  const handleNativeShare = async () => {
    if (hasNativeShare && navigator.share) {
      try {
        await navigator.share({
          title: 'FutureSeer - AI-Powered Mystic',
          text: defaultShareMessage,
          url: shareLink,
        });
        toast({
          title: "Shared! ✨",
          description: "Thank you for sharing FutureSeer!",
        });
        onClose();
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          toast({
            title: "Share Failed",
            description: "Please try another sharing method",
            variant: "destructive"
          });
        }
      }
    }
  };

  // Social media share URL builders
  const getShareUrls = () => {
    const encodedMessage = encodeURIComponent(defaultShareMessage);
    const encodedUrl = encodeURIComponent(shareLink);
    
    return {
      whatsapp: `https://web.whatsapp.com/send?text=${encodedMessage}%20${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodeURIComponent('Check out FutureSeer!')}&body=${encodedMessage}%20${encodedUrl}`,
      sms: `sms:?body=${encodedMessage}%20${encodedUrl}`
    };
  };

  const handleSocialShare = (platform: 'whatsapp' | 'twitter' | 'facebook' | 'linkedin' | 'email' | 'sms') => {
    const urls = getShareUrls();
    const url = urls[platform];
    
    if (platform === 'email' || platform === 'sms') {
      window.location.href = url;
    } else {
      window.open(url, '_blank', 'width=600,height=400');
    }
    
    toast({
      title: `Opening ${platform.charAt(0).toUpperCase() + platform.slice(1)}...`,
      description: "Share with your friends!",
    });
    onClose();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast({
        title: "Link Copied! 📋",
        description: "Share link copied to clipboard",
      });
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually",
        variant: "destructive"
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          ref={popupRef}
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, ease: [0.2, 0, 0, 1] }}
          className="fixed z-[9999] w-[320px] sm:w-[380px] bg-[var(--m3-surface-container-high)]/95 backdrop-blur-xl border border-[var(--m3-outline-variant)] rounded-2xl m3-elevation-3 hover:m3-elevation-4 m3-elevation-transition m3-gpu-accelerated overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--m3-outline-variant)]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[var(--m3-primary-container)] rounded-lg">
            <Share2 className="w-4 h-4 text-[var(--m3-on-primary-container)]" />
          </div>
          <h3 className="m3-title-large text-[var(--m3-on-surface)]">Share FutureSeer</h3>
        </div>
        <button
          onClick={onClose}
          className="text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-primary)] hover:bg-[var(--m3-primary-container)] rounded-lg p-1 m3-ripple m3-button-bounce m3-transition-standard will-change-transform"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <motion.div 
        className="p-4 space-y-4"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.1,
            },
          },
        }}
      >
        {/* Native Share Button (if available) */}
        {hasNativeShare && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ease: [0, 0, 0.2, 1], duration: 0.3, delay: 0.1 }}
          >
            <Button
              variant="filled"
              onClick={handleNativeShare}
              className="w-full bg-gradient-to-r from-[var(--m3-primary)] via-[var(--m3-tertiary)] to-[var(--m3-primary)] hover:from-[var(--m3-primary)]/90 hover:via-[var(--m3-tertiary)]/90 hover:to-[var(--m3-primary)]/90 text-[var(--m3-on-primary)] font-semibold py-2.5 px-4 rounded-xl m3-elevation-2 hover:m3-elevation-3 m3-elevation-transition m3-transition-emphasized m3-gpu-accelerated m3-label-large"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share with Native Share
            </Button>
          </motion.div>
        )}

        {/* Social Media Share Buttons */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05,
                delayChildren: 0.1,
              },
            },
          }}
        >
          <p className="m3-label-medium text-[var(--m3-on-surface-variant)] mb-2">Share on Social Media</p>
          <motion.div 
            className="grid grid-cols-3 gap-2"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05,
                },
              },
            }}
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1 },
              }}
              transition={{ ease: [0, 0, 0.2, 1], duration: 0.3 }}
            >
              <Button
                variant="filled-tonal"
                onClick={() => handleSocialShare('whatsapp')}
                className="flex flex-col items-center justify-center gap-1 p-3 bg-[var(--m3-primary-container)] hover:bg-[var(--m3-primary-container)]/80 border border-[var(--m3-outline-variant)] hover:border-[var(--m3-primary)]/50 rounded-xl m3-ripple m3-button-bounce m3-transition-standard m3-elevation-0 hover:m3-elevation-1 m3-elevation-transition will-change-transform hover:scale-105 h-auto"
                title="Share on WhatsApp"
              >
                <MessageSquare className="w-5 h-5 text-[var(--m3-primary)]" />
                <span className="m3-label-small text-[var(--m3-on-primary-container)]">WhatsApp</span>
              </Button>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1 },
              }}
              transition={{ ease: [0, 0, 0.2, 1], duration: 0.3 }}
            >
              <Button
                variant="filled-tonal"
                onClick={() => handleSocialShare('twitter')}
                className="flex flex-col items-center justify-center gap-1 p-3 bg-[var(--m3-primary-container)] hover:bg-[var(--m3-primary-container)]/80 border border-[var(--m3-outline-variant)] hover:border-[var(--m3-primary)]/50 rounded-xl m3-ripple m3-button-bounce m3-transition-standard m3-elevation-0 hover:m3-elevation-1 m3-elevation-transition will-change-transform hover:scale-105 h-auto"
                title="Share on Twitter/X"
              >
                <Twitter className="w-5 h-5 text-[var(--m3-primary)]" />
                <span className="m3-label-small text-[var(--m3-on-primary-container)]">Twitter</span>
              </Button>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1 },
              }}
              transition={{ ease: [0, 0, 0.2, 1], duration: 0.3 }}
            >
              <Button
                variant="filled-tonal"
                onClick={() => handleSocialShare('facebook')}
                className="flex flex-col items-center justify-center gap-1 p-3 bg-[var(--m3-primary-container)] hover:bg-[var(--m3-primary-container)]/80 border border-[var(--m3-outline-variant)] hover:border-[var(--m3-primary)]/50 rounded-xl m3-ripple m3-button-bounce m3-transition-standard m3-elevation-0 hover:m3-elevation-1 m3-elevation-transition will-change-transform hover:scale-105 h-auto"
                title="Share on Facebook"
              >
                <Facebook className="w-5 h-5 text-[var(--m3-primary)]" />
                <span className="m3-label-small text-[var(--m3-on-primary-container)]">Facebook</span>
              </Button>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1 },
              }}
              transition={{ ease: [0, 0, 0.2, 1], duration: 0.3 }}
            >
              <Button
                variant="filled-tonal"
                onClick={() => handleSocialShare('linkedin')}
                className="flex flex-col items-center justify-center gap-1 p-3 bg-[var(--m3-primary-container)] hover:bg-[var(--m3-primary-container)]/80 border border-[var(--m3-outline-variant)] hover:border-[var(--m3-primary)]/50 rounded-xl m3-ripple m3-button-bounce m3-transition-standard m3-elevation-0 hover:m3-elevation-1 m3-elevation-transition will-change-transform hover:scale-105 h-auto"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-[var(--m3-primary)]" />
                <span className="m3-label-small text-[var(--m3-on-primary-container)]">LinkedIn</span>
              </Button>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1 },
              }}
              transition={{ ease: [0, 0, 0.2, 1], duration: 0.3 }}
            >
              <Button
                variant="filled-tonal"
                onClick={() => handleSocialShare('email')}
                className="flex flex-col items-center justify-center gap-1 p-3 bg-[var(--m3-primary-container)] hover:bg-[var(--m3-primary-container)]/80 border border-[var(--m3-outline-variant)] hover:border-[var(--m3-primary)]/50 rounded-xl m3-ripple m3-button-bounce m3-transition-standard m3-elevation-0 hover:m3-elevation-1 m3-elevation-transition will-change-transform hover:scale-105 h-auto"
                title="Share via Email"
              >
                <Mail className="w-5 h-5 text-[var(--m3-primary)]" />
                <span className="m3-label-small text-[var(--m3-on-primary-container)]">Email</span>
              </Button>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1 },
              }}
              transition={{ ease: [0, 0, 0.2, 1], duration: 0.3 }}
            >
              <Button
                variant="filled-tonal"
                onClick={() => handleSocialShare('sms')}
                className="flex flex-col items-center justify-center gap-1 p-3 bg-[var(--m3-primary-container)] hover:bg-[var(--m3-primary-container)]/80 border border-[var(--m3-outline-variant)] hover:border-[var(--m3-primary)]/50 rounded-xl m3-ripple m3-button-bounce m3-transition-standard m3-elevation-0 hover:m3-elevation-1 m3-elevation-transition will-change-transform hover:scale-105 h-auto"
                title="Share via SMS"
              >
                <MessageCircle className="w-5 h-5 text-[var(--m3-primary)]" />
                <span className="m3-label-small text-[var(--m3-on-primary-container)]">SMS</span>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Copy Link Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ease: [0, 0, 0.2, 1], duration: 0.3, delay: 0.4 }}
        >
          <p className="m3-label-medium text-[var(--m3-on-surface-variant)] mb-2">Or copy link</p>
          <div className="flex gap-2">
            <Input
              value={shareLink}
              readOnly
              onClick={(e) => {
                (e.target as HTMLInputElement).select();
                handleCopyLink();
              }}
              className="bg-[var(--m3-surface-container-low)] border border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] m3-label-small rounded-lg backdrop-blur-sm cursor-pointer hover:border-[var(--m3-outline)] m3-input-focus focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)] m3-transition-standard h-9"
              title="Click to select and copy"
            />
            <Button
              variant={copied ? "filled" : "filled"}
              onClick={handleCopyLink}
              aria-label={copied ? "Link copied" : "Copy share link"}
              className={`px-3 rounded-lg m3-elevation-2 hover:m3-elevation-3 m3-elevation-transition m3-transition-emphasized m3-gpu-accelerated m3-ripple m3-button-bounce h-9 ${
                copied 
                  ? 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white' 
                  : 'bg-gradient-to-r from-[var(--m3-primary)] via-[var(--m3-tertiary)] to-[var(--m3-primary)] hover:from-[var(--m3-primary)]/90 hover:via-[var(--m3-tertiary)]/90 hover:to-[var(--m3-primary)]/90 text-[var(--m3-on-primary)]'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </motion.div>
      </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
