"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { Apple, Play, MessageCircle, Mailbox, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StandardsBadges } from "./StandardsBadges";
import { subscribeNewsletterClient } from "@/lib/newsletterSubscribeClient";

export function EnhancedFooter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("idle");
    setMessage("");
    setLoading(true);
    const result = await subscribeNewsletterClient(email);
    setLoading(false);
    if (result.ok) {
      setStatus("success");
      setMessage(result.alreadySubscribed ? "You’re already on the list." : "Thanks—you’re subscribed.");
      setEmail("");
    } else {
      setStatus("error");
      setMessage(result.error);
    }
  }

  return (
    <footer className="relative border-t border-outline-variant bg-surface-dim/90 backdrop-blur-xl mt-auto py-4 px-4 pb-24 md:pb-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <h3 className="text-base text-amber-400 font-bold tracking-tighter">FutureSeer</h3>
            <div className="h-4 w-[1px] bg-outline-variant/30 hidden sm:block" />
            <p className="text-xs text-surface-on-variant leading-none hidden sm:block">Ancient wisdom meets AI.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/tools" className="text-xs font-medium text-surface-on-variant hover:text-primary">Tools</Link>
            <span className="text-outline-variant/50 text-xs hidden sm:inline">·</span>
            <Link href="/learn" className="text-xs font-medium text-surface-on-variant hover:text-primary">Learn</Link>
            <span className="text-outline-variant/50 text-xs hidden sm:inline">·</span>
            <Link href="/pricing" className="text-xs font-medium text-surface-on-variant hover:text-primary">Pricing</Link>
            <span className="text-outline-variant/50 text-xs hidden sm:inline">·</span>
            <Link href="/terms" className="text-xs font-medium text-surface-on-variant hover:text-primary">Terms</Link>
            <span className="text-outline-variant/50 text-xs hidden sm:inline">·</span>
            <Link href="/privacy" className="text-xs font-medium text-surface-on-variant hover:text-primary">Privacy</Link>
          </div>
          <div className="flex-1 min-w-[160px] max-w-xs flex flex-col gap-1">
            {status === "success" ? (
              <p
                className="text-xs text-primary font-medium py-1 px-2 rounded-full bg-surface-container-low border border-outline-variant/20"
                role="status"
              >
                {message}
              </p>
            ) : (
              <form
                className="flex gap-1 items-center bg-surface-container-low p-0.5 pr-1 rounded-full border border-outline-variant/20"
                onSubmit={handleSubmit}
                aria-label="Subscribe to product updates"
              >
                <Input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Stay updated"
                  required
                  disabled={loading}
                  className="bg-transparent border-none h-7 text-xs flex-1 focus-visible:ring-0"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading}
                  className="h-6 px-3 bg-primary text-xs rounded-full font-bold"
                >
                  {loading ? (
                    <Loader2 className="w-3 h-3 animate-spin" aria-hidden />
                  ) : (
                    "Join"
                  )}
                </Button>
              </form>
            )}
            <p className="text-[9px] text-surface-on-variant/85 leading-tight">
              No spam. Unsubscribe anytime.{" "}
              <Link href="/terms" className="text-primary/90 hover:underline">
                Terms
              </Link>
              {" · "}
              <Link href="/privacy" className="text-primary/90 hover:underline">
                Privacy
              </Link>
            </p>
            <div aria-live="polite" aria-atomic="true" className="min-h-[1rem]">
              {status === "error" ? (
                <p className="text-[10px] text-red-400/90" role="alert">
                  {message}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/support" className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary-container transition-colors" aria-label="Support">
              <MessageCircle className="w-4 h-4 text-primary" />
            </Link>
            <Link href="/contact" className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary-container transition-colors" aria-label="Contact">
              <Mailbox className="w-4 h-4 text-primary" />
            </Link>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-outline-variant/10 flex flex-wrap justify-between items-center gap-2 text-[9px] text-surface-on-variant uppercase tracking-widest opacity-60">
          <p>© 2025 FutureSeer</p>
          <StandardsBadges variant="footer" showToolCount={false} />
        </div>
        <div className="mt-4 rounded-xl border border-outline-variant/25 bg-surface-container-low px-4 py-4">
          <p className="text-xs font-semibold tracking-wide text-surface-on">
            Mobile apps coming soon
          </p>
          <p className="mt-1 text-xs text-surface-on-variant leading-relaxed">
            For now, the best detailed experience is on desktop. You can still use the same web app on mobile today
            because FutureSeer is platform-aware and adapts automatically.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/mobile-waitlist"
              className="inline-flex flex-col gap-1 rounded-md border border-outline-variant/30 px-0 py-0 text-white transition-colors"
              aria-label="Join iOS app waitlist"
            >
              <span className="text-[9px] uppercase tracking-wider text-surface-on-variant/90">Coming Soon</span>
              <span className="inline-flex items-center gap-2 rounded-md bg-black px-3 py-2 hover:bg-zinc-900">
                <Apple className="h-4 w-4" aria-hidden />
                <span className="leading-tight">
                  <span className="block text-[9px] text-white/80">Download on the</span>
                  <span className="block text-xs font-semibold">App Store</span>
                </span>
              </span>
            </Link>
            <Link
              href="/mobile-waitlist"
              className="inline-flex flex-col gap-1 rounded-md border border-outline-variant/30 px-0 py-0 text-white transition-colors"
              aria-label="Join Android app waitlist"
            >
              <span className="text-[9px] uppercase tracking-wider text-surface-on-variant/90">Coming Soon</span>
              <span className="inline-flex items-center gap-2 rounded-md bg-black px-3 py-2 hover:bg-zinc-900">
                <Play className="h-4 w-4 fill-white" aria-hidden />
                <span className="leading-tight">
                  <span className="block text-[9px] text-white/80">Get it on</span>
                  <span className="block text-xs font-semibold">Google Play</span>
                </span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
