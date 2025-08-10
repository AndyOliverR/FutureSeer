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
      "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-slate-600/50 backdrop-blur-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50 shadow-lg hover:shadow-xl data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-amber-500/30 data-[state=checked]:to-yellow-400/30 data-[state=checked]:border-amber-400/60 data-[state=checked]:shadow-amber-400/20 data-[state=unchecked]:bg-slate-800/50 data-[state=unchecked]:border-slate-600/50",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-all duration-300 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-1 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-amber-300 data-[state=checked]:to-yellow-200 data-[state=checked]:shadow-amber-300/50 data-[state=unchecked]:bg-gradient-to-r data-[state=unchecked]:from-slate-300 data-[state=unchecked]:to-slate-100 data-[state=unchecked]:shadow-slate-300/30"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
