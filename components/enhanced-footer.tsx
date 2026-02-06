"use client";
import { useState } from "react";
import Link from "next/link";
import { Mail, MessageCircle, Mailbox } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StandardsBadges } from "./StandardsBadges";
import { logger } from "@/lib/logger";

export function EnhancedFooter() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: data.message || 'Successfully subscribed to our newsletter!',
        });
        setEmail('');
        // Clear success message after 5 seconds
        setTimeout(() => setSubmitStatus({ type: null, message: '' }), 5000);
      } else {
        setSubmitStatus({
          type: 'error',
          message: data.error || 'Failed to subscribe. Please try again.',
        });
        // Clear error message after 5 seconds
        setTimeout(() => setSubmitStatus({ type: null, message: '' }), 5000);
      }
    } catch (error) {
      logger.error('Error subscribing to newsletter:', error);
      setSubmitStatus({
        type: 'error',
        message: 'An unexpected error occurred. Please try again later.',
      });
      // Clear error message after 5 seconds
      setTimeout(() => setSubmitStatus({ type: null, message: '' }), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="relative border-t border-[var(--m3-outline-variant)] bg-[var(--m3-surface-dim)] backdrop-blur-xl mt-auto mb-0 pb-0" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', boxSizing: 'border-box' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 pt-8 sm:pt-10 pb-4 sm:pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg sm:text-xl text-amber-400 font-semibold mb-3">FutureSeer</h3>
            <p className="text-[var(--m3-on-surface)] text-sm mb-4 leading-relaxed font-light">
              Where ancient wisdom meets artificial intelligence. Unlock the mysteries of your path through personalized divination.
            </p>
            {/* Connect via Support & Contact - no personal social links */}
            <div className="flex gap-3 sm:gap-4">
              <Link href="/support" className="w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-[var(--m3-surface-container)] hover:bg-[var(--m3-primary-container)] flex items-center justify-center transition-colors touch-manipulation" aria-label="Support">
                <MessageCircle className="w-5 h-5 text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-primary)]" />
              </Link>
              <Link href="/contact" className="w-11 h-11 sm:w-9 sm:h-9 rounded-full bg-[var(--m3-surface-container)] hover:bg-[var(--m3-primary-container)] flex items-center justify-center transition-colors touch-manipulation" aria-label="Contact">
                <Mailbox className="w-5 h-5 text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-primary)]" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-base mb-3 text-[var(--m3-on-surface)] font-normal">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="text-[var(--m3-on-surface)] hover:text-[var(--m3-primary)] transition-colors block py-1 font-light">Home</Link></li>
              <li><Link href="/about" className="text-[var(--m3-on-surface)] hover:text-[var(--m3-primary)] transition-colors block py-1 font-light">About</Link></li>
              <li><Link href="/tools" className="text-[var(--m3-on-surface)] hover:text-[var(--m3-primary)] transition-colors block py-1 font-light">Tools</Link></li>
              <li><Link href="/pricing" className="text-[var(--m3-on-surface)] hover:text-[var(--m3-primary)] transition-colors block py-1 font-light">Pricing</Link></li>
              <li><Link href="/contact" className="text-[var(--m3-on-surface)] hover:text-[var(--m3-primary)] transition-colors block py-1 font-light">Contact</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-serif text-base mb-3 text-[var(--m3-on-surface)] font-normal">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/how-to-use" className="text-[var(--m3-on-surface)] hover:text-[var(--m3-primary)] transition-colors block py-1 font-light">How to Use</Link></li>
              <li><Link href="/support" className="text-[var(--m3-on-surface)] hover:text-[var(--m3-primary)] transition-colors block py-1 font-light">Support</Link></li>
              <li><Link href="/community" className="text-[var(--m3-on-surface)] hover:text-[var(--m3-primary)] transition-colors block py-1 font-light">Community</Link></li>
              <li><Link href="/disclaimer" className="text-[var(--m3-on-surface)] hover:text-[var(--m3-primary)] transition-colors block py-1 font-light">Disclaimer</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h4 className="font-serif text-base mb-3 text-[var(--m3-on-surface)] font-normal">Stay Connected</h4>
            <p className="text-[var(--m3-on-surface)] text-sm mb-4 font-light">
              Get weekly cosmic insights and updates
            </p>
            {submitStatus.type && (
              <div className={`mb-3 p-2 rounded-md text-xs ${
                submitStatus.type === 'success'
                  ? 'bg-green-500/20 border border-green-500/50 text-green-400'
                  : 'bg-red-500/20 border border-red-500/50 text-red-400'
              }`}>
                {submitStatus.message}
              </div>
            )}
            <form 
              className="flex gap-2"
              onSubmit={handleNewsletterSubmit}
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                required
                disabled={isSubmitting}
                className="bg-[var(--m3-surface-container)] border-[var(--m3-outline-variant)] text-[var(--m3-on-surface)] placeholder:text-[var(--m3-on-surface-variant)] text-sm flex-1 min-h-[44px] focus:border-[var(--m3-primary)] transition-colors rounded-xl disabled:opacity-50"
              />
              <Button 
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-[var(--m3-primary)] hover:bg-[var(--m3-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed text-[var(--m3-on-primary)] min-w-[44px] min-h-[44px] touch-manipulation transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Mail className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Standards Badges */}
        <div className="border-t border-[var(--m3-outline-variant)] pt-6 pb-4">
          <div className="mb-4">
            <h4 className="font-serif text-sm mb-3 text-center text-[var(--m3-on-surface-variant)] font-normal">Standards & Validation</h4>
            <StandardsBadges variant="footer" showToolCount={true} />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--m3-outline-variant)] pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[var(--m3-on-surface)]">
            <p className="text-center sm:text-left font-light">© 2025 <span className="text-amber-400 font-semibold">FutureSeer</span>. All rights reserved.</p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <Link href="/terms" className="hover:text-[var(--m3-primary)] transition-colors py-1 font-light">Terms</Link>
              <Link href="/privacy" className="hover:text-[var(--m3-primary)] transition-colors py-1 font-light">Privacy</Link>
              <Link href="/contact" className="hover:text-[var(--m3-primary)] transition-colors py-1 font-light">Contact</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
