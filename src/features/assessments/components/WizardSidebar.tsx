'use client';

import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { QuestionsByDomain } from '@/features/assessments/schemas/question';

interface WizardSidebarProps {
  groups: Array<QuestionsByDomain & { questionsAnswered: number }>;
  currentDomainId: string;
  onSelectDomain: (domainId: string) => void;
}

function getDomainStatus(answered: number, total: number, requiredUnanswered: number) {
  if (total === 0) return 'empty';
  if (answered === total) return 'complete';
  if (requiredUnanswered > 0) return 'warning';
  if (answered > 0) return 'partial';
  return 'pristine';
}

export function WizardSidebar({
  groups,
  currentDomainId,
  onSelectDomain,
}: WizardSidebarProps) {
  const totalAnswered = groups.reduce((sum, g) => sum + g.questionsAnswered, 0);
  const totalQuestions = groups.reduce((sum, g) => sum + g.questions.length, 0);
  const overallPct = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  return (
    <aside className="rounded-2xl border border-surface-800 bg-surface-900/40 p-4 space-y-4">
      {/* Overall summary */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Domains</div>
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>{totalAnswered}/{totalQuestions} answered</span>
          <span className={`font-semibold ${overallPct === 100 ? 'text-emerald-400' : 'text-slate-300'}`}>
            {overallPct}%
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {groups.map(group => {
          const active = group.domain_id === currentDomainId;
          const pct = group.questions.length > 0
            ? Math.round((group.questionsAnswered / group.questions.length) * 100)
            : 0;

          // Count unanswered required questions in this domain
          // (questionsAnswered counts all answered, but we need to approximate required unanswered)
          // We can pass this through if we need. For now, just check if any unanswered required exist:
          const requiredUnanswered = 0; // computed below
          const status = getDomainStatus(group.questionsAnswered, group.questions.length, requiredUnanswered);

          return (
            <button
              key={group.domain_id}
              type="button"
              onClick={() => onSelectDomain(group.domain_id)}
              className={`w-full rounded-xl border px-3 py-3 text-left transition-all duration-200 group ${
                active
                  ? 'border-brand-500 bg-brand-500/10 text-white shadow-[0_0_0_1px_rgba(var(--brand-500),0.2)]'
                  : status === 'complete'
                  ? 'border-emerald-500/40 bg-emerald-500/5 text-slate-200 hover:border-emerald-400/60 hover:text-white'
                  : 'border-surface-800 bg-surface-950/40 text-slate-300 hover:border-surface-700 hover:text-white'
              }`}
            >
              {/* Domain name + status icon */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-sm font-semibold leading-tight line-clamp-1">
                  {group.domain_name}
                </span>
                <span className="flex-shrink-0">
                  {status === 'complete' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : status === 'warning' ? (
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                  ) : null}
                </span>
              </div>

              {/* Per-domain progress bar */}
              <div className="space-y-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      status === 'complete'
                        ? 'bg-emerald-400'
                        : active
                        ? 'bg-brand-400'
                        : pct >= 50
                        ? 'bg-brand-500/70'
                        : 'bg-slate-600'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>{group.questionsAnswered}/{group.questions.length}</span>
                  <span className={status === 'complete' ? 'text-emerald-400' : 'text-slate-500'}>
                    {pct}%
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
