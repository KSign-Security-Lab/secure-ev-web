import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const glassCardVariants = cva(
  "relative rounded-3xl bg-slate-900/40 border border-slate-800 backdrop-blur-sm transition-all duration-300",
  {
    variants: {
      variant: {
        default: "hover:bg-slate-900/60 hover:border-blue-500/30",
        cyan: "hover:bg-slate-900/60 hover:border-cyan-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface GlassCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof glassCardVariants> {}

function GlassCard({ className, variant, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(glassCardVariants({ variant }), className)}
      {...props}
    />
  )
}

export { GlassCard, glassCardVariants }
