import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all m3-transition-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 m3-ripple m3-button-bounce will-change-transform active:scale-[0.95] hover:scale-[1.02] m3-label-large relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-[var(--m3-primary)] text-[var(--m3-on-primary)] hover:bg-[var(--m3-primary)]/90 active:bg-[var(--m3-primary)]/80 m3-elevation-1 hover:m3-elevation-2 active:m3-elevation-0 m3-elevation-transition",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-[var(--m3-outline)] bg-transparent text-[var(--m3-primary)] hover:bg-[var(--m3-primary-container)] active:bg-[var(--m3-primary-container)]/80 m3-elevation-0 hover:m3-elevation-1 active:m3-elevation-0 m3-elevation-transition",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "relative overflow-hidden bg-gradient-to-r from-amber-500/20 to-yellow-400/20 backdrop-blur-xl border border-amber-300/30 shadow-2xl shadow-amber-500/20 text-slate-900 font-semibold hover:from-amber-500/30 hover:to-yellow-400/30 hover:border-amber-300/50 hover:shadow-amber-500/30 transition-all duration-300 m3-transition-emphasized before:absolute before:inset-0 before:bg-gradient-to-r before:from-amber-400/40 before:to-yellow-300/40 before:opacity-60 before:rounded-2xl before:pointer-events-none before:transition-opacity before:duration-300 hover:before:opacity-80 after:absolute after:inset-0 after:bg-gradient-to-r after:from-white/20 after:to-transparent after:opacity-0 hover:after:opacity-100 after:transition-opacity after:duration-300 after:rounded-2xl after:pointer-events-none",
        /* Material 3 Button Variants */
        "filled": "bg-[var(--m3-primary)] text-[var(--m3-on-primary)] hover:bg-[var(--m3-primary)]/90 active:bg-[var(--m3-primary)]/80 m3-elevation-1 hover:m3-elevation-2 active:m3-elevation-0 m3-elevation-transition",
        "filled-tonal": "bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] hover:bg-[var(--m3-primary-container)]/80 active:bg-[var(--m3-primary-container)]/70 m3-elevation-0 hover:m3-elevation-1 active:m3-elevation-0 m3-elevation-transition",
        "outlined": "border border-[var(--m3-outline)] bg-transparent text-[var(--m3-primary)] hover:bg-[var(--m3-primary-container)] active:bg-[var(--m3-primary-container)]/80 m3-elevation-0 hover:m3-elevation-1 active:m3-elevation-0 m3-elevation-transition",
        "text": "bg-transparent text-[var(--m3-primary)] hover:bg-[var(--m3-primary-container)] active:bg-[var(--m3-primary-container)]/80 m3-elevation-0",
        "fab": "bg-[var(--m3-primary-container)] text-[var(--m3-on-primary-container)] hover:bg-[var(--m3-primary-container)]/80 active:bg-[var(--m3-primary-container)]/70 rounded-full m3-elevation-3 hover:m3-elevation-4 active:m3-elevation-2 m3-elevation-transition shadow-lg",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-xl px-3",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10",
        fab: "h-14 w-14 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
