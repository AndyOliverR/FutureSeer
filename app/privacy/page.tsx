import Link from "next/link"
import { Header } from "@/components/header"
import { EnhancedFooter } from "@/components/enhanced-footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col starfield-ultra-sharp">
      <Header />
      <div className="relative flex-1 z-20 bg-transparent flex flex-col w-full">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-20 pb-20">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold text-amber-400 mb-2">
              Privacy Policy
            </h1>
            <p className="text-sm text-white/80 font-light">
              How we collect, use, and protect your information
            </p>
          </div>

          {/* Main Content */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-amber-500/30 hover:border-amber-500/50 p-8 transition-all duration-300 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              1. Introduction
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                FutureSeer ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our 
                AI-powered mystical insights platform.
              </p>
              <p>
                By using our Service, you consent to the data practices described in this policy. 
                If you do not agree with our policies and practices, please do not use our Service.
              </p>
            </div>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              2. Information We Collect
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                <strong>Personal Information:</strong> We may collect the following personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name and email address (for account creation)</li>
                <li>Payment information (processed securely by Razorpay)</li>
                <li>Birth date and time (for astrological calculations)</li>
                <li>Profile information and preferences</li>
                <li>Communication preferences</li>
              </ul>
              <p>
                <strong>Usage Information:</strong> We automatically collect:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Device information (browser type, operating system)</li>
                <li>IP address and location data</li>
                <li>Usage patterns and interactions with our Service</li>
                <li>Error logs and performance data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
              <p>
                <strong>Mystical Data:</strong> We may collect:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Questions and queries you submit for insights</li>
                <li>Preferences for divination methods</li>
                <li>Feedback and ratings you provide</li>
                <li>Community interactions and posts</li>
              </ul>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              3. How We Use Your Information
            </h2>
            <div className="space-y-4 text-white/80">
              <p>We use the collected information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Service Provision:</strong> To provide and maintain our mystical insights service</li>
                <li><strong>Personalization:</strong> To personalize your experience and provide relevant insights</li>
                <li><strong>Account Management:</strong> To manage your account and process payments</li>
                <li><strong>Communication:</strong> To send you important updates and respond to inquiries</li>
                <li><strong>Improvement:</strong> To improve our AI algorithms and service quality</li>
                <li><strong>Security:</strong> To protect against fraud and ensure platform security</li>
                <li><strong>Analytics:</strong> To analyze usage patterns and optimize performance</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations</li>
              </ul>
            </div>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              4. Information Sharing and Disclosure
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                <strong>We do not sell your personal information.</strong> We may share your information 
                only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Service Providers:</strong> With trusted third-party service providers who assist 
                us in operating our platform (payment processors, hosting providers, analytics services)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                <li><strong>Consent:</strong> With your explicit consent for specific purposes</li>
                <li><strong>Community Features:</strong> Information you choose to share in community forums 
                (with your consent)</li>
              </ul>
              <p>
                <strong>Data Processing:</strong> All third-party service providers are bound by confidentiality 
                agreements and data protection requirements.
              </p>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              5. Data Security
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                We implement appropriate technical and organizational measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Encryption:</strong> All data is encrypted in transit and at rest</li>
                <li><strong>Access Controls:</strong> Strict access controls and authentication measures</li>
                <li><strong>Regular Audits:</strong> Regular security assessments and vulnerability testing</li>
                <li><strong>Employee Training:</strong> Staff training on data protection and privacy</li>
                <li><strong>Incident Response:</strong> Procedures for handling security incidents</li>
              </ul>
              <p>
                <strong>No Guarantee:</strong> While we strive to protect your information, no method of 
                transmission over the internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              6. Data Retention
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                We retain your personal information only as long as necessary to fulfill the purposes 
                outlined in this policy:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Account Data:</strong> Retained while your account is active and for a 
                reasonable period after deactivation</li>
                <li><strong>Usage Data:</strong> Retained for analytics and service improvement purposes</li>
                <li><strong>Payment Data:</strong> Retained as required by financial regulations</li>
                <li><strong>Legal Requirements:</strong> Retained as required by applicable laws</li>
              </ul>
              <p>
                <strong>Deletion:</strong> You may request deletion of your personal information, 
                subject to legal and contractual obligations.
              </p>
            </div>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              7. Your Rights
            </h2>
            <div className="space-y-4 text-white/80">
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
                <li><strong>Objection:</strong> Object to processing of your information</li>
                <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p>
                <strong>Exercise Rights:</strong> To exercise these rights,{' '}
                <Link href="/contact?type=privacy" className="text-amber-400 hover:underline">submit a privacy query</Link>.
              </p>
            </div>
          </section>

          {/* Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              8. Cookies and Tracking Technologies
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Essential Cookies:</strong> Required for basic functionality</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how you use our Service</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Security Cookies:</strong> Help protect against fraud and abuse</li>
              </ul>
              <p>
                <strong>Cookie Management:</strong> You can control cookies through your browser settings. 
                Disabling certain cookies may affect Service functionality.
              </p>
            </div>
          </section>

          {/* International Transfers */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              9. International Data Transfers
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place for such transfers:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Adequacy decisions by relevant authorities</li>
                <li>Standard contractual clauses</li>
                <li>Other appropriate safeguards</li>
              </ul>
            </div>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              10. Children's Privacy
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                Our Service is not intended for children under 18 years of age. We do not knowingly 
                collect personal information from children under 18.
              </p>
              <p>
                If you are a parent or guardian and believe your child has provided us with personal 
                information, please contact us immediately.
              </p>
            </div>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              11. Changes to This Privacy Policy
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Posting the new policy on our website</li>
                <li>Sending you an email notification</li>
                <li>Displaying a notice on our platform</li>
              </ul>
              <p>
                <strong>Continued Use:</strong> Your continued use of our Service after changes constitutes 
                acceptance of the updated policy.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              12. Contact Information
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <p>
                <strong>Privacy:</strong> <Link href="/contact?type=privacy" className="text-amber-400 hover:underline">Submit a privacy query</Link><br />
                <strong>Support:</strong> <Link href="/contact" className="text-amber-400 hover:underline">Submit a support query</Link><br />
                <strong>Data Protection Officer:</strong> <Link href="/contact?type=dpo" className="text-amber-400 hover:underline">Submit a DPO query</Link><br />
                <strong>Response Time:</strong> Within 48 hours
              </p>
            </div>
          </section>
        </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-white/60 font-light">
            <p>
              This Privacy Policy is effective as of January 1, 2025.
            </p>
            <p className="mt-2">
              Last updated: February 3, 2025
            </p>
          </div>
        </div>
      </div>
      <EnhancedFooter />
    </div>
  )
} 