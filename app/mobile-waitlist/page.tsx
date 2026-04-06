import Link from "next/link";

export default function MobileWaitlistPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto w-full max-w-3xl px-4 py-16 md:py-24">
        <div className="rounded-2xl border border-border/60 bg-card/80 p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-primary/80">FutureSeer Mobile</p>
          <h1 className="mt-3 text-2xl font-semibold md:text-3xl">Apps Coming Soon</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            The best detailed FutureSeer experience is already available on desktop web. You can also keep using the same
            web app on mobile right now because FutureSeer is platform-aware and adapts to your device.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            We are preparing native iOS and Android launches and prioritizing release timing based on user demand and
            feedback.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Join the Mobile Waitlist
            </Link>
            <Link
              href="/"
              className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              Continue on Web
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
