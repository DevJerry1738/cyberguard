import Link from 'next/link';
import { CalendarClock, ArrowRight, Users } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import type { AssessmentSession } from '../schemas/session';

interface SessionCardProps {
  session: AssessmentSession;
}

export function SessionCard({ session }: SessionCardProps) {
  return (
    <div className="rounded-2xl border border-surface-800 bg-surface-900/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-white">{session.template_name}</h3>
            <StatusBadge status={session.status} />
          </div>
          <p className="mt-1 text-sm text-slate-400">{session.template_framework} • v{session.template_version}</p>
        </div>
        <Link
          href={`/assessments/sessions/${session.id}/wizard`}
          className="inline-flex items-center gap-1 rounded-lg border border-surface-700 px-2.5 py-1.5 text-xs text-slate-300 hover:border-brand-500 hover:text-white transition-colors"
        >
          Open
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5" />
          {session.started_at ? new Date(session.started_at).toLocaleDateString() : 'Not started'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" />
          {session.progress_percent}% complete
        </span>
      </div>
    </div>
  );
}
