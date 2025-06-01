import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"


const badgeVariants = cva(
  `
    inline-flex items-center 
    rounded-full border-2
    px-2.5 py-0.5 
    text-xs 
    font-semibold 
    transition-colors 
    duration-500
    focus:outline-none 
    focus:ring-2 
    focus:ring-ring 
    focus:ring-offset-2
  `
  ,
  {
    variants: {
      variant: {
        primary:`
          border-primary 
          bg-primary/10 
          text-foreground/75 
          hover:bg-primary/40`,
        secondary:
          "border-transparent bg-secondary text-secondary-foreground/75 hover:bg-secondary/10",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground/75 hover:bg-destructive/80",
        disabled:`
          bg-cyber-black/50 
          border-cyber-purple-dark/20
          text-primary/20 
          hover:bg-cyber-black/30
          hover:text-primary/30`
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
