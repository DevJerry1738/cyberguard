'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { submitAssessment } from '@/features/assessments/actions/runtime';
import { CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';

interface SubmitReviewButtonProps {
  sessionId: string;
  responses: Record<string, unknown>;
  missingRequired: number;
  totalRequired: number;
  answeredRequired: number;
}

export function SubmitReviewButton({
  sessionId,
  responses,
  missingRequired,
  totalRequired,
  answeredRequired,
}: SubmitReviewButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showWarn, setShowWarn] = useState(false);

  const pct = totalRequired > 0 ? Math.round((answeredRequired / totalRequired) * 100) : 100;
  const isComplete = missingRequired === 0;

  const doSubmit = () => {
    startTransition(async () => {
      const result = await submitAssessment(sessionId, responses);
      if (!result.success) {
        setError(result.error ?? 'Submission failed. Please try again.');
        setShowWarn(false);
        return;
      }
      router.push(`/assessments/sessions/${sessionId}/complete`);
    });
  };

  const handleClick = () => {
    if (!isComplete && !showWarn) {
      setShowWarn(true);
      return;
    }
    doSubmit();
  };

  const barColor = isComplete
    ? 'bg-emerald-500'
    : pct >= 80
    ? 'bg-brand-500'
    : pct >= 50
    ? 'bg-amber-500'
    : 'bg-rose-500';

  return (
    <div className="space-y-3">
      {/* Progress mini summary */}
      <div className="rounded-xl border border-surface-800 bg-surface-950/40 p-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-slate-400">
          <span>Completion</span>
          <span className={isComplete ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>{pct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-slate-500">{answeredRequired} of {totalRequired} required answered</p>
      </div>

      {/* Incomplete warning (shown after first click) */}
      {showWarn && !isComplete && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-200">
            <ShieldAlert className="h-4 w-4 flex-shrink-0" />
            {missingRequired} required question{missingRequired !== 1 ? 's' : ''} unanswered
          </div>
          <p className="text-xs text-amber-200/70">
            Submitting will leave them blank. Are you sure you want to continue?
          </p>
        </div>
      )}

      {/* Server error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Submit button */}
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 ${
          showWarn && !isComplete
            ? 'bg-amber-600 hover:bg-amber-500'
            : 'bg-emerald-600 hover:bg-emerald-500'
        }`}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : showWarn && !isComplete ? (
          <>
            <ShieldAlert className="h-4 w-4" />
            Confirm & submit anyway
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Submit assessment
          </>
        )}
      </button>
    </div>
  );
}
