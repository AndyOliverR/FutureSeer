"use client";
import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Mailbox } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StandardsBadges } from "./StandardsBadges";

export function EnhancedFooter() {
  const [email, setEmail] = useState("");

  return (
    <footer className="relative border-t border-outline-variant bg-surface-dim/90 backdrop-blur-xl mt-auto py-4 px-4 pb-24 md:pb-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <h3 className="text-base text-amber-400 font-bold tracking-tighter">FutureSeer</h3>
            <div className="h-4 w-[1px] bg-outline-variant/30 hidden sm:block" />
            <p className="text-[10px] text-surface-on-variant leading-none hidden sm:block">Ancient wisdom meets AI.</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/tools" className="text-[11px] font-medium text-surface-on-variant hover:text-primary">Tools</Link>
            <span className="text-outline-variant/50 text-[10px] hidden sm:inline">·</span>
            <Link href="/pricing" className="text-[11px] font-medium text-surface-on-variant hover:text-primary">Pricing</Link>
            <span className="text-outline-variant/50 text-[10px] hidden sm:inline">·</span>
            <Link href="/privacy" className="text-[11px] font-medium text-surface-on-variant hover:text-primary">Privacy</Link>
          </div>
          <div className="flex-1 min-w-[160px] max-w-xs">
            <form className="flex gap-1 items-center bg-surface-container-low p-0.5 pr-1 rounded-full border border-outline-variant/20" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Stay updated"
                className="bg-transparent border-none h-7 text-[10px] flex-1 focus-visible:ring-0"
              />
              <Button size="sm" className="h-6 px-3 bg-primary text-[9px] rounded-full font-bold">
                Join
              </Button>
            </form>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link href="/support" className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary-container transition-colors" aria-label="Support">
              <MessageCircle className="w-4 h-4 text-primary" />
            </Link>
            <Link href="/contact" className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-primary-container transition-colors" aria-label="Contact">
              <Mailbox className="w-4 h-4 text-primary" />
            </Link>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-outline-variant/10 flex flex-wrap justify-between items-center gap-2 text-[9px] text-surface-on-variant uppercase tracking-widest opacity-60">
          <p>© 2025 FutureSeer</p>
          <StandardsBadges variant="footer" showToolCount={false} />
        </div>
      </div>
    </footer>
  );
}
