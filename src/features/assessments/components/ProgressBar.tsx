'use client';

interface ProgressBarProps {
  percentage: number;
  answered: number;
  totalRequired: number;
  currentQuestion: number;
  totalQuestions: number;
}

export function ProgressBar({
  percentage,
  answered,
  totalRequired,
  currentQuestion,
  totalQuestions,
}: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          {answered}/{totalRequired} required answered
        </span>
        <span>
          Question {currentQuestion} of {totalQuestions}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-brand-500 transition-all duration-300"
          style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
        />
      </div>
      <div className="text-sm font-medium text-white">{percentage}% complete</div>
    </div>
  );
}
