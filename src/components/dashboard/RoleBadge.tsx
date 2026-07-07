import React from 'react';

type RoleName = 'Owner' | 'Admin' | 'Security Officer' | 'Manager' | 'Employee' | string;

const ROLE_STYLES: Record<string, string> = {
  'Owner': 'bg-brand-500/15 text-brand-400 border-brand-500/25',
  'Admin': 'bg-violet-500/15 text-violet-400 border-violet-500/25',
  'Security Officer': 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  'Manager': 'bg-accent-500/15 text-accent-400 border-accent-500/25',
  'Employee': 'bg-surface-700/50 text-slate-400 border-surface-600/50',
};

interface RoleBadgeProps {
  role: RoleName;
  className?: string;
}

export function RoleBadge({ role, className = '' }: RoleBadgeProps) {
  const styles = ROLE_STYLES[role] ?? 'bg-surface-700/50 text-slate-400 border-surface-600/50';
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles} ${className}`}
    >
      {role}
    </span>
  );
}
