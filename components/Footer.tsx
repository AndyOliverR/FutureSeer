"use client"

import { X, Instagram, Facebook, Youtube, Share2 } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-900/80 backdrop-blur-sm border-t border-slate-700 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-2">
            <h3 className="text-xl font-bold text-amber-300 mb-4">FutureSeer</h3>
            <p className="text-gray-400 mb-4">
              Where ancient wisdom meets artificial intelligence. Unlock the mysteries of your path 
              through personalized divination.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors" title="Follow us on X (Twitter)">
                <X className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors" title="Follow us on Instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors" title="Follow us on Facebook">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors" title="Watch our videos on YouTube">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-amber-300 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-400 hover:text-amber-400 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="/tools" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Tools
                </a>
              </li>
              <li>
                <a href="/subscribe" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold text-amber-300 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="/terms" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/refund-policy" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Refund Policy
                </a>
              </li>
              <li>
                <a href="/shipping-policy" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Shipping Policy
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 FutureSeer. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="/terms" className="text-gray-400 hover:text-amber-400 text-sm transition-colors">
              Terms
            </a>
            <a href="/privacy" className="text-gray-400 hover:text-amber-400 text-sm transition-colors">
              Privacy
            </a>
            <a href="/contact" className="text-gray-400 hover:text-amber-400 text-sm transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
} 