'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
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

  if (!mounted) return null;

  return (
    <div
      data-tip-jar-widget="true"
      className="fixed z-[9999] pointer-events-none"
      style={{
        bottom: '160px',
        left: '16px',
        width: '56px',
        height: '56px',
      }}
    >
      <motion.button
        ref={buttonRef}
        onClick={() => open(buttonRef.current?.getBoundingClientRect())}
        whileHover={{}}
        whileTap={{ scale: 0.95 }}
        tabIndex={isAnyModalOpen ? -1 : 0}
        className="pointer-events-auto w-14 h-14 bg-transparent border-none flex items-center justify-center relative"
        aria-label="Open Tip Jar"
      >
        <Heart
          className="w-10 h-10 text-[#FF1744] relative z-10 drop-shadow-[0_0_8px_rgba(255,23,68,0.6)]"
          fill="none"
          strokeWidth={1.5}
          aria-hidden
        />
      </motion.button>
    </div>
  );
}
