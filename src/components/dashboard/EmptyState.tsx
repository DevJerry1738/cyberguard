import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function EmptyState({ icon: Icon = PackageOpen, title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-dashed border-surface-700/60 bg-surface-900/40">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-800/60 border border-surface-700/60 mb-4">
        <Icon className="h-8 w-8 text-slate-500" />
      </div>
      <h3 className="font-display text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-6">{description}</p>
      {children}
    </div>
  );
}
