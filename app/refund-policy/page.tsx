import Link from "next/link"
import { MinimalNav } from "@/components/navigation/MinimalNav"

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen py-12 px-4 starfield-ultra-sharp">
      <MinimalNav />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-300 mb-4">
            Cancellations and Refunds Policy 🔄
          </h1>
          <p className="text-gray-300 text-lg">
            Understanding your rights and our policies
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-[#0f172a]/80 rounded-lg p-8 border border-amber-400/20 space-y-8">
          
          {/* Important Notice */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-amber-300 mb-3">
              ⚡ Important Information
            </h2>
            <p className="text-gray-300">
              This policy applies to all FutureSeer subscriptions and services. Please read carefully 
              to understand your cancellation and refund rights.
            </p>
          </div>

          {/* Subscription Cancellation */}
          <section>
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              1. Subscription Cancellation
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>How to Cancel:</strong> You may cancel your subscription at any time through:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your account settings on our website</li>
                <li>Contacting our support team via the <Link href="/contact" className="text-amber-400 hover:underline">contact form</Link></li>
                <li>Using the cancellation option in your subscription management</li>
              </ul>
              <p>
                <strong>Immediate Effect:</strong> Cancellation takes effect immediately upon confirmation. 
                You will continue to have access to your subscription features until the end of your 
                current billing period.
              </p>
              <p>
                <strong>No Further Charges:</strong> Once cancelled, you will not be charged for future 
                billing cycles. Your subscription will not automatically renew.
              </p>
            </div>
          </section>

          {/* Refund Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              2. Refund Policy
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>30-Day Money-Back Guarantee:</strong> We offer a 30-day money-back guarantee 
                for new subscriptions. If you're not satisfied with our service within 30 days of 
                your initial purchase, you may request a full refund.
              </p>
              <p>
                <strong>Refund Eligibility:</strong> Refunds are available for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>New subscriptions within 30 days of purchase</li>
                <li>Technical issues preventing service access</li>
                <li>Billing errors or unauthorized charges</li>
                <li>Service unavailability for extended periods</li>
              </ul>
              <p>
                <strong>Non-Refundable:</strong> The following are generally non-refundable:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Lifetime subscriptions after 30 days</li>
                <li>Used or consumed services</li>
                <li>Violations of our Terms of Service</li>
                <li>Requests made after the 30-day period</li>
              </ul>
            </div>
          </section>

          {/* Refund Process */}
          <section>
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              3. Refund Process
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>How to Request a Refund:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Contact our support team via the <Link href="/contact" className="text-amber-400 hover:underline">contact form</Link></li>
                <li>Include your account email and reason for refund</li>
                <li>Provide any relevant details about your experience</li>
                <li>Our team will review your request within 3-5 business days</li>
              </ol>
              <p>
                <strong>Processing Time:</strong> Approved refunds are typically processed within 5-10 
                business days, depending on your payment method and financial institution.
              </p>
              <p>
                <strong>Refund Method:</strong> Refunds are issued to the original payment method used 
                for the purchase.
              </p>
            </div>
          </section>

          {/* Subscription Plans */}
          <section>
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              4. Subscription Plan Specifics
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>Monthly Subscriptions:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Can be cancelled at any time</li>
                <li>30-day money-back guarantee for new subscribers</li>
                <li>No refunds for partial months</li>
                <li>Access continues until end of billing period</li>
              </ul>
              <p>
                <strong>Yearly Subscriptions:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Can be cancelled at any time</li>
                <li>30-day money-back guarantee for new subscribers</li>
                <li>Pro-rated refunds may be available for early cancellation</li>
                <li>Access continues until end of billing period</li>
              </ul>
              <p>
                <strong>Lifetime Subscriptions:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>30-day money-back guarantee only</li>
                <li>No refunds after 30 days</li>
                <li>One-time payment, no recurring charges</li>
                <li>Access continues indefinitely</li>
              </ul>
            </div>
          </section>

          {/* Special Circumstances */}
          <section>
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              5. Special Circumstances
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>Technical Issues:</strong> If you experience technical difficulties that prevent 
                you from using our service, we may offer a refund or service credit at our discretion.
              </p>
              <p>
                <strong>Service Discontinuation:</strong> If we discontinue a service you've purchased, 
                we will provide a pro-rated refund or alternative service.
              </p>
              <p>
                <strong>Billing Errors:</strong> If you're charged incorrectly or experience billing 
                issues, we will investigate and provide appropriate refunds or credits.
              </p>
              <p>
                <strong>Force Majeure:</strong> In cases of force majeure (natural disasters, etc.), 
                refund policies may be adjusted accordingly.
              </p>
            </div>
          </section>

          {/* Account Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              6. Account Termination
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>Violation of Terms:</strong> If your account is terminated due to violation of 
                our Terms of Service, no refunds will be provided.
              </p>
              <p>
                <strong>Fraudulent Activity:</strong> Accounts involved in fraudulent activity will be 
                terminated without refund.
              </p>
              <p>
                <strong>Data Retention:</strong> Upon cancellation or termination, your account data 
                will be retained according to our Privacy Policy and may be deleted after a specified period.
              </p>
            </div>
          </section>

          {/* Disputes */}
          <section>
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              7. Disputes and Appeals
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>Appeal Process:</strong> If your refund request is denied, you may appeal the 
                decision by contacting our support team with additional information.
              </p>
              <p>
                <strong>Resolution Time:</strong> We aim to resolve all disputes within 10 business days.
              </p>
              <p>
                <strong>Final Decision:</strong> Our decision on refund requests is final and binding.
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              8. Contact Information
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                For questions about cancellations and refunds, please contact us:
              </p>
              <p>
                <strong>Support:</strong> <Link href="/contact" className="text-amber-400 hover:underline">Submit a query</Link><br />
                <strong>Response Time:</strong> Within 24 hours<br />
                <strong>Business Hours:</strong> 24/7 Support Available
              </p>
              <p>
                <strong>For Billing Issues:</strong> <Link href="/contact?type=billing" className="text-amber-400 hover:underline">Submit a billing query</Link>
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            This Cancellations and Refunds Policy is effective as of January 1, 2025.
          </p>
          <p className="mt-2">
            Last updated: February 3, 2025
          </p>
        </div>
      </div>
    </div>
  )
} 