'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Eye } from 'lucide-react';
import type { QuestionsByDomain } from '../schemas/question';
import { renderQuestion } from './renderers/QuestionFactory';

interface QuestionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  groupedQuestions: QuestionsByDomain[];
}

export function QuestionPreviewModal({
  isOpen,
  onClose,
  templateName,
  groupedQuestions,
}: QuestionPreviewModalProps) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});

  if (!isOpen) return null;

  const totalQuestions = groupedQuestions.reduce((acc, g) => acc + g.questions.length, 0);

  return (
    <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl my-8">
        {/* Header Banner */}
        <div className="px-8 py-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/50">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Eye size={12} /> Preview Mode (Read-only)
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-100">{templateName}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Simulating the live Assessment Wizard rendering experience. Form submissions and responses will not be saved.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Dynamic Questionnaire content */}
        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          {totalQuestions === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p className="text-sm">No questions have been added to this template yet.</p>
            </div>
          ) : (
            groupedQuestions.map((group, groupIdx) => {
              if (group.questions.length === 0) return null;
              return (
                <div key={group.domain_id} className="space-y-6">
                  {/* Domain Section Header */}
                  <div className="pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Domain {groupIdx + 1}
                    </span>
                    <h4 className="text-base font-bold text-slate-200 mt-0.5">{group.domain_name}</h4>
                  </div>

                  <div className="space-y-6">
                    {group.questions.map((question, qIdx) => (
                      <div
                        key={question.id}
                        className="p-5 rounded-xl border border-slate-800/80 bg-slate-900/40 space-y-4 hover:border-slate-700 transition-all duration-200"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <span className="text-xs font-medium text-slate-500">Question {qIdx + 1}</span>
                            <h5 className="text-slate-100 font-semibold text-sm leading-relaxed">
                              {question.question_text}
                              {question.is_required && (
                                <span className="text-red-400 ml-1" title="Required">*</span>
                              )}
                            </h5>
                          </div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                            W{question.weight}
                          </span>
                        </div>

                        {/* Direct rendering factory call */}
                        <div className="pl-0 sm:pl-2">
                          {renderQuestion({
                            question,
                            value: answers[question.id],
                            onChange: (val) => setAnswers(prev => ({ ...prev, [question.id]: val })),
                            disabled: false,
                            preview: true,
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer controls */}
        <div className="px-8 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/20 rounded-b-2xl">
          <span className="text-xs text-slate-500">
            {totalQuestions} Simulated question{totalQuestions === 1 ? '' : 's'} loaded
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
