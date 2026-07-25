'use client';

import { useState } from 'react';
import type { QuestionsByDomain } from '@/features/assessments/schemas/question';
import { X, ChevronDown, ChevronRight, CheckCircle2, AlertCircle, MinusCircle, ExternalLink } from 'lucide-react';

interface ReviewPanelProps {
  groups: QuestionsByDomain[];
  responses: Record<string, unknown>;
  onJumpToQuestion?: (index: number) => void;
  onClose?: () => void;
  readOnly?: boolean;
}

function hasValue(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function formatAnswer(value: unknown): string {
  if (!hasValue(value)) return 'Unanswered';
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

function truncate(str: string, n = 80): string {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

export function ReviewPanel({ groups, responses, onJumpToQuestion, onClose, readOnly = false }: ReviewPanelProps) {
  const allQuestions = groups.flatMap((g, gi) =>
    g.questions.map((q, qi) => ({ ...q, groupName: g.domain_name, flatIndex: groups.slice(0, gi).reduce((a, x) => a + x.questions.length, 0) + qi }))
  );

  const answeredCount = allQuestions.filter(q => hasValue(responses[q.id])).length;
  const missingRequired = allQuestions.filter(q => q.is_required && !hasValue(responses[q.id]));
  const optionalSkipped = allQuestions.filter(q => !q.is_required && !hasValue(responses[q.id]));
  const totalRequired = allQuestions.filter(q => q.is_required).length;

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleDomain = (domainId: string) => {
    setCollapsed(prev => ({ ...prev, [domainId]: !prev[domainId] }));
  };

  let flatIndex = 0;

  return (
    <section className="rounded-2xl border border-surface-800 bg-surface-900/40 p-5 space-y-5 relative">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Assessment Review</h3>
          <p className="mt-0.5 text-sm text-slate-400">
            Verify all responses before submission.
          </p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-surface-800 hover:text-white transition-colors"
            title="Close Review"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {answeredCount} answered
        </span>
        {missingRequired.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
            <AlertCircle className="h-3.5 w-3.5" />
            {missingRequired.length} required missing
          </span>
        )}
        {optionalSkipped.length > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs font-semibold text-slate-400">
            <MinusCircle className="h-3.5 w-3.5" />
            {optionalSkipped.length} optional skipped
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/40 px-3 py-1 text-xs text-slate-500">
          {totalRequired} required total
        </span>
      </div>

      {/* Domain sections */}
      <div className="space-y-3">
        {groups.map(group => {
          const groupQuestions = group.questions.map((q, qi) => {
            const fi = flatIndex + qi;
            return { ...q, flatIndex: fi };
          });
          flatIndex += group.questions.length;

          const groupAnswered = groupQuestions.filter(q => hasValue(responses[q.id])).length;
          const groupMissing = groupQuestions.filter(q => q.is_required && !hasValue(responses[q.id])).length;
          const groupPct = group.questions.length > 0 ? Math.round((groupAnswered / group.questions.length) * 100) : 0;
          const isCollapsed = collapsed[group.domain_id] ?? false;
          const isComplete = groupAnswered === group.questions.length;

          return (
            <div
              key={group.domain_id}
              className={`rounded-xl border overflow-hidden transition-colors ${
                isComplete
                  ? 'border-emerald-500/20 bg-emerald-500/5'
                  : groupMissing > 0
                  ? 'border-red-500/20 bg-red-500/5'
                  : 'border-surface-800 bg-surface-950/40'
              }`}
            >
              {/* Domain header - clickable to collapse */}
              <button
                type="button"
                onClick={() => toggleDomain(group.domain_id)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isCollapsed ? (
                    <ChevronRight className="h-4 w-4 text-slate-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-500 flex-shrink-0" />
                  )}
                  <span className="text-sm font-semibold text-white truncate">{group.domain_name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : groupMissing > 0 ? (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  ) : null}
                  <span className={`text-xs font-semibold ${isComplete ? 'text-emerald-400' : groupMissing > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                    {groupAnswered}/{group.questions.length} ({groupPct}%)
                  </span>
                </div>
              </button>

              {/* Questions list */}
              {!isCollapsed && (
                <div className="border-t border-surface-800/60 divide-y divide-surface-800/40">
                  {groupQuestions.map(question => {
                    const answered = hasValue(responses[question.id]);
                    const isRequired = question.is_required;
                    const answer = formatAnswer(responses[question.id]);

                    return (
                      <div key={question.id} className="flex items-start gap-3 px-4 py-3">
                        {/* Status dot */}
                        <div className="flex-shrink-0 mt-0.5">
                          {answered ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : isRequired ? (
                            <AlertCircle className="h-4 w-4 text-red-400" />
                          ) : (
                            <MinusCircle className="h-4 w-4 text-slate-600" />
                          )}
                        </div>

                        {/* Question content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            {isRequired && (
                              <span className="rounded-full bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-300">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-white leading-snug">{question.question_text}</p>
                          <p className={`mt-1 text-xs ${answered ? 'text-slate-400' : isRequired ? 'text-red-400/70' : 'text-slate-600'}`}>
                            {truncate(answer)}
                          </p>
                        </div>

                        {/* Jump button (only in wizard mode, not read-only) */}
                        {!readOnly && onJumpToQuestion && (
                          <button
                            type="button"
                            onClick={() => onJumpToQuestion(question.flatIndex)}
                            className={`flex-shrink-0 inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                              answered
                                ? 'border-surface-700 text-slate-400 hover:border-brand-500 hover:text-white'
                                : isRequired
                                ? 'border-red-500/40 text-red-300 hover:border-red-400 hover:text-red-200'
                                : 'border-surface-700 text-slate-500 hover:border-surface-600 hover:text-slate-300'
                            }`}
                          >
                            <ExternalLink className="h-3 w-3" />
                            {answered ? 'Edit' : 'Answer'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
