import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-rounded border-2 border-opac-gl-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-twitch-purple data-[state=checked]:bg-black data-[state=unchecked]:bg-transparent checkbox-check",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "absolute pointer-events-none block h-[1.2rem] w-[1.2rem] rounded-rounded bg-white shadow-lg ring-0 data-[state=checked]:bg-twitch-purple data-[state=checked]:left-[calc(100%-0.2rem)] data-[state=checked]:translate-x-[-100%] data-[state=unchecked]:left-[0.2rem] data-[state=unchecked]:translate-x-[0%] transition-all"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
