"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-300 mb-4">
            Terms and Conditions 📜
          </h1>
          <p className="text-gray-300 text-lg">
            Please read these terms carefully before using FutureSeer
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-slate-800/50 rounded-lg p-8 border border-slate-700 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              1. Introduction
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                These Terms and Conditions ("Terms") govern your use of FutureSeer ("Service"), 
                operated by FutureSeer ("Company," "we," "us," or "our"). By accessing or using 
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
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              2. Acceptance of Terms
            </h2>
            <div className="space-y-4 text-gray-300">
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
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              3. Service Description
            </h2>
            <div className="space-y-4 text-gray-300">
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
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              4. User Accounts
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>Account Creation:</strong> You must create an account to access our services. 
                You are responsible for maintaining the confidentiality of your account credentials.
              </p>
              <p>
                <strong>Account Security:</strong> You are responsible for all activities that occur 
                under your account. Notify us immediately of any unauthorized use.
              </p>
              <p>
                <strong>Age Requirement:</strong> You must be at least 18 years old to use our Service. 
                Users under 18 must have parental consent.
              </p>
              <p>
                <strong>Account Termination:</strong> We reserve the right to terminate accounts that 
                violate these Terms or engage in fraudulent activity.
              </p>
            </div>
          </section>

          {/* Payment Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              5. Payment Terms
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>Subscription Plans:</strong> We offer various subscription plans with different 
                features and pricing. All prices are listed in USD unless otherwise specified.
              </p>
              <p>
                <strong>Payment Processing:</strong> Payments are processed securely through Razorpay. 
                By making a payment, you authorize us to charge your payment method.
              </p>
              <p>
                <strong>Billing Cycle:</strong> Subscriptions are billed on a recurring basis according 
                to your selected plan (monthly, yearly, or lifetime).
              </p>
              <p>
                <strong>Price Changes:</strong> We may change our pricing with 30 days' notice. 
                Existing subscribers will be notified of any price increases.
              </p>
            </div>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              6. Acceptable Use
            </h2>
            <div className="space-y-4 text-gray-300">
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
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              7. Intellectual Property
            </h2>
            <div className="space-y-4 text-gray-300">
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
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              8. Privacy
            </h2>
            <div className="space-y-4 text-gray-300">
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
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              9. Disclaimers
            </h2>
            <div className="space-y-4 text-gray-300">
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
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              10. Limitation of Liability
            </h2>
            <div className="space-y-4 text-gray-300">
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
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              11. Termination
            </h2>
            <div className="space-y-4 text-gray-300">
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
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              12. Governing Law
            </h2>
            <div className="space-y-4 text-gray-300">
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
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              13. Contact Information
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <p>
                <strong>Email:</strong> legal@futureseer.com<br />
                <strong>Support:</strong> support@futureseer.com
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            These Terms and Conditions are effective as of January 1, 2025.
          </p>
          <p className="mt-2">
            Last updated: January 1, 2025
          </p>
        </div>
      </div>
    </div>
  )
} 