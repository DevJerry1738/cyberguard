'use client';

import type { QuestionsByDomain } from '@/features/assessments/schemas/question';

interface ReviewPanelProps {
  groups: QuestionsByDomain[];
  responses: Record<string, unknown>;
  onJumpToQuestion: (index: number) => void;
}

function formatAnswer(value: unknown): string {
  if (Array.isArray(value)) return value.join(', ');
  if (value === undefined || value === null) return 'Unanswered';
  return String(value);
}

export function ReviewPanel({ groups, responses, onJumpToQuestion }: ReviewPanelProps) {
  const questions = groups.flatMap(group => group.questions.map(question => ({ groupName: group.domain_name, ...question })));
  const missing = questions.filter(question => question.is_required && !responses[question.id]);

  return (
    <section className="rounded-2xl border border-surface-800 bg-surface-900/40 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-white">Review</h3>
        <span className="text-sm text-slate-400">{missing.length} missing required answers</span>
      </div>

      <div className="mt-4 space-y-3">
        {questions.map((question, index) => (
          <div key={question.id} className="rounded-xl border border-surface-800 bg-surface-950/40 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{question.groupName}</div>
                <div className="mt-1 text-sm text-white">{question.question_text}</div>
                <div className="mt-1 text-xs text-slate-400">{formatAnswer(responses[question.id])}</div>
              </div>
              <button
                type="button"
                onClick={() => onJumpToQuestion(index)}
                className="rounded-lg border border-surface-700 px-3 py-1 text-xs text-white hover:border-brand-500"
              >
                Jump
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
