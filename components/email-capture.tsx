"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle } from "lucide-react";

export function EmailCapture() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Integrate with email service (Mailchimp, SendGrid, etc.)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setLoading(false);
    setEmail("");
  };

  if (submitted) {
    return (
      <div className="text-center p-8 rounded-2xl bg-green-900/20 border border-green-500/30">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-xl font-serif text-green-200 mb-2">
          Welcome to the Journey!
        </h3>
        <p className="text-green-300/70">
          Check your inbox for your cosmic welcome gift
        </p>
      </div>
    );
  }

  return (
    <section className="py-12 md:py-16 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <Mail className="w-12 h-12 text-amber-400 mx-auto mb-6" />
        <h2 className="text-3xl md:text-4xl font-serif text-amber-200 mb-4">
          Start Your Cosmic Journey
        </h2>
        <p className="text-slate-400 mb-8">
          Get a free birth chart and weekly cosmic insights delivered to your inbox
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500"
          />
          <Button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-slate-900 font-semibold"
          >
            {loading ? "Sending..." : "Get Started"}
          </Button>
        </form>
        
        <p className="text-xs text-slate-500 mt-4">
          No spam, ever. Unsubscribe anytime. Read our{" "}
          <a href="/privacy-policy" className="text-amber-400 hover:underline">
            privacy policy
          </a>
        </p>
      </div>
    </section>
  );
}
