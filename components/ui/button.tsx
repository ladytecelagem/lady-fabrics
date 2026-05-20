"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium tracking-wide transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ink",
  {
    variants: {
      variant: {
        default: "bg-ink text-bone hover:bg-graphite",
        outline: "border border-ink text-ink hover:bg-ink hover:text-bone",
        ghost: "text-ink hover:bg-ink/5",
        link: "text-ink underline-offset-4 hover:underline",
        bone: "bg-bone text-ink hover:bg-wool",
      },
      size: {
        sm: "h-9 px-4 text-xs uppercase",
        md: "h-11 px-6 text-sm uppercase",
        lg: "h-14 px-8 text-sm uppercase",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";
export { buttonVariants };
