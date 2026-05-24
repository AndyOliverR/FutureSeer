"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, MessageSquare, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/use-auth";
import {
  LANDING_SURVEY_TOPICS,
  type LandingSurveyTopic,
  type PublicLandingTestimonial,
} from "@/lib/landingSurveyTypes";

const EXAMPLE_SEER = {
  label: "Example · Ask the Seer style",
  question: "Should I focus on a job change this year?",
  answer:
    "Your saved Vedic chart and numerology profile both stress growth through communication—not a reckless leap. Tarot adds a caution on rushing before clarity. One practical window to prepare looks stronger in the second half of the year.",
};

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} stars`}
          className="rounded p-1 transition-colors hover:bg-amber-500/10"
          onClick={() => onChange(n)}
        >
          <Star
            className={`h-6 w-6 ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`}
          />
        </button>
      ))}
    </div>
  );
}

export function LandingSurveyTestimonials() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState<PublicLandingTestimonial[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [hasUsedProduct, setHasUsedProduct] = useState(false);
  const [rating, setRating] = useState(0);
  const [topic, setTopic] = useState<LandingSurveyTopic>("love");
  const [experienceText, setExperienceText] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [roleLabel, setRoleLabel] = useState("");
  const [sharePublicly, setSharePublicly] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const loadTestimonials = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/landing-survey?limit=9");
      const data = (await res.json()) as { testimonials?: PublicLandingTestimonial[] };
      setTestimonials(Array.isArray(data.testimonials) ? data.testimonials : []);
    } catch {
      setTestimonials([]);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadTestimonials();
  }, [loadTestimonials]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (experienceText.trim().length < 12) {
      toast({ title: "Please add a bit more detail", variant: "destructive" });
      return;
    }
    if (hasUsedProduct && rating < 1) {
      toast({ title: "Please choose a star rating", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/landing-survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hasUsedProduct,
          rating: hasUsedProduct ? rating : null,
          experienceText,
          topic,
          displayName,
          roleLabel,
          sharePublicly: hasUsedProduct && sharePublicly,
          userId: user?.uid,
        }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) throw new Error(data.error || "Could not submit");
      setSubmitted(true);
      toast({ title: data.message ?? "Thank you!" });
      if (hasUsedProduct && sharePublicly) {
        void loadTestimonials();
      }
    } catch (err) {
      toast({
        title: "Could not submit",
        description: err instanceof Error ? err.message : "Try again",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      data-testimonials-section
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 border-t border-white/5"
      aria-labelledby="community-voice-heading"
    >
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 id="community-voice-heading" className="text-2xl sm:text-3xl font-serif text-amber-200 mb-3">
            Real voices & your take
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Share a quick survey—we read every reply. If you&apos;ve tried FutureSeer, you can offer a quote for our
            homepage (reviewed before publish).
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
          {/* Survey */}
          <div className="rounded-2xl border border-amber-500/25 bg-slate-900/40 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="h-5 w-5 text-amber-400" />
              <h3 className="text-lg font-medium text-slate-100">30-second survey</h3>
            </div>
            {submitted ? (
              <p className="text-sm text-slate-300 leading-relaxed">
                Thank you—your words help us improve FutureSeer. Approved homepage quotes appear below once reviewed.
              </p>
            ) : (
              <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="has-used"
                    checked={hasUsedProduct}
                    onCheckedChange={(v) => {
                      setHasUsedProduct(v === true);
                      if (v !== true) setSharePublicly(false);
                    }}
                  />
                  <Label htmlFor="has-used" className="text-sm text-slate-300 leading-snug cursor-pointer">
                    I&apos;ve tried FutureSeer (signed up or used a tool)
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-400">What matters most to you?</Label>
                  <Select value={topic} onValueChange={(v) => setTopic(v as LandingSurveyTopic)}>
                    <SelectTrigger className="border-slate-600 bg-slate-950 text-slate-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANDING_SURVEY_TOPICS.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {hasUsedProduct ? (
                  <div className="space-y-2">
                    <Label className="text-slate-400">Your rating</Label>
                    <StarPicker value={rating} onChange={setRating} />
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="experience-text" className="text-slate-400">
                    {hasUsedProduct ? "What did FutureSeer help you with?" : "What are you hoping FutureSeer can do?"}
                  </Label>
                  <Textarea
                    id="experience-text"
                    value={experienceText}
                    onChange={(e) => setExperienceText(e.target.value)}
                    className="min-h-[100px] border-slate-600 bg-slate-950 text-slate-100"
                    placeholder={
                      hasUsedProduct
                        ? "A sentence or two about your experience…"
                        : "e.g. One place for Vedic + Tarot without re-entering my birth details…"
                    }
                    maxLength={1200}
                  />
                </div>

                {hasUsedProduct ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="display-name" className="text-slate-400">
                          First name (optional)
                        </Label>
                        <Input
                          id="display-name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="border-slate-600 bg-slate-950 text-slate-100"
                          placeholder="Priya"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role-label" className="text-slate-400">
                          Role / city (optional)
                        </Label>
                        <Input
                          id="role-label"
                          value={roleLabel}
                          onChange={(e) => setRoleLabel(e.target.value)}
                          className="border-slate-600 bg-slate-950 text-slate-100"
                          placeholder="Designer, Mumbai"
                        />
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="share-publicly"
                        checked={sharePublicly}
                        onCheckedChange={(v) => setSharePublicly(v === true)}
                      />
                      <Label htmlFor="share-publicly" className="text-sm text-slate-300 leading-snug cursor-pointer">
                        You may show this on the homepage after review (first name or &ldquo;FutureSeer user&rdquo;)
                      </Label>
                    </div>
                  </>
                ) : null}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto bg-amber-600 text-slate-950 hover:bg-amber-500"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send feedback"}
                </Button>
              </form>
            )}
          </div>

          {/* Testimonials + example */}
          <div className="space-y-6">
            {loadingList ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-amber-400/60" />
              </div>
            ) : testimonials.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="relative p-5 rounded-2xl bg-slate-900/30 border border-slate-700/50 hover:border-amber-500/30 transition-colors"
                  >
                    <Quote className="absolute top-3 right-3 h-6 w-6 text-amber-500/20" />
                    <div className="flex gap-0.5 mb-3">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed italic mb-4">&ldquo;{t.content}&rdquo;</p>
                    <p className="text-xs text-amber-200/90 font-medium">{t.displayName}</p>
                    {t.roleLabel ? <p className="text-xs text-slate-500">{t.roleLabel}</p> : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-600/60 bg-slate-900/20 p-6 text-center">
                <p className="text-sm text-slate-400 mb-4">
                  No approved quotes yet—be the first to share after you try FutureSeer.
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-slate-700/50 bg-slate-900/25 p-5">
              <p className="text-xs uppercase tracking-wider text-amber-400/80 mb-2">{EXAMPLE_SEER.label}</p>
              <p className="text-sm text-slate-400 mb-2">
                <span className="text-slate-300">Q:</span> {EXAMPLE_SEER.question}
              </p>
              <p className="text-sm text-slate-300 leading-relaxed">
                <span className="text-slate-400">A:</span> {EXAMPLE_SEER.answer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
