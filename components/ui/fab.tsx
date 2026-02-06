"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode
  label?: string
  extended?: boolean
  variant?: "primary" | "secondary" | "tertiary"
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "center"
  transition?: unknown
}

const FAB = React.forwardRef<HTMLButtonElement, FABProps>(
  ({ 
    className, 
    icon, 
    label, 
    extended = false, 
    variant = "primary",
    position = "bottom-right",
    transition: _transition,
    onDrag,
    onDragStart,
    onDragEnd,
    onDragOver,
    ...props 
  }, ref) => {
    const positionClasses = {
      "bottom-right": "bottom-6 right-6",
      "bottom-left": "bottom-6 left-6",
      "top-right": "top-6 right-6",
      "top-left": "top-6 left-6",
      "center": "bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2",
    }

    const variantClasses = {
      primary: "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900 hover:from-amber-600 hover:to-yellow-500",
      secondary: "bg-slate-800 text-white border border-amber-500/30 hover:bg-slate-700 hover:border-amber-500/50",
      tertiary: "bg-transparent text-amber-400 border-2 border-amber-500/50 hover:bg-amber-500/10",
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          "fixed z-50 flex items-center justify-center gap-3 rounded-full font-medium",
          "m3-elevation-3 hover:m3-elevation-4 m3-elevation-transition",
          "m3-ripple m3-button-bounce will-change-transform",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2",
          "transition-all m3-transition-emphasized",
          extended ? "px-6 h-14" : "w-14 h-14",
          variantClasses[variant],
          positionClasses[position],
          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 20,
        }}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        <AnimatePresence mode="wait">
          {icon && (
            <motion.div
              key="icon"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            >
              {icon}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {extended && label && (
            <motion.span
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              className="whitespace-nowrap overflow-hidden"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    )
  }
)
FAB.displayName = "FAB"

export { FAB }
