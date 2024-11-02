import * as React from "react";
import {cn} from "@/lib/utils.ts";

const Spinner = React.forwardRef<HTMLSpanElement, React.ButtonHTMLAttributes<HTMLSpanElement>>(
  ({className, ...props}, ref) => {
    return (
      <span
        className={cn(
          "h-[2.2rem] w-[2.2rem] rounded-rounded border-2 border-solid border-opac-w-3 border-l-twitch-purple-11 relative aspect-square block spinner",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Spinner.displayName = "Spinner"

export default Spinner;
