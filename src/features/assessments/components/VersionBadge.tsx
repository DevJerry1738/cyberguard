import React from 'react';

interface VersionBadgeProps {
  version: string;
}

export function VersionBadge({ version }: VersionBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-md bg-brand-500/10 px-2 py-0.5 text-xs font-semibold text-brand-400 ring-1 ring-inset ring-brand-500/20">
      v{version}
    </span>
  );
}
