import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-neutral-300 disabled:border-neutral-300",
        destructive:
          "border border-rose-600 bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500/20",
        outline:
          "border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500 hover:text-neutral-950",
        secondary:
          "border border-neutral-300 bg-white text-neutral-700 hover:border-neutral-500 hover:text-neutral-950",
        ghost: "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950",
        tinted:
          "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
        link: "text-blue-700 underline-offset-4 hover:underline hover:text-blue-900",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
