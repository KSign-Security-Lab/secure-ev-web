import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-blue-300 bg-blue-50 text-blue-700",
        secondary: "border-neutral-300 bg-neutral-100 text-neutral-700",
        destructive: "border-rose-300 bg-rose-50 text-rose-700",
        outline: "border-neutral-300 text-neutral-700",
        // Status tones (light, flat)
        blue: "border-blue-300 bg-blue-50 text-blue-700",
        cyan: "border-sky-300 bg-sky-50 text-sky-700",
        green: "border-green-300 bg-green-50 text-green-700",
        red: "border-rose-300 bg-rose-50 text-rose-700",
        yellow: "border-amber-300 bg-amber-50 text-amber-700",
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
