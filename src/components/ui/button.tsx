import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold cursor-pointer select-none transition-[transform,box-shadow,background-color,border-color,color] duration-100 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:active:translate-x-0 disabled:active:translate-y-0 active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-2 border-primary bg-primary text-primary-foreground shadow-brutal-xs hover:bg-primary/90 hover:shadow-brutal-sm",
        destructive:
          "border-2 border-destructive bg-destructive text-destructive-foreground shadow-brutal-xs hover:bg-destructive/90 hover:shadow-brutal-sm",
        outline:
          "border-2 border-border bg-surface text-foreground shadow-brutal-xs hover:bg-accent hover:border-foreground/80 hover:shadow-brutal-sm",
        secondary:
          "border-2 border-border bg-secondary text-secondary-foreground shadow-brutal-xs hover:bg-secondary/80 hover:shadow-brutal-sm",
        ghost:
          "border-2 border-transparent hover:bg-accent hover:text-accent-foreground active:translate-x-0 active:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline active:translate-x-0 active:translate-y-0",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8 font-bold",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
