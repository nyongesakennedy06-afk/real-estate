import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand-primary text-white shadow hover:bg-brand-primary/80",
        secondary:
          "border-transparent bg-brand-surface text-brand-ink hover:bg-brand-surface/80",
        destructive:
          "border-transparent bg-rose-100 text-rose-800 border-rose-200",
        outline: "text-brand-ink border-brand-border",
        // Business status variants
        pending: "bg-amber-50 text-amber-900 border-amber-300",
        confirmed: "bg-emerald-50 text-emerald-900 border-emerald-300",
        rescheduled: "bg-sky-50 text-sky-900 border-sky-300",
        closed: "bg-stone-100 text-stone-700 border-stone-300",
        accent: "bg-brand-accent-light text-brand-accent border-brand-accent/30 font-bold",
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
