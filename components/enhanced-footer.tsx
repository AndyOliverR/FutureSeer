"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { MessageCircle, Mailbox, Loader2 } from "lucide-react";
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
    <footer className="relative w-full min-w-0 max-w-full overflow-x-hidden border-t border-outline-variant bg-surface-dim/90 backdrop-blur-xl mt-auto py-4 px-4 pb-24 md:pb-6">
      <div className="max-w-7xl mx-auto min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4 min-w-0">
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
          <div className="basis-full md:basis-auto w-full md:flex-1 min-w-0 md:min-w-[160px] md:max-w-xs flex flex-col gap-1">
            <div className="min-h-[2.75rem] flex flex-col justify-center">
            {status === "success" ? (
              <p
                className="text-xs text-primary font-medium py-1 px-2 rounded-full bg-surface-container-low border border-outline-variant/20"
                role="status"
              >
                {message}
              </p>
            ) : (
              <form
                className="w-full flex gap-1 items-center bg-surface-container-low p-0.5 pr-1 rounded-full border border-outline-variant/20"
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
                  className="min-w-0 bg-transparent border-none h-7 text-xs flex-1 focus-visible:ring-0"
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={loading}
                  className="h-6 px-3 bg-primary text-xs rounded-full font-bold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" aria-hidden />
                      <span className="sr-only">Submitting</span>
                    </>
                  ) : (
                    "Join"
                  )}
                </Button>
              </form>
            )}
            </div>
            <p className="text-xs text-surface-on-variant/85 leading-relaxed whitespace-normal break-words">
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
                <p className="text-xs text-red-400/90" role="alert">
                  {message}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/support" className="fs-touch-target w-11 h-11 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary-container transition-colors" aria-label="Support">
              <MessageCircle className="w-4 h-4 text-primary" />
            </Link>
            <Link href="/contact" className="fs-touch-target w-11 h-11 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary-container transition-colors" aria-label="Contact">
              <Mailbox className="w-4 h-4 text-primary" />
            </Link>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-outline-variant/10 flex flex-wrap justify-between items-center gap-2 text-[11px] text-surface-on-variant uppercase tracking-wide opacity-70">
          <p>© 2025 FutureSeer</p>
          <StandardsBadges variant="footer" showToolCount={false} />
        </div>
        <div className="mt-4 rounded-xl border border-outline-variant/25 bg-surface-container-low px-4 py-4">
          <p className="text-xs font-semibold tracking-wide text-surface-on">
            Mobile apps coming soon
          </p>
          <p className="mt-1 text-xs text-surface-on-variant leading-relaxed">
            Optimized for mobile and desktop—the same web app adapts to your screen. Native iOS and Android apps are
            coming soon; join the waitlist below.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/mobile-waitlist"
              className="inline-flex flex-col gap-1"
              aria-label="Coming Soon — App Store badge — join the iOS app waitlist"
            >
              <span className="text-[11px] uppercase tracking-wide text-surface-on-variant/90">Coming Soon</span>
              <img
                src="/badges/app-store-dark.svg"
                alt=""
                width={124}
                height={40}
                className="block h-auto w-auto dark:hidden"
                loading="lazy"
              />
              <img
                src="/badges/app-store-light.svg"
                alt=""
                width={124}
                height={40}
                className="hidden h-auto w-auto dark:block"
                loading="lazy"
              />
            </Link>
            <Link
              href="/mobile-waitlist"
              className="inline-flex flex-col gap-1"
              aria-label="Coming Soon — Google Play badge — join the Android app waitlist"
            >
              <span className="text-[11px] uppercase tracking-wide text-surface-on-variant/90">Coming Soon</span>
              <img
                src="/badges/google-play-dark.svg"
                alt=""
                width={135}
                height={40}
                className="block h-auto w-auto dark:hidden"
                loading="lazy"
              />
              <img
                src="/badges/google-play-light.svg"
                alt=""
                width={135}
                height={40}
                className="hidden h-auto w-auto dark:block"
                loading="lazy"
              />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
