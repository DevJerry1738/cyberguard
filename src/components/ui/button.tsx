import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "destructive";
  size?: "sm" | "md" | "lg" | "xl";
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950 disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap";

    const variants = {
      primary:
        "bg-brand-500 text-white hover:bg-brand-600 shadow-glow-sm hover:shadow-glow-md active:scale-[0.98]",
      secondary:
        "bg-surface-800 text-slate-100 border border-surface-700 hover:bg-surface-700 hover:border-surface-600 active:scale-[0.98]",
      ghost:
        "text-slate-300 hover:bg-surface-800 hover:text-white active:scale-[0.98]",
      outline:
        "border border-brand-500/50 text-brand-400 hover:bg-brand-500/10 hover:border-brand-500 active:scale-[0.98]",
      destructive:
        "bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.98]",
    };

    const sizes = {
      sm:  "h-8  px-3 text-sm",
      md:  "h-10 px-4 text-sm",
      lg:  "h-11 px-6 text-base",
      xl:  "h-13 px-8 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
export type { ButtonProps };
