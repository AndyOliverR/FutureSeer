import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { MysticalFeedback } from "@/components/MysticalFeedback";
import { TestAuth } from "@/components/TestAuth";
import { TestModeSwitcher } from "@/components/TestModeSwitcher";
import { AuthProvider } from "@/hooks/use-auth";

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
        <AuthProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {children}
            <Footer />
            <MysticalFeedback />
            <TestAuth />
            <TestModeSwitcher />
          </div>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}