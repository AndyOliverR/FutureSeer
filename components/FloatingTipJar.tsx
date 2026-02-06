'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Heart } from 'lucide-react';
import { useTipJar } from '@/components/TipJarContext';

export function FloatingTipJar() {
  const { open } = useTipJar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  const buttonContent = (
    <div 
      className="fixed bottom-36 left-4 z-[2147483646] hidden md:block"
      data-tip-jar-widget="true"
      style={{
        position: 'fixed',
        bottom: '144px',
        left: '16px',
        top: 'auto',
        right: 'auto',
        zIndex: 2147483646,
        pointerEvents: 'auto',
        margin: 0,
        padding: 0,
        width: 'auto',
        height: 'auto',
        minWidth: '48px',
        minHeight: '48px',
        transform: 'translateZ(0)',
      }}
    >
      <button
        onClick={open}
        className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-transparent border-none hover:scale-110 transition-all duration-200 cursor-pointer m3-ripple m3-button-bounce m3-transition-emphasized m3-gpu-accelerated will-change-transform min-w-[44px] min-h-[44px]"
        title="Tip Jar - Show appreciation anytime"
        aria-label="Open Tip Jar"
      >
        <Heart className="w-7 h-7 sm:w-9 sm:h-9 text-[#FF1744] stroke-1 fill-none" />
      </button>
    </div>
  );

  return createPortal(buttonContent, document.body);
}
