'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AssessmentRuntime } from '@/features/assessments/actions/runtime';
import { submitAssessment } from '@/features/assessments/actions/runtime';
import { renderQuestion } from '@/features/assessments/components/renderers/QuestionFactory';
import { SaveIndicator } from '@/features/assessments/components/SaveIndicator';
import { ProgressBar } from '@/features/assessments/components/ProgressBar';
import { QuestionNavigation } from '@/features/assessments/components/QuestionNavigation';
import { WizardSidebar } from '@/features/assessments/components/WizardSidebar';
import { ReviewPanel } from '@/features/assessments/components/ReviewPanel';
import { ShortcutHelpDialog } from '@/features/assessments/components/ShortcutHelpDialog';
import { DraftProvider, useDraft } from '@/features/assessments/components/DraftProvider';
import { ConflictDialog } from '@/features/assessments/components/ConflictDialog';
import { OfflineBanner } from '@/features/assessments/components/OfflineBanner';
import { ResumeCard } from '@/features/assessments/components/ResumeCard';
import { AlertTriangle, CheckCircle2, Loader2, ShieldAlert } from 'lucide-react';

interface AssessmentWizardProps {
  runtime: AssessmentRuntime;
  initialResponses: Record<string, unknown>;
  userRole?: string | null;
}

interface SubmitConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  progressPercentage: number;
  answeredCount: number;
  totalCount: number;
}

export function SubmitConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isPending,
  progressPercentage,
  answeredCount,
  totalCount,
}: SubmitConfirmationModalProps) {
  const [step, setStep] = useState<'confirm' | 'warn'>('confirm');

  // Reset step each time modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(progressPercentage === 100 ? 'confirm' : 'warn');
    }
  }, [isOpen, progressPercentage]);

  if (!isOpen) return null;

  const isComplete = progressPercentage === 100 || (totalCount > 0 && answeredCount >= totalCount);
  const barColor = isComplete
    ? 'bg-emerald-500'
    : progressPercentage >= 80
    ? 'bg-brand-500'
    : progressPercentage >= 50
    ? 'bg-amber-500'
    : 'bg-rose-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`px-6 pt-6 pb-4 ${!isComplete && step === 'warn' ? 'border-b border-amber-500/20 bg-amber-500/5' : ''}`}>
          {!isComplete && step === 'warn' ? (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 rounded-xl bg-amber-500/20 p-2">
                <ShieldAlert className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Incomplete Assessment</h3>
                <p className="mt-1 text-sm text-amber-200/80">
                  You have {totalCount - answeredCount} unanswered required question{totalCount - answeredCount !== 1 ? 's' : ''}. Submitting now will leave them blank.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 rounded-xl bg-emerald-500/20 p-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Submit Assessment?</h3>
                <p className="mt-1 text-sm text-slate-400 leading-relaxed">
                  This will finalize the session, lock all answers, and mark it as completed. This action cannot be undone.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Progress summary */}
        <div className="px-6 py-4 space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-400">
            <span>Completion</span>
            <span className={isComplete ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            {answeredCount} of {totalCount} required questions answered
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 px-6 pb-6 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-40"
          >
            Cancel
          </button>

          {!isComplete && step === 'warn' ? (
            /* Step 1: warn → proceed to final confirm */
            <button
              type="button"
              onClick={() => setStep('confirm')}
              className="rounded-xl border border-amber-500/60 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-200 hover:bg-amber-500/20 transition-colors"
            >
              Submit anyway
            </button>
          ) : (
            /* Step 2 (or direct if complete): final submit */
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors disabled:opacity-40 flex items-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                'Confirm & Submit'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function hasResponseValue(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function AssessmentWizardInner({ runtime, userRole }: { runtime: AssessmentRuntime; userRole?: string | null }) {
  const router = useRouter();
  const {
    responses,
    updateResponse,
    updateNavigation,
    manualSave,
    initialDraftToResume,
    discardDraft,
  } = useDraft();

  const [showShortcuts, setShowShortcuts] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    const storedQuestionId = (runtime.session as unknown as { metadata?: Record<string, unknown> }).metadata?.current_question_id;
    if (typeof storedQuestionId === 'string') {
      const foundIndex = runtime.groups.flatMap(group => group.questions).findIndex(question => question.id === storedQuestionId);
      return foundIndex >= 0 ? foundIndex : 0;
    }
    return 0;
  });

  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();

  const flattenedQuestions = useMemo(
    () => runtime.groups.flatMap(group => group.questions),
    [runtime.groups]
  );

  const currentQuestion = flattenedQuestions[currentQuestionIndex] ?? null;

  // Sync navigation position to Draft context
  useEffect(() => {
    if (currentQuestion) {
      updateNavigation(currentQuestion.domain_id, currentQuestion.id);
    }
  }, [currentQuestion, updateNavigation]);

  const currentProgress = useMemo(() => {
    const requiredQuestions = runtime.groups.flatMap(group =>
      group.questions.filter(question => question.is_required)
    );
    const targetQuestions = requiredQuestions.length > 0 ? requiredQuestions : flattenedQuestions;
    const answeredRequired = targetQuestions.filter(question =>
      hasResponseValue(responses[question.id])
    ).length;
    const percentage = targetQuestions.length === 0 ? 100 : Math.round((answeredRequired / targetQuestions.length) * 100);

    return {
      answeredRequired,
      totalRequired: targetQuestions.length,
      percentage,
    };
  }, [responses, runtime.groups, flattenedQuestions]);

  // Domain breakdown for ProgressBar
  const domainProgress = useMemo(() =>
    runtime.groups.map(group => {
      const answered = group.questions.filter(q => hasResponseValue(responses[q.id])).length;
      return {
        domain_id: group.domain_id,
        domain_name: group.domain_name,
        answered,
        total: group.questions.length,
      };
    }),
    [responses, runtime.groups]
  );

  const handleReviewToggle = () => {
    if (currentQuestion) {
      manualSave();
    }
    setShowReview(prev => !prev);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key === 'ArrowRight') {
        event.preventDefault();
        goToQuestion(currentQuestionIndex + 1);
      }

      if (event.altKey && event.key === 'ArrowLeft') {
        event.preventDefault();
        goToQuestion(currentQuestionIndex - 1);
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        manualSave();
      }

      if (event.altKey && event.key.toLowerCase() === 'r') {
        event.preventDefault();
        handleReviewToggle();
      }

      if (event.altKey && event.key === 'Enter' && showReview) {
        event.preventDefault();
        setShowSubmitConfirm(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, flattenedQuestions, responses, showReview, manualSave]);

  const goToQuestion = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= flattenedQuestions.length) return;

    if (currentQuestion?.is_required && !hasResponseValue(responses[currentQuestion.id])) {
      setValidationMessage('Please answer the current required question before moving on.');
      return;
    }

    setValidationMessage(null);
    setCurrentQuestionIndex(nextIndex);
    const nextQuestion = flattenedQuestions[nextIndex];
    updateNavigation(nextQuestion?.domain_id, nextQuestion?.id);
  };

  const handleResponseChange = (value: unknown) => {
    if (!currentQuestion) return;
    updateResponse(currentQuestion.id, value);
    setValidationMessage(null);
  };

  const handleOpenSubmitModal = async () => {
    // Save all in-memory answers to draft before opening the submit modal.
    // Do NOT save again inside handleSubmit — a second save increments the
    // draft version and the client's cached version falls out of sync,
    // triggering the optimistic-concurrency conflict dialog.
    await manualSave();
    setShowSubmitConfirm(true);
  };

  const handleSubmit = () => {
    startTransition(async () => {
      // submitAssessment persists all responses, cleans up the draft, and sets
      // progress_percent = 100 on the session — no extra manualSave() needed here.
      const result = await submitAssessment(runtime.session.id, responses);
      if (!result.success) {
        setValidationMessage(result.error ?? 'Submission failed.');
        setShowSubmitConfirm(false);
        return;
      }
      // Draft is already deleted server-side by submitAssessment.
      // Clear local state so the DraftProvider doesn't try to re-save.
      await discardDraft();
      router.push(`/assessments/sessions/${runtime.session.id}/complete`);
    });
  };

  const domainGroups = runtime.groups.map(group => ({
    ...group,
    questionsAnswered: group.questions.filter(question => hasResponseValue(responses[question.id])).length,
  }));

  if (!currentQuestion) {
    return <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 text-slate-300">No questions are available for this assessment session yet.</div>;
  }

  return (
    <div className="space-y-4">
      <OfflineBanner />

      {initialDraftToResume && (
        <ResumeCard
          assessmentName={runtime.session.template_name}
          onContinue={() => {
            // Find first unanswered required question, or first unanswered question overall
            let firstUnansweredIdx = flattenedQuestions.findIndex(
              q => q.is_required && !hasResponseValue(responses[q.id])
            );
            if (firstUnansweredIdx < 0) {
              firstUnansweredIdx = flattenedQuestions.findIndex(
                q => !hasResponseValue(responses[q.id])
              );
            }
            if (firstUnansweredIdx >= 0) {
              setCurrentQuestionIndex(firstUnansweredIdx);
            } else if (initialDraftToResume.current_question) {
              const idx = flattenedQuestions.findIndex(q => q.id === initialDraftToResume.current_question);
              if (idx >= 0) setCurrentQuestionIndex(idx);
            }
          }}
        />
      )}

      <div className="grid gap-6 xl:grid-cols-[290px_minmax(0,1fr)]">
        <WizardSidebar
          groups={domainGroups}
          currentDomainId={currentQuestion.domain_id}
          onSelectDomain={domainId => {
            const nextIndex = flattenedQuestions.findIndex(question => question.domain_id === domainId);
            if (nextIndex >= 0) {
              goToQuestion(nextIndex);
            }
          }}
        />

        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
                  Assessment Wizard
                </div>
                <h2 className="mt-2 text-xl font-semibold text-white">{runtime.session.template_name}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {runtime.session.template_framework} • Version {runtime.session.template_version}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <SaveIndicator />
                <button
                  type="button"
                  onClick={() => setShowShortcuts(true)}
                  className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
                >
                  Shortcuts
                </button>
              </div>
            </div>

            <div className="mt-5">
              <ProgressBar
                percentage={currentProgress.percentage}
                answered={currentProgress.answeredRequired}
                totalRequired={currentProgress.totalRequired}
                currentQuestion={currentQuestionIndex + 1}
                totalQuestions={flattenedQuestions.length}
                domains={domainProgress}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    Question {currentQuestionIndex + 1}
                  </span>
                  {currentQuestion.is_required && (
                    <span className="ml-2 rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-semibold text-red-300">
                      Required
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">Weight {currentQuestion.weight}</span>
              </div>

              <h3 className="text-base font-semibold text-white leading-relaxed">{currentQuestion.question_text}</h3>
              {currentQuestion.help_text && (
                <p className="mt-2 text-sm text-slate-400 italic">{currentQuestion.help_text}</p>
              )}

              <div className="mt-5">
                {renderQuestion({
                  question: currentQuestion,
                  value: responses[currentQuestion.id],
                  onChange: handleResponseChange,
                  disabled: runtime.session.status === 'Completed',
                  preview: false,
                })}
              </div>

              {validationMessage && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  {validationMessage}
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <QuestionNavigation
                canGoPrevious={currentQuestionIndex > 0}
                canGoNext={currentQuestionIndex < flattenedQuestions.length - 1}
                canSubmit={true}
                onPrevious={() => goToQuestion(currentQuestionIndex - 1)}
                onNext={() => goToQuestion(currentQuestionIndex + 1)}
                onSave={manualSave}
                onReview={handleReviewToggle}
                onSubmit={handleOpenSubmitModal}
                isPending={isPending}
                showReview={showReview}
              />
            </div>
          </div>

          {showReview && (
            <ReviewPanel
              groups={runtime.groups}
              responses={responses}
              onJumpToQuestion={(index: number) => {
                manualSave();
                setCurrentQuestionIndex(index);
                setShowReview(false);
                setValidationMessage(null);
              }}
              onClose={() => setShowReview(false)}
            />
          )}
        </div>

        <ShortcutHelpDialog isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />

        <ConflictDialog userRole={userRole} />

        <SubmitConfirmationModal
          isOpen={showSubmitConfirm}
          onClose={() => setShowSubmitConfirm(false)}
          onConfirm={handleSubmit}
          isPending={isPending}
          progressPercentage={currentProgress.percentage}
          answeredCount={currentProgress.answeredRequired}
          totalCount={currentProgress.totalRequired}
        />
      </div>
    </div>
  );
}

export function AssessmentWizard({ runtime, initialResponses, userRole }: AssessmentWizardProps) {
  return (
    <DraftProvider sessionId={runtime.session.id} initialResponses={initialResponses}>
      <AssessmentWizardInner runtime={runtime} userRole={userRole} />
    </DraftProvider>
  );
}
