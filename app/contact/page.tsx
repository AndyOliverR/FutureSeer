export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-amber-300 mb-4">
            Contact Us ✨
          </h1>
          <p className="text-gray-300 text-lg">
            Get in touch with our mystical support team
          </p>
        </div>

        {/* Contact Information */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Contact Details */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h2 className="text-2xl font-semibold text-amber-300 mb-4">
                Get in Touch
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">Email Support</p>
                    <p className="text-amber-400">support@futureseer.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">Response Time</p>
                    <p className="text-amber-400">Within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-300 font-medium">Business Hours</p>
                    <p className="text-amber-400">24/7 Support Available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              Send us a Message
            </h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Subject *
                </label>
                <select className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing & Payments</option>
                  <option value="feature">Feature Request</option>
                  <option value="bug">Bug Report</option>
                  <option value="partnership">Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Message *
                </label>
                <textarea
                  rows={4}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Tell us how we can help you..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              >
                Send Message ✨
              </button>
            </form>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-semibold text-amber-300 mb-4">
            Additional Support
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">Help Center</h3>
              <p className="text-gray-400 mb-3">
                Find answers to common questions and learn how to use FutureSeer effectively.
              </p>
              <a href="/how-to-use" className="text-amber-400 hover:text-amber-300 transition-colors">
                Visit Help Center →
              </a>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">Community</h3>
              <p className="text-gray-400 mb-3">
                Connect with other users and share your mystical experiences.
              </p>
              <a href="/subscribe" className="text-amber-400 hover:text-amber-300 transition-colors">
                Join Community →
              </a>
            </div>
          </div>
        </div>

        {/* Legal Information */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            For legal inquiries, please email: <span className="text-amber-400">legal@futureseer.com</span>
          </p>
          <p className="mt-2">
            FutureSeer is committed to providing excellent support to all our users.
          </p>
        </div>
      </div>
    </div>
  )
} 