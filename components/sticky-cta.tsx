"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export function StickyCTA() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Defer initialization slightly for better initial page load
    const initTimer = setTimeout(() => {
      let ticking = false;

      const handleScroll = () => {
        if (!ticking) {
          rafRef.current = requestAnimationFrame(() => {
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight;
            const distanceFromBottom = docHeight - (scrollPosition + windowHeight);
            
            // Only update if scroll position changed significantly (throttle more aggressively)
            const scrollDelta = Math.abs(scrollPosition - lastScrollY.current);
            if (scrollDelta < 50) {
              ticking = false;
              return;
            }
            
            lastScrollY.current = scrollPosition;
            
            // Show sticky CTA after scrolling past hero section but hide near footer
            const passedHero = scrollPosition > windowHeight * 0.5;
            const nearFooter = distanceFromBottom < 200;
            setIsVisible(passedHero && !nearFooter);
            ticking = false;
          });
          ticking = true;
        }
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      
      // Initial check
      handleScroll();
      
      return () => {
        window.removeEventListener("scroll", handleScroll);
        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
        }
      };
    }, 200); // Small delay to not interfere with initial page load

    return () => {
      clearTimeout(initTimer);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []); // Empty deps - only run once on mount

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 md:hidden m3-transition-standard">
      <Button
        size="lg"
        className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-slate-900 font-semibold rounded-full touch-manipulation m3-ripple m3-button-bounce"
        onClick={() => router.push("/signup")}
      >
        <span className="flex items-center gap-2">
          Join the Innovation Experiment
          <ArrowRight className="w-4 h-4" />
        </span>
      </Button>
    </div>
  );
}

