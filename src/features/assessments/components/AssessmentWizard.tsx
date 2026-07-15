'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { AssessmentRuntime } from '@/features/assessments/actions/runtime';
import { saveAssessmentResponse, saveDraft, submitAssessment } from '@/features/assessments/actions/runtime';
import { renderQuestion } from '@/features/assessments/components/renderers/QuestionFactory';
import { SaveIndicator } from '@/features/assessments/components/SaveIndicator';
import { ProgressBar } from '@/features/assessments/components/ProgressBar';
import { QuestionNavigation } from '@/features/assessments/components/QuestionNavigation';
import { WizardSidebar } from '@/features/assessments/components/WizardSidebar';
import { ReviewPanel } from '@/features/assessments/components/ReviewPanel';
import { ShortcutHelpDialog } from '@/features/assessments/components/ShortcutHelpDialog';

interface AssessmentWizardProps {
  runtime: AssessmentRuntime;
  initialResponses: Record<string, unknown>;
}

function hasResponseValue(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function AssessmentWizard({ runtime, initialResponses }: AssessmentWizardProps) {
  const router = useRouter();
  const [responses, setResponses] = useState<Record<string, unknown>>(initialResponses);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(() => {
    const storedQuestionId = (runtime.session as unknown as { metadata?: Record<string, unknown> }).metadata?.current_question_id;
    if (typeof storedQuestionId === 'string') {
      const foundIndex = runtime.groups.flatMap(group => group.questions).findIndex(question => question.id === storedQuestionId);
      return foundIndex >= 0 ? foundIndex : 0;
    }
    return 0;
  });
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [showReview, setShowReview] = useState(false);
  const [isPending, startTransition] = useTransition();

  const flattenedQuestions = useMemo(
    () => runtime.groups.flatMap(group => group.questions),
    [runtime.groups]
  );

  const currentQuestion = flattenedQuestions[currentQuestionIndex] ?? null;
  const currentProgress = useMemo(() => {
    const requiredQuestions = runtime.groups.flatMap(group =>
      group.questions.filter(question => question.is_required)
    );
    const answeredRequired = requiredQuestions.filter(question =>
      hasResponseValue(responses[question.id])
    ).length;
    const percentage = requiredQuestions.length === 0 ? 0 : Math.round((answeredRequired / requiredQuestions.length) * 100);

    return {
      answeredRequired,
      totalRequired: requiredQuestions.length,
      percentage,
    };
  }, [responses, runtime.groups]);

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
        handleSaveDraft();
      }

      if (event.altKey && event.key.toLowerCase() === 'r') {
        event.preventDefault();
        setShowReview(true);
      }

      if (event.altKey && event.key === 'Enter' && showReview) {
        event.preventDefault();
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestionIndex, flattenedQuestions, responses, showReview]);

  const goToQuestion = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= flattenedQuestions.length) return;

    if (currentQuestion?.is_required && !hasResponseValue(responses[currentQuestion.id])) {
      setValidationMessage('Please answer the current required question before moving on.');
      return;
    }

    const nextQuestion = flattenedQuestions[nextIndex];
    setValidationMessage(null);
    setCurrentQuestionIndex(nextIndex);
    setSaveState('unsaved');
    void saveDraft(runtime.session.id, responses, nextQuestion?.id);
  };

  const handleResponseChange = (value: unknown) => {
    if (!currentQuestion) return;

    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
    setSaveState('unsaved');
    setValidationMessage(null);
  };

  const persistCurrentAnswer = async () => {
    if (!currentQuestion) return;

    setSaveState('saving');

    const result = await saveAssessmentResponse(
      runtime.session.id,
      currentQuestion.id,
      responses[currentQuestion.id]
    );

    if (!result.success) {
      setSaveState('error');
      setValidationMessage(result.error ?? 'Unable to save the current response.');
      return;
    }

    setSaveState('saved');
    setValidationMessage(null);
  };

  const handleSaveDraft = () => {
    startTransition(async () => {
      setSaveState('saving');
      const result = await saveDraft(runtime.session.id, responses);
      if (!result.success) {
        setSaveState('error');
        setValidationMessage(result.error ?? 'Unable to save the draft.');
        return;
      }

      setSaveState('saved');
      setValidationMessage(null);
    });
  };

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await submitAssessment(runtime.session.id, responses);
      if (!result.success) {
        setValidationMessage(result.error ?? 'Submission failed.');
        return;
      }

      router.push(`/assessments/sessions/${runtime.session.id}/complete`);
    });
  };

  const domainGroups = runtime.groups.map(group => ({
    ...group,
    questionsAnswered: group.questions.filter(question => hasResponseValue(responses[question.id])).length,
  }));

  if (!currentQuestion) {
    return <div className="rounded-2xl border border-surface-800 bg-surface-900/40 p-6 text-slate-300">No questions are available for this assessment session yet.</div>;
  }

  return (
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
        <div className="rounded-2xl border border-surface-800 bg-surface-900/40 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
                Assessment Wizard
              </div>
              <h2 className="mt-2 text-xl font-semibold text-white">{runtime.session.template_name}</h2>
              <p className="mt-1 text-sm text-slate-400">
                {runtime.session.template_framework} • Version {runtime.session.template_version}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <SaveIndicator status={saveState} />
              <button
                type="button"
                onClick={() => setShowShortcuts(true)}
                className="rounded-lg border border-surface-700 bg-surface-950/40 px-3 py-1.5 text-xs font-semibold text-white"
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
            />
          </div>

          <div className="mt-6 rounded-2xl border border-surface-800 bg-surface-950/40 p-5">
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
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {validationMessage}
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <QuestionNavigation
              canGoPrevious={currentQuestionIndex > 0}
              canGoNext={currentQuestionIndex < flattenedQuestions.length - 1}
              canSubmit={showReview}
              onPrevious={() => goToQuestion(currentQuestionIndex - 1)}
              onNext={() => {
                if (currentQuestion.is_required && !hasResponseValue(responses[currentQuestion.id])) {
                  setValidationMessage('Please answer the required question before continuing.');
                  return;
                }
                persistCurrentAnswer().finally(() => goToQuestion(currentQuestionIndex + 1));
              }}
              onSave={handleSaveDraft}
              onReview={() => setShowReview(true)}
              onSubmit={handleSubmit}
              isPending={isPending}
            />
          </div>
        </div>

        {showReview && (
          <ReviewPanel
            groups={runtime.groups}
            responses={responses}
            onJumpToQuestion={(index: number) => {
              setCurrentQuestionIndex(index);
              setShowReview(false);
              setValidationMessage(null);
            }}
          />
        )}
      </div>

      <ShortcutHelpDialog isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}
