"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 backdrop-blur-md m3-transition-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--m3-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--m3-surface)] disabled:cursor-not-allowed disabled:opacity-50 m3-elevation-1 hover:m3-elevation-2 m3-elevation-transition m3-ripple data-[state=checked]:bg-[var(--m3-primary)] data-[state=checked]:border-[var(--m3-primary)] data-[state=unchecked]:bg-[var(--m3-surface-container-high)] data-[state=unchecked]:border-[var(--m3-outline)]",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full ring-0 m3-transition-standard m3-elevation-1 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-1 data-[state=checked]:bg-[var(--m3-on-primary)] data-[state=unchecked]:bg-[var(--m3-on-surface-variant)]"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
