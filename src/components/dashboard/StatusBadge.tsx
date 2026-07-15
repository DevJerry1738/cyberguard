import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  let classes = 'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ';

  switch (normalized) {
    case 'active':
    case 'accepted':
    case 'completed':
      classes += 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20';
      break;
    case 'pending':
    case 'in progress':
      classes += 'bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20';
      break;
    case 'archived':
    case 'revoked':
      classes += 'bg-zinc-500/10 text-zinc-400 ring-1 ring-inset ring-zinc-500/20';
      break;
    case 'draft':
      classes += 'bg-zinc-500/10 text-zinc-400 ring-1 ring-inset ring-zinc-500/25 border border-zinc-800';
      break;
    case 'cancelled':
    case 'expired':
      classes += 'bg-red-500/10 text-red-400 ring-1 ring-inset ring-red-500/20';
      break;
    default:
      classes += 'bg-zinc-500/10 text-zinc-400 ring-1 ring-inset ring-zinc-500/20';
  }

  return (
    <span className={classes}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
