"use client";
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Optional label displayed next to the checkbox */
  label?: string;
  /** Optional callback for controlled checked state */
  onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, onChange, onCheckedChange, ...props }, ref) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(event);
      onCheckedChange?.(event.target.checked);
    };

    return (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          ref={ref}
          className={cn(
            "h-4 w-4 rounded border border-surface-700 bg-surface-900 text-brand-500 focus:ring-2 focus:ring-brand-500/30 focus:outline-none",
            className
          )}
          onChange={handleChange}
          {...props}
        />
        {label && <span className="text-sm text-slate-300">{label}</span>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export { Checkbox };
