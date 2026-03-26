"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { subscribeNewsletterClient } from "@/lib/newsletterSubscribeClient";

export function EmailCapture() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await subscribeNewsletterClient(email);
    setLoading(false);
    if (result.ok) {
      setSubmitted(true);
      setEmail("");
    } else {
      setError(result.error);
    }
  }

  if (submitted) {
    return (
      <div className="text-center p-8 rounded-2xl bg-green-900/20 border border-green-500/30" role="status">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" aria-hidden />
        <h3 className="text-xl font-serif text-green-200 mb-2">
          Welcome to the Journey!
        </h3>
        <p className="text-green-300/70">
          You&apos;re on the list for updates and cosmic insights.
        </p>
      </div>
    );
  }

  return (
    <section className="py-12 md:py-16 px-6" aria-labelledby="email-capture-heading">
      <div className="max-w-2xl mx-auto text-center">
        <Mail className="w-12 h-12 text-amber-400 mx-auto mb-6" aria-hidden />
        <h2 id="email-capture-heading" className="text-3xl md:text-4xl font-serif text-amber-200 mb-4">
          Start Your Cosmic Journey
        </h2>
        <p className="text-slate-400 mb-8">
          Get updates and weekly cosmic insights delivered to your inbox
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
        >
          <Input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="flex-1 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "email-capture-error" : undefined}
          />
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-900 font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" aria-hidden />
                Sending…
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </form>

        <p className="text-xs text-slate-500 mt-4">
          No spam, ever. Unsubscribe anytime. Read our{" "}
          <Link href="/privacy" className="text-amber-400 hover:underline">
            privacy policy
          </Link>
          .
        </p>
        <div id="email-capture-error" aria-live="polite" className="mt-2 min-h-[1.25rem]">
          {error ? (
            <p className="text-sm text-red-400/90" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
