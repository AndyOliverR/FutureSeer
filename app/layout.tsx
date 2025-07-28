import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import { TestAuth } from "@/components/TestAuth";
import { TestModeSwitcher } from "@/components/TestModeSwitcher";
import { MysticalFeedback } from "@/components/MysticalFeedback";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FutureSeer - AI-Powered Mystical Insights",
  description: "Discover your cosmic path with AI-powered divination, astrology, and mystical guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {children}
            <Footer />
            
            {/* Test div to verify layout is working */}
            <div 
              className="fixed top-4 left-4 z-[999999] bg-blue-500 text-white p-2 rounded text-xs"
              style={{ 
                position: 'fixed',
                top: '16px',
                left: '16px',
                zIndex: 999999,
                backgroundColor: 'blue',
                color: 'white',
                padding: '8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              LAYOUT LOADED
            </div>
            
            <TestAuth />
            <TestModeSwitcher />
            <MysticalFeedback />
          </div>
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}