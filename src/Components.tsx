import Spinner from "@/components/Spinner.tsx";
import * as React from "react";
import {cn} from "@/lib/utils.ts";

export const Pending = React.forwardRef<HTMLDivElement, React.ButtonHTMLAttributes<HTMLDivElement>>(
  ({className, ...props}, ref) => {
  return (
    <div className={cn("w-screen h-screen fixed top-0 z-40 flex items-center justify-center bg-bg-base", className)} ref={ref}{...props}>
      <Spinner/>
    </div>
  )
});

Pending.displayName = "Pending"
