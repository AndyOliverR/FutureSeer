'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Heart } from 'lucide-react';
import { useTipJar } from '@/components/TipJarContext';
import { useModalOpen } from '@/components/ModalOpenContext';

export function FloatingTipJar() {
  const { open } = useTipJar();
  const { isAnyModalOpen } = useModalOpen();
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || typeof document === 'undefined') {
    return null;
  }

  const buttonContent = (
    <div
      className="z-[2147483646]"
      data-tip-jar-widget="true"
      aria-hidden={isAnyModalOpen}
      style={{
        position: 'fixed',
        bottom: '144px',
        left: 4,
        top: 'auto',
        right: 'auto',
        zIndex: 2147483646,
        pointerEvents: 'auto',
        margin: 0,
        padding: 0,
        width: 48,
        height: 48,
        minWidth: 48,
        minHeight: 48,
        flexShrink: 0,
        transform: 'translateZ(0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }}
    >
      <button
        ref={buttonRef}
        onClick={() => open(buttonRef.current?.getBoundingClientRect())}
        tabIndex={isAnyModalOpen ? -1 : 0}
        className="flex-shrink-0 w-10 h-10 min-w-[40px] min-h-[40px] flex items-center justify-center bg-transparent border-none hover:scale-110 transition-all duration-200 cursor-pointer m3-ripple m3-button-bounce m3-transition-emphasized m3-gpu-accelerated will-change-transform"
        style={{ width: 40, height: 40, minWidth: 40, minHeight: 40, flexShrink: 0 }}
        title="Tip Jar - Show appreciation anytime"
        aria-label="Open Tip Jar"
      >
        <Heart className="shrink-0 w-10 h-10 text-[#FF1744] stroke-1 fill-none" style={{ width: 40, height: 40, flexShrink: 0 }} aria-hidden />
      </button>
    </div>
  );

  return createPortal(buttonContent, document.body);
}
