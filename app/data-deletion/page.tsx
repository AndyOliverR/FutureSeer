import Link from "next/link"
import { EnhancedFooter } from "@/components/enhanced-footer"

const supportHref = "/contact?type=privacy"

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen flex flex-col starfield-ultra-sharp">
      <div className="relative flex-1 z-20 bg-transparent flex flex-col w-full">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-20 pb-20">
          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold text-amber-400 mb-2">Account &amp; data deletion</h1>
            <p className="text-sm text-white/80 font-light">
              How to remove your FutureSeer account and associated personal data
            </p>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 p-8 space-y-8 text-white/85">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-amber-400">Delete your account in the app</h2>
              <p>
                Signed-in users can permanently delete their account from{" "}
                <Link href="/settings" className="text-amber-400 hover:underline">
                  Settings
                </Link>
                . Choose <strong className="text-white">Delete Account</strong>, confirm, and we will remove your
                Firebase authentication, Firestore profile (including subcollections), saved readings where stored under
                your user id, community posts you authored, and related server-side records tied to your account.
              </p>
              <p className="text-sm text-white/70">
                If you use an active paid subscription, we attempt to cancel recurring billing with our payment provider
                during deletion; confirm cancellation in your provider account if needed.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-amber-400">Request help deleting data</h2>
              <p>
                If you cannot sign in, or need a manual review (for example legacy data or export before deletion),
                submit a request through our{" "}
                <Link href={supportHref} className="text-amber-400 hover:underline">
                  contact form (privacy / data)
                </Link>
                . Include the email address you used to register so we can verify ownership.
              </p>
              <p className="text-sm text-white/70">
                We aim to complete verified deletion requests within a reasonable period (typically within 30 days),
                subject to legal retention requirements.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-amber-400">Related policies</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <Link href="/privacy" className="text-amber-400 hover:underline">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-amber-400 hover:underline">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
      <EnhancedFooter />
    </div>
  )
}
