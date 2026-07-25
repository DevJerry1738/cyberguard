'use client';

import { useMemo } from 'react';

interface DomainProgress {
  domain_id: string;
  domain_name: string;
  answered: number;
  total: number;
}

interface ProgressBarProps {
  percentage: number;
  answered: number;
  totalRequired: number;
  currentQuestion: number;
  totalQuestions: number;
  domains?: DomainProgress[];
}

function getColorClass(pct: number): string {
  if (pct === 100) return 'from-emerald-400 to-emerald-500';
  if (pct >= 80) return 'from-brand-400 to-brand-500';
  if (pct >= 50) return 'from-amber-400 to-amber-500';
  return 'from-rose-400 to-rose-500';
}

function getDomainDotColor(answered: number, total: number): string {
  if (total === 0) return 'bg-slate-600';
  const pct = answered / total;
  if (pct === 1) return 'bg-emerald-400';
  if (pct >= 0.8) return 'bg-brand-400';
  if (pct >= 0.5) return 'bg-amber-400';
  if (pct > 0) return 'bg-rose-400';
  return 'bg-slate-600';
}

const MILESTONES = [25, 50, 75, 100];

export function ProgressBar({
  percentage,
  answered,
  totalRequired,
  currentQuestion,
  totalQuestions,
  domains,
}: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percentage));
  const colorClass = useMemo(() => getColorClass(clamped), [clamped]);
  const isComplete = clamped === 100;

  return (
    <div className="space-y-3">
      {/* Top row: counts and question position */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className={`font-medium ${isComplete ? 'text-emerald-400' : 'text-slate-300'}`}>
          {answered}/{totalRequired} required answered
        </span>
        <span>
          Question {currentQuestion} of {totalQuestions}
        </span>
      </div>

      {/* Main progress bar with milestone markers */}
      <div className="relative">
        {/* Track */}
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-800/80 relative">
          {/* Fill */}
          <div
            className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-500 ease-out`}
            style={{ width: `${clamped}%` }}
          />
        </div>

        {/* Milestone markers */}
        <div className="absolute inset-0 flex items-center pointer-events-none">
          {MILESTONES.map(m => (
            <div
              key={m}
              className={`absolute top-1/2 -translate-y-1/2 w-px h-3.5 transition-colors duration-300 ${
                clamped >= m ? 'bg-white/20' : 'bg-slate-700'
              }`}
              style={{ left: `${m}%` }}
            />
          ))}
        </div>
      </div>

      {/* Percentage label */}
      <div className="flex items-center justify-between">
        <div className={`text-sm font-semibold transition-colors duration-300 ${
          isComplete ? 'text-emerald-400' : 'text-white'
        }`}>
          {isComplete ? '✓ Complete' : `${clamped}% complete`}
        </div>
        {/* Milestone labels */}
        <div className="flex gap-2">
          {MILESTONES.map(m => (
            <span
              key={m}
              className={`text-[10px] font-medium transition-colors duration-300 ${
                clamped >= m ? 'text-slate-400' : 'text-slate-700'
              }`}
            >
              {m}%
            </span>
          ))}
        </div>
      </div>

      {/* Domain breakdown pills */}
      {domains && domains.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {domains.map(domain => {
            const domainPct = domain.total > 0 ? Math.round((domain.answered / domain.total) * 100) : 0;
            const dot = getDomainDotColor(domain.answered, domain.total);
            return (
              <div
                key={domain.domain_id}
                className="flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900/60 px-2.5 py-0.5"
                title={`${domain.domain_name}: ${domain.answered}/${domain.total} (${domainPct}%)`}
              >
                <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${dot}`} />
                <span className="max-w-[110px] truncate text-[11px] text-slate-400">
                  {domain.domain_name}
                </span>
                <span className="text-[11px] font-medium text-slate-300 ml-0.5">
                  {domainPct}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
