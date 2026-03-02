"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface Material3FABProps {
  onClick: () => void;
  label?: string;
  icon?: React.ReactNode;
  extended?: boolean;
  className?: string;
}

/**
 * Material 3 Floating Action Button (FAB)
 * Follows Material Design 3 specifications with FutureSeer gold/amber styling
 */
export function Material3FAB({
  onClick,
  label = "Ask the Seer",
  icon = <Sparkles className="w-6 h-6" />,
  extended = false,
  className = "",
}: Material3FABProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        fixed bottom-6 right-6 z-50
        flex items-center gap-3
        bg-gradient-to-r from-amber-500 to-yellow-500
        text-white font-medium
        rounded-full
        shadow-lg
        transition-all duration-300
        ${extended || !isScrolled ? "px-6 py-4" : "p-4"}
        ${className}
        m3-elevation-3
        hover:m3-elevation-4
        active:m3-elevation-2
      `}
      whileHover={{}}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      style={{
        boxShadow: isHovered
          ? "var(--m3-elevation-4)"
          : "var(--m3-elevation-3)",
      }}
    >
      <motion.div
        animate={{ rotate: isHovered ? 360 : 0 }}
        transition={{ duration: 0.5 }}
      >
        {icon}
      </motion.div>
      <AnimatePresence>
        {(extended || !isScrolled) && (
          <motion.span
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="whitespace-nowrap"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
