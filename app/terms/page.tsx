"use client"

import React from "react"
import Link from "next/link"
import { EnhancedFooter } from "@/components/enhanced-footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col starfield-ultra-sharp">
      <div className="relative flex-1 z-20 bg-transparent flex flex-col w-full">
        <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 pt-20 pb-20">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold text-amber-400 mb-2">
              Terms and Conditions
            </h1>
            <p className="text-sm text-white/80 font-light">
              Please read these terms carefully before using FutureSeer
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
                These Terms and Conditions (&quot;Terms&quot;) govern your use of FutureSeer (&quot;Service&quot;), 
                operated by FutureSeer (&quot;Company,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing or using 
                our Service, you agree to be bound by these Terms.
              </p>
              <p>
                FutureSeer is an AI-powered platform that provides mystical insights, divination 
                services, and spiritual guidance through artificial intelligence technology.
              </p>
            </div>
          </section>

          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              2. Acceptance of Terms
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                By creating an account, accessing, or using our Service, you acknowledge that you 
                have read, understood, and agree to be bound by these Terms. If you do not agree 
                to these Terms, you must not use our Service.
              </p>
              <p>
                We reserve the right to modify these Terms at any time. Continued use of the Service 
                after changes constitutes acceptance of the modified Terms.
              </p>
            </div>
          </section>

          {/* Service Description */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              3. Service Description
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                FutureSeer provides AI-powered mystical insights including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Astrological readings and interpretations</li>
                <li>Numerology calculations and insights</li>
                <li>Tarot card readings and interpretations</li>
                <li>Dream symbolism analysis</li>
                <li>Palmistry and face reading insights</li>
                <li>I Ching and other divination methods</li>
                <li>Personalized spiritual guidance</li>
              </ul>
              <p>
                <strong>Important:</strong> Our services are for entertainment and personal reflection 
                purposes only. They should not be used as a substitute for professional medical, 
                legal, or financial advice.
              </p>
            </div>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              4. User Accounts
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                <strong>Account Creation:</strong> You must create an account to access our services. 
                You are responsible for maintaining the confidentiality of your account credentials.
              </p>
              <p>
                <strong>Account Security:</strong> You are responsible for all activities that occur 
                under your account. Notify us immediately of any unauthorized use.
              </p>
              <p>
                <strong>Age Requirement:</strong> You must be at least 16 years old to use our Service. 
                If your country or region requires a higher minimum age for using online services, you must meet that age. 
                By creating an account, you confirm that you meet this eligibility requirement.
              </p>
              <p>
                <strong>Account Termination:</strong> We reserve the right to terminate accounts that 
                violate these Terms or engage in fraudulent activity.
              </p>
            </div>
          </section>

          {/* Payment Terms & Auto-Mandate */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              5. Membership, Contribution & Auto-Mandate Agreement
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                <strong>Membership:</strong> Paid tiers (Coffee, Treat, and Hamper) are <strong>memberships</strong>—recurring
                subscriptions that support the innovation experiment and grant ongoing access according to your selected
                billing cycle (monthly, quarterly, or annual). We use the names Coffee, Treat, and Hamper for the same
                tiers as the Buy Me a Coffee / Treat Me / Festive Hamper billing options described in checkout.
              </p>
              <p>
                <strong>Innovation Experiment Participation:</strong> FutureSeer operates as an innovation experiment. 
                When you join, you&apos;re contributing to making AI-powered divination accessible to all. Your participation 
                helps improve accuracy, precision, and quality for everyone.
              </p>
              <p>
                <strong>30-Day Free Trial:</strong> All new participants receive a 30-day free trial. During this period, 
                you have full access to all features. No charges are made during the trial period.
              </p>
              <p>
                <strong>Payment Method Required:</strong> To secure your spot in the innovation experiment and access your 
                free trial, we require a payment method to be on file. This payment method will not be charged during your 
                30-day free trial period.
              </p>
              <p>
                <strong>Auto-Mandate Agreement:</strong> By joining the FutureSeer innovation experiment, you authorize 
                FutureSeer to automatically charge your payment method for recurring membership billing according to your selected 
                tier (Coffee / monthly, Treat / quarterly, or Hamper / annual). 
                This authorization is required for regulatory compliance (RBI guidelines for recurring payments in India, 
                similar regulations in other countries).
              </p>
              <p>
                <strong>When Charges Begin:</strong> After your 30-day free trial ends, your contribution will automatically 
                begin according to your selected tier. You will receive email notifications before any charges are made.
              </p>
              <p>
                <strong>Payment Processing:</strong> Payments are processed securely through Razorpay, a PCI-DSS compliant 
                payment gateway. Your payment information is encrypted and securely stored.
              </p>
              <p>
                <strong>Cancel Anytime:</strong> You can cancel your membership at any time through your profile settings.
                When you cancel, recurring billing stops when our payment provider (Razorpay) confirms cancellation; access
                to paid features may end at that time. You can resubscribe anytime.
              </p>
              <div>
                <p><strong>Billing Cycle:</strong> Contributions are processed according to your selected tier:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Buy Me a Coffee: Monthly contributions</li>
                  <li>Treat Me: Quarterly contributions (every 3 months)</li>
                  <li>Festive Hamper: Annual contributions (once per year)</li>
                </ul>
              </div>
              <p>
                <strong>Price Changes:</strong> As the innovation experiment evolves, contribution levels may be adjusted. 
                We will provide 30 days&apos; notice of any changes. Existing contributors will be notified of any adjustments.
              </p>
              <div>
                <p><strong>Your Rights:</strong> You have the right to:</p>
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Cancel your contribution at any time with no questions asked</li>
                  <li>Receive advance notice before any charges</li>
                  <li>Access your contribution history and billing information</li>
                  <li>Update your payment method at any time</li>
                  <li>Rejoin the innovation experiment after cancellation</li>
                </ul>
              </div>
              <p>
                <strong>Refunds:</strong> Contributions are non-refundable, but you can cancel anytime to prevent future 
                charges. If you experience any issues, please contact our support team.
              </p>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              6. Acceptable Use
            </h2>
            <div className="space-y-4 text-white/80">
              <p>You agree not to use our Service to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Spread malware or attempt to hack our systems</li>
                <li>Use automated tools to access our Service</li>
                <li>Attempt to reverse engineer our platform</li>
                <li>Share account credentials with others</li>
                <li>Use our Service for commercial purposes without permission</li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              7. Intellectual Property
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                <strong>Our Rights:</strong> FutureSeer and all content, features, and functionality 
                are owned by us and protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p>
                <strong>Your Content:</strong> You retain ownership of any content you submit to our Service. 
                By submitting content, you grant us a license to use it for providing our services.
              </p>
              <p>
                <strong>AI Insights:</strong> AI-generated insights and interpretations are provided for 
                your personal use and may not be reproduced or distributed without permission.
              </p>
            </div>
          </section>

          {/* Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              8. Privacy
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                Your privacy is important to us. Please review our Privacy Policy, which also governs 
                your use of the Service and is incorporated into these Terms by reference.
              </p>
              <p>
                We collect and process personal data in accordance with our Privacy Policy and applicable 
                data protection laws.
              </p>
            </div>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              9. Disclaimers
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                <strong>Entertainment Only:</strong> Our mystical insights and divination services are 
                provided for entertainment and personal reflection purposes only. They are not intended 
                to provide medical, legal, financial, or professional advice.
              </p>
              <p>
                <strong>No Guarantees:</strong> We do not guarantee the accuracy, completeness, or 
                usefulness of any insights provided through our Service.
              </p>
              <p>
                <strong>Service Availability:</strong> We strive to maintain high availability but do 
                not guarantee uninterrupted access to our Service.
              </p>
              <p>
                <strong>Third-Party Content:</strong> We may include third-party content or links. 
                We are not responsible for the accuracy or reliability of such content.
              </p>
            </div>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              10. Limitation of Liability
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                To the maximum extent permitted by law, FutureSeer shall not be liable for any indirect, 
                incidental, special, consequential, or punitive damages arising from your use of our Service.
              </p>
              <p>
                Our total liability to you for any claims arising from these Terms or your use of the 
                Service shall not exceed the amount you paid us in the 12 months preceding the claim.
              </p>
            </div>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              11. Termination
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                <strong>Your Rights:</strong> You may cancel your subscription at any time through 
                your account settings or by contacting our support team.
              </p>
              <p>
                <strong>Our Rights:</strong> We may terminate or suspend your account immediately 
                if you violate these Terms or engage in fraudulent activity.
              </p>
              <p>
                <strong>Effect of Termination:</strong> Upon termination, your right to use the Service 
                ceases immediately, and we may delete your account data in accordance with our Privacy Policy.
              </p>
            </div>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              12. Governing Law
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of India, 
                without regard to its conflict of law provisions.
              </p>
              <p>
                Any disputes arising from these Terms or your use of the Service shall be resolved 
                through binding arbitration in accordance with Indian law.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-amber-400 mb-4">
              13. Contact Information
            </h2>
            <div className="space-y-4 text-white/80">
              <p>
                If you have any questions about these Terms, please contact us:
              </p>
              <p>
                <strong>Legal:</strong> <Link href="/contact?type=legal" className="text-amber-400 hover:underline">Submit a legal query</Link><br />
                <strong>Support:</strong> <Link href="/contact" className="text-amber-400 hover:underline">Submit a support query</Link>
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-white/60 font-light">
          <p>
            These Terms and Conditions are effective as of January 1, 2025.
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