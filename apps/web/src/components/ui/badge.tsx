import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 backdrop-blur-sm tracking-wide uppercase",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Custom variants from plan
        blue: "bg-[rgba(88,166,255,0.1)] text-[#79c0ff] border-[rgba(88,166,255,0.3)] shadow-[0_0_10px_rgba(59,130,246,0.1)]",
        cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]",
        green: "bg-[rgba(63,185,80,0.1)] text-[#56d364] border-[rgba(63,185,80,0.3)] shadow-[0_0_10px_rgba(34,197,94,0.1)]",
        red: "bg-[rgba(248,81,73,0.1)] text-[#ff7b72] border-[rgba(248,81,73,0.3)] shadow-[0_0_10px_rgba(239,68,68,0.1)]",
        yellow: "bg-[rgba(210,153,34,0.1)] text-[#d29922] border-[rgba(210,153,34,0.3)] shadow-[0_0_10px_rgba(234,179,8,0.1)]",
      },
    },
    defaultVariants: {
      variant: "default",
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
