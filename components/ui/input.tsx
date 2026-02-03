import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-[var(--m3-outline-variant)] bg-[var(--m3-surface-container-low)] px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[var(--m3-on-surface-variant)] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm m3-input-focus m3-body-medium text-[var(--m3-on-surface)] transition-all m3-transition-standard",
          "hover:border-[var(--m3-outline)]",
          "focus:border-[var(--m3-primary)] focus:shadow-[0_0_0_3px_var(--m3-primary-container)]",
          "active:border-[var(--m3-primary)]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
