"use client"

import Link from "next/link"
import { X, Instagram, Facebook, Youtube } from 'lucide-react'
import { FutureSeerWordmark } from "@/components/brand/FutureSeerWordmark"

export function Footer() {
  return (
    <footer className="bg-slate-900/80 backdrop-blur-sm border-t border-slate-700 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-2">
            <FutureSeerWordmark as="h3" size="md" className="mb-4" />
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
                <Link href="/" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-amber-400 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/tools" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Tools
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-lg font-semibold text-amber-300 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-amber-400 transition-colors">
                  Contact Us
                </Link>
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
            <Link href="/terms" className="text-gray-400 hover:text-amber-400 text-sm transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-gray-400 hover:text-amber-400 text-sm transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-amber-400 text-sm transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
} 