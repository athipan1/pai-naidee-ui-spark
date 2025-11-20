import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
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
        "pastel-blue":
          "border-travel-blue-300/50 bg-travel-blue-50 text-travel-blue-500 hover:bg-travel-blue-100 dark:bg-travel-blue-500/10 dark:text-travel-blue-300 dark:border-travel-blue-500/20 dark:hover:bg-travel-blue-500/20",
        "pastel-green":
          "border-travel-green-300/50 bg-travel-green-100 text-travel-green-500 hover:bg-travel-green-200 dark:bg-travel-green-500/10 dark:text-travel-green-300 dark:border-travel-green-500/20 dark:hover:bg-travel-green-500/20",
        "pastel-pink":
          "border-accent-pink/50 bg-accent-pink/10 text-accent-pink hover:bg-accent-pink/20 dark:bg-accent-pink/10 dark:text-accent-pink dark:border-accent-pink/20 dark:hover:bg-accent-pink/20",
        "pastel-yellow":
          "border-accent-yellow/50 bg-accent-yellow/10 text-accent-yellow hover:bg-accent-yellow/20 dark:bg-accent-yellow/10 dark:text-accent-yellow dark:border-accent-yellow/20 dark:hover:bg-accent-yellow/20",
        "pastel-purple":
          "border-accent-purple/50 bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20 dark:bg-accent-purple/10 dark:text-accent-purple dark:border-accent-purple/20 dark:hover:bg-accent-purple/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
}

function Badge({ className, variant, asChild, ...props }: BadgeProps) {
  const Comp = "div";
  return (
    <Comp
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
