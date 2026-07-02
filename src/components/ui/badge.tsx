import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "brand" | "success" | "warning" | "danger" | "outline";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-surface-800 text-slate-300 border border-surface-700",
      brand:   "bg-brand-500/10 text-brand-400 border border-brand-500/25",
      success: "bg-accent-500/10 text-accent-400 border border-accent-500/25",
      warning: "bg-amber-500/10 text-amber-400 border border-amber-500/25",
      danger:  "bg-rose-500/10 text-rose-400 border border-rose-500/25",
      outline: "border border-slate-600 text-slate-400",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = "Badge";

export { Badge };
