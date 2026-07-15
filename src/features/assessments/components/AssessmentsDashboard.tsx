'use client';

import Link from 'next/link';
import { ClipboardList, Plus } from 'lucide-react';
import type { AssessmentSession } from '../schemas/session';
import { SessionCard } from './SessionCard';

interface AssessmentsDashboardProps {
  initialSessions: AssessmentSession[];
  userRole: string;
}

export function AssessmentsDashboard({ initialSessions, userRole }: AssessmentsDashboardProps) {
  const canCreate = ['Owner', 'Admin', 'Security Officer'].includes(userRole);

  const stats = {
    active: initialSessions.filter(session => session.status === 'In Progress' || session.status === 'Draft').length,
    completed: initialSessions.filter(session => session.status === 'Completed').length,
    cancelled: initialSessions.filter(session => session.status === 'Cancelled' || session.status === 'Archived').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-surface-800 bg-surface-900/40 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Active sessions</p>
          <p className="mt-3 text-2xl font-bold text-white">{stats.active}</p>
        </div>
        <div className="rounded-2xl border border-surface-800 bg-surface-900/40 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Completed</p>
          <p className="mt-3 text-2xl font-bold text-white">{stats.completed}</p>
        </div>
        <div className="rounded-2xl border border-surface-800 bg-surface-900/40 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Closed / archived</p>
          <p className="mt-3 text-2xl font-bold text-white">{stats.cancelled}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-surface-800 bg-surface-900/40 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Assessment launch queue</h2>
            <p className="text-sm text-slate-400">Launch from a template, assign users, and track session progress.</p>
          </div>
          {canCreate && (
            <Link
              href="/assessments/new"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Launch Session
            </Link>
          )}
        </div>

        {initialSessions.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-surface-700 bg-surface-950/40 px-6 py-12 text-center">
            <ClipboardList className="mx-auto h-10 w-10 text-slate-500" />
            <h3 className="mt-4 text-lg font-semibold text-white">No assessment sessions yet</h3>
            <p className="mt-2 text-sm text-slate-400">
              Activate a template and launch the first session to see it appear here.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {initialSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
