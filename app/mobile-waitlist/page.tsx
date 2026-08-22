import Link from "next/link";

export default function MobileWaitlistPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto w-full max-w-3xl px-4 py-16 md:py-24">
        <div className="rounded-2xl border border-border/60 bg-card/80 p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.24em] text-primary/80">FutureSeer on your device</p>
          <h1 className="mt-3 text-2xl font-semibold md:text-3xl">Install from the web</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            FutureSeer is a Progressive Web App. Open futureseer.app in your browser, then install it to your home screen.
            The same site adapts to phone, tablet, and desktop layouts — no App Store or Play Store required.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            On Android Chrome or desktop Chrome/Edge, use Install app. On iPhone or iPad Safari, tap Share, then Add to Home Screen.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Open FutureSeer
            </Link>
            <Link
              href="/settings"
              className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
            >
              Install from Settings
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
