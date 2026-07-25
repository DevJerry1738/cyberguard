import Link from 'next/link';
import { CalendarClock, ArrowRight, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import type { AssessmentSession } from '../schemas/session';

interface SessionCardProps {
  session: AssessmentSession;
}

function getProgressColor(pct: number, status: string): string {
  if (status === 'Completed') return 'bg-emerald-500';
  if (status === 'Cancelled' || status === 'Archived') return 'bg-slate-600';
  if (pct >= 80) return 'bg-brand-500';
  if (pct >= 50) return 'bg-amber-500';
  if (pct > 0) return 'bg-rose-500';
  return 'bg-slate-600';
}

function getProgressTextColor(pct: number, status: string): string {
  if (status === 'Completed') return 'text-emerald-400';
  if (pct >= 80) return 'text-brand-400';
  if (pct >= 50) return 'text-amber-400';
  if (pct > 0) return 'text-rose-400';
  return 'text-slate-500';
}

function isDueSoon(dueAt: string | null | undefined): boolean {
  if (!dueAt) return false;
  const diff = new Date(dueAt).getTime() - Date.now();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000; // within 3 days
}

function isOverdue(dueAt: string | null | undefined): boolean {
  if (!dueAt) return false;
  return new Date(dueAt).getTime() < Date.now();
}

export function SessionCard({ session }: SessionCardProps) {
  const pct = session.progress_percent ?? 0;
  const barColor = getProgressColor(pct, session.status);
  const textColor = getProgressTextColor(pct, session.status);
  const dueSoon = isDueSoon(session.due_at);
  const overdue = isOverdue(session.due_at);

  return (
    <div className="rounded-2xl border border-surface-800 bg-surface-900/40 p-4 transition-colors hover:border-surface-700">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-semibold text-white truncate">{session.template_name}</h3>
            <StatusBadge status={session.status} />
            {overdue && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-[10px] font-semibold text-red-300">
                <AlertTriangle className="h-2.5 w-2.5" />
                Overdue
              </span>
            )}
            {dueSoon && !overdue && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                <AlertTriangle className="h-2.5 w-2.5" />
                Due soon
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-400">{session.template_framework} • v{session.template_version}</p>
        </div>
        <Link
          href={`/assessments/sessions/${session.id}/wizard`}
          className="inline-flex flex-shrink-0 items-center gap-1 rounded-lg border border-surface-700 px-2.5 py-1.5 text-xs text-slate-300 hover:border-brand-500 hover:text-white transition-colors"
        >
          Open
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Progress bar */}
      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" />
            {session.started_at ? new Date(session.started_at).toLocaleDateString() : 'Not started'}
          </span>
          <span className={`font-semibold ${textColor}`}>
            {session.status === 'Completed' ? '✓ Complete' : `${pct}%`}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
            style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
