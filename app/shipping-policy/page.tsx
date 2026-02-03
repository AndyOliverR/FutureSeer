import Link from "next/link"
import { MinimalNav } from "@/components/navigation/MinimalNav"

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen py-12 px-4 starfield-ultra-sharp">
      <MinimalNav />
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-300 mb-4">
            Shipping Policy 📦
          </h1>
          <p className="text-gray-300 text-lg">
            Information about our digital service delivery
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-slate-800/50 rounded-lg p-8 border border-slate-700 space-y-8">
          
          {/* Important Notice */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-amber-300 mb-3">
              ⚡ Digital Service Notice
            </h2>
            <p className="text-gray-300">
              FutureSeer is a digital platform providing AI-powered mystical insights and divination services. 
              We do not ship physical products. All our services are delivered digitally through our web platform.
            </p>
          </div>

          {/* Service Delivery */}
          <section>
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              Digital Service Delivery
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>Instant Access:</strong> Upon successful payment, you will have immediate access to all 
                purchased features and services through your FutureSeer account.
              </p>
              <p>
                <strong>Account Activation:</strong> Your subscription or service will be activated instantly 
                and you can begin using our AI-powered divination tools immediately.
              </p>
              <p>
                <strong>Email Confirmation:</strong> You will receive an email confirmation with your purchase 
                details and account access information.
              </p>
            </div>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              Service Availability
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>24/7 Access:</strong> Our platform is available 24 hours a day, 7 days a week, 
                allowing you to access your mystical insights whenever you need them.
              </p>
              <p>
                <strong>Global Access:</strong> FutureSeer is accessible worldwide, with no geographical 
                restrictions on our digital services.
              </p>
              <p>
                <strong>Device Compatibility:</strong> Our services work on desktop computers, laptops, 
                tablets, and mobile devices with internet connectivity.
              </p>
            </div>
          </section>

          {/* Technical Requirements */}
          <section>
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              Technical Requirements
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>Internet Connection:</strong> A stable internet connection is required to access 
                our services and receive real-time AI-powered insights.
              </p>
              <p>
                <strong>Web Browser:</strong> We support all modern web browsers including Chrome, Firefox, 
                Safari, and Edge.
              </p>
              <p>
                <strong>Account Creation:</strong> You must create a FutureSeer account to access our services 
                and manage your subscriptions.
              </p>
            </div>
          </section>

          {/* Service Updates */}
          <section>
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              Service Updates & Maintenance
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>Automatic Updates:</strong> Our platform receives regular updates to improve 
                functionality and add new features. These updates are applied automatically.
              </p>
              <p>
                <strong>Scheduled Maintenance:</strong> We may perform scheduled maintenance to ensure 
                optimal performance. Users will be notified in advance of any planned downtime.
              </p>
              <p>
                <strong>Feature Enhancements:</strong> New features and improvements are regularly added 
                to enhance your mystical experience at no additional cost.
              </p>
            </div>
          </section>

          {/* Customer Support */}
          <section>
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              Customer Support
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>Technical Support:</strong> If you experience any issues accessing our services, 
                our support team is available 24/7 to assist you.
              </p>
              <p>
                <strong>Contact Information:</strong> You can reach our support team at 
                <Link href="/contact" className="text-amber-400 hover:underline">our contact form</Link> for any questions or assistance.
              </p>
              <p>
                <strong>Help Resources:</strong> We provide comprehensive help documentation and tutorials 
                to help you get the most out of our services.
              </p>
            </div>
          </section>

          {/* Policy Updates */}
          <section>
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              Policy Updates
            </h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong>Changes to Policy:</strong> We may update this shipping policy from time to time 
                to reflect changes in our services or legal requirements.
              </p>
              <p>
                <strong>Notification:</strong> Users will be notified of any significant changes to this 
                policy via email or through our platform.
              </p>
              <p>
                <strong>Effective Date:</strong> This policy is effective as of January 1, 2025, and will 
                remain in effect until updated.
              </p>
            </div>
          </section>
        </div>

        {/* Contact Information */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            For questions about this policy, please <Link href="/contact" className="text-amber-400 hover:underline">contact us</Link>.
          </p>
          <p className="mt-2">
            Last updated: February 3, 2025
          </p>
        </div>
      </div>
    </div>
  )
} 