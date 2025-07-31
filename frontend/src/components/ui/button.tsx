import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 transform",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg hover:shadow-destructive/25 hover:-translate-y-0.5 transform",
        outline:
          "border-2 border-primary/20 bg-background/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/40 text-foreground shadow-sm hover:shadow-lg",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-md hover:shadow-lg hover:-translate-y-0.5 transform",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-glow",
        success: "bg-success text-success-foreground hover:bg-success/90 shadow-lg hover:shadow-success/25 hover:-translate-y-0.5 transform",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-lg hover:shadow-warning/25 hover:-translate-y-0.5 transform",
        professional: "bg-gradient-to-r from-primary via-primary-glow to-primary text-primary-foreground hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 transform transition-all duration-300 border border-primary/20",
        glass: "glass border border-white/10 text-foreground hover:border-primary/30 hover:bg-white/5 backdrop-blur-xl",
        premium: "bg-gradient-to-br from-primary via-primary-glow to-emerald-400 text-primary-foreground shadow-2xl hover:shadow-primary/50 hover:scale-105 transform transition-all duration-300 border border-primary/30",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-11 w-11 rounded-lg",
        xl: "h-14 rounded-xl px-10 text-lg",
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
