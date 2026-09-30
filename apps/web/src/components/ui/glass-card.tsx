import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const glassCardVariants = cva(
  "relative rounded-lg bg-white border border-neutral-200 text-neutral-900 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "",
        cyan: "",
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
