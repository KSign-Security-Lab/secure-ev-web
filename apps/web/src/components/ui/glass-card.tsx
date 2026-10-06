import * as React from "react"

import { cn } from "~/lib/utils"

/**
 * Flat white surface primitive (light theme). Unlike `Card` it is unopinionated
 * about padding/gap, so callers control their own layout (tables, feature tiles).
 */
export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {}

function GlassCard({ className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-lg border border-neutral-200 bg-white text-neutral-900 transition-all duration-300",
        className
      )}
      {...props}
    />
  )
}

export { GlassCard }
