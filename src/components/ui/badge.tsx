import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 select-none",
  {
    variants: {
      variant: {
        default:
          "border-2 border-primary bg-primary text-primary-foreground shadow-brutal-xs",
        secondary:
          "border-2 border-border bg-secondary text-secondary-foreground shadow-brutal-xs",
        destructive:
          "border-2 border-destructive bg-destructive text-destructive-foreground shadow-brutal-xs",
        outline:
          "border-2 border-border bg-surface text-foreground shadow-brutal-xs",
        success:
          "border-2 border-success bg-success/15 text-success font-mono",
        warning:
          "border-2 border-warning bg-warning/15 text-warning font-mono",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
