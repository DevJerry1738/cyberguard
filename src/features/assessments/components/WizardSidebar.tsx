'use client';

import type { QuestionsByDomain } from '@/features/assessments/schemas/question';

interface WizardSidebarProps {
  groups: Array<QuestionsByDomain & { questionsAnswered: number }>;
  currentDomainId: string;
  onSelectDomain: (domainId: string) => void;
}

export function WizardSidebar({
  groups,
  currentDomainId,
  onSelectDomain,
}: WizardSidebarProps) {
  return (
    <aside className="rounded-2xl border border-surface-800 bg-surface-900/40 p-4">
      <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Domains</div>
      <div className="mt-4 space-y-3">
        {groups.map((group, groupIndex) => {
          const active = group.domain_id === currentDomainId;
          return (
            <button
              key={group.domain_id}
              type="button"
              onClick={() => onSelectDomain(group.domain_id)}
              className={`w-full rounded-xl border px-3 py-3 text-left transition-colors ${
                active
                  ? 'border-brand-500 bg-brand-500/10 text-white'
                  : 'border-surface-800 bg-surface-950/40 text-slate-300 hover:border-surface-700 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{group.domain_name}</span>
                <span className="text-xs text-slate-400">{group.questionsAnswered}/{group.questions.length}</span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
