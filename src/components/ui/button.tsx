import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import {ReactNode} from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-medium text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-[1.6rem] [&_svg]:shrink-0 ring-offset-neutral-950 focus-visible:ring-neutral-300 hover:border-opac-gl-4 border-solid border-2 border-transparent h-max",
  {
    variants: {
      variant: {
        default: "bg-bg-hover",
        brand: "bg-twitch-purple hover:bg-twitch-purple-8 hover:border-transparent",
        destructive:
          "bg-brand-accent-ruby hover:bg-brand-accent-ruby/80 hover:border-transparent",
        outline:
          "border border-neutral-800 bg-neutral-950 hover:bg-neutral-800 hover:text-neutral-50",
        secondary:
          "bg-neutral-800 text-neutral-50 hover:bg-neutral-800/80",
        ghost: "hover:bg-neutral-800 hover:text-neutral-50",
        link: "underline-offset-4 hover:underline text-neutral-50",
      },
      size: {
        default: "p-[2px]",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  icon?: ReactNode | undefined
  h6sb?: boolean //h6 semibold
}

const SimpleButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
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

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, icon, h6sb, asChild = false, ...props }, ref) => {
    const children = props.children

    return (
      <SimpleButton className={className} variant={variant} size={size} asChild={asChild} {...props} ref={ref}>
        <div className={"px-2 min-h-8 flex flex-row justify-between"}>
          {h6sb ? <h6 className={"font-semibold"}>{children}</h6> : children}
          {icon ?
            <div className={"pl-4 flex"}>
              <div className={"h-8 w-8 m-auto justify-center items-center inline-flex"}>
                {icon}
              </div>
            </div>
            : null
          }
        </div>
      </SimpleButton>
    )
  }
)

Button.displayName = "Button"

export { Button, SimpleButton, buttonVariants }
