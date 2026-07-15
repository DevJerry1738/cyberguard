'use client';

interface QuestionNavigationProps {
  canGoPrevious: boolean;
  canGoNext: boolean;
  canSubmit: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSave: () => void;
  onReview: () => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function QuestionNavigation({
  canGoPrevious,
  canGoNext,
  canSubmit,
  onPrevious,
  onNext,
  onSave,
  onReview,
  onSubmit,
  isPending,
}: QuestionNavigationProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onPrevious}
        disabled={!canGoPrevious}
        className="rounded-lg border border-surface-700 bg-surface-950/40 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canGoNext}
        className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
      <button
        type="button"
        onClick={onSave}
        className="rounded-lg border border-surface-700 bg-surface-950/40 px-3 py-2 text-sm text-white"
      >
        Save
      </button>
      <button
        type="button"
        onClick={onReview}
        className="rounded-lg border border-surface-700 bg-surface-950/40 px-3 py-2 text-sm text-white"
      >
        Review
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isPending || !canSubmit}
        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Submit
      </button>
    </div>
  );
}
