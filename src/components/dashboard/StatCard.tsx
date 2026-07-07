import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  note?: string;
  trend?: { value: string; positive: boolean };
  colorClass?: string;
  bgClass?: string;
  borderClass?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  note,
  trend,
  colorClass = 'text-brand-400',
  bgClass = 'bg-brand-500/10',
  borderClass = 'border-brand-500/20',
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-surface-800/60 bg-surface-900/80 p-5 flex flex-col gap-3 hover:border-surface-700/60 transition-colors">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">{label}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${bgClass} border ${borderClass}`}>
          <Icon className={`h-4 w-4 ${colorClass}`} />
        </div>
      </div>
      <div>
        <span className="text-3xl font-bold text-white font-display">{value}</span>
        {trend && (
          <span className={`ml-2 text-xs font-medium ${trend.positive ? 'text-accent-400' : 'text-rose-400'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
        )}
        {note && <p className="text-xs text-slate-500 mt-1">{note}</p>}
      </div>
    </div>
  );
}
