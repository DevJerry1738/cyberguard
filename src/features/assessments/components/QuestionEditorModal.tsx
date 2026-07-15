'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import {
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  CHOICE_BASED_TYPES,
  type AssessmentQuestion,
  type QuestionOptionInput,
} from '../schemas/question';
import type { SecurityDomain } from '@/features/security-domains/schemas/security-domain';

interface QuestionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    domain_id: string;
    question_text: string;
    help_text: string | null;
    question_type: string;
    is_required: boolean;
    weight: number;
    options?: QuestionOptionInput[];
  }) => Promise<void>;
  question?: AssessmentQuestion | null;
  domains: Array<SecurityDomain & { sort_order?: number }>;
  defaultDomainId?: string;
}

export function QuestionEditorModal({
  isOpen,
  onClose,
  onSave,
  question,
  domains,
  defaultDomainId,
}: QuestionEditorModalProps) {
  const [domainId, setDomainId] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [helpText, setHelpText] = useState('');
  const [questionType, setQuestionType] = useState('yes_no');
  const [isRequired, setIsRequired] = useState(true);
  const [weight, setWeight] = useState(1);
  const [options, setOptions] = useState<QuestionOptionInput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (question) {
      setDomainId(question.domain_id);
      setQuestionText(question.question_text);
      setHelpText(question.help_text || '');
      setQuestionType(question.question_type);
      setIsRequired(question.is_required);
      setWeight(question.weight);
      setOptions(
        (question.options ?? []).map(opt => ({
          id: opt.id,
          label: opt.label,
          value: opt.value,
          sort_order: opt.sort_order ?? 0,
        }))
      );
    } else {
      setDomainId(defaultDomainId || (domains[0]?.id ?? ''));
      setQuestionText('');
      setHelpText('');
      setQuestionType('yes_no');
      setIsRequired(true);
      setWeight(1);
      setOptions([
        { label: 'Option 1', value: 'option_1', sort_order: 0 },
        { label: 'Option 2', value: 'option_2', sort_order: 1 },
      ]);
    }
    setError(null);
  }, [question, isOpen, defaultDomainId, domains]);

  if (!isOpen) return null;

  const showOptionsConfig = CHOICE_BASED_TYPES.includes(questionType as any);

  const addOption = () => {
    const nextNum = options.length + 1;
    setOptions([
      ...options,
      { label: `Option ${nextNum}`, value: `option_${nextNum}`, sort_order: options.length },
    ]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, field: 'label' | 'value', val: string) => {
    setOptions(
      options.map((opt, i) => (i === index ? { ...opt, [field]: val } : opt))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!domainId) {
      setError('Please select a security domain.');
      return;
    }
    if (questionText.trim().length < 5) {
      setError('Question text must be at least 5 characters long.');
      return;
    }
    if (showOptionsConfig) {
      if (options.length < 2) {
        setError('At least 2 options are required for choice-based question types.');
        return;
      }
      for (const opt of options) {
        if (!opt.label.trim() || !opt.value.trim()) {
          setError('All option labels and values must be filled out.');
          return;
        }
      }
    }

    try {
      setIsSubmitting(true);
      await onSave({
        domain_id: domainId,
        question_text: questionText,
        help_text: helpText.trim() ? helpText : null,
        question_type: questionType,
        is_required: isRequired,
        weight: Number(weight),
        options: showOptionsConfig ? options : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'An error occurred while saving the question.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-slate-100">
            {question ? 'Edit Question' : 'Add Question'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Domain */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Security Domain
            </label>
            <select
              value={domainId}
              onChange={e => setDomainId(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
            >
              {domains.map(dom => (
                <option key={dom.id} value={dom.id}>
                  {dom.name}
                </option>
              ))}
            </select>
          </div>

          {/* Question Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Question Text
            </label>
            <textarea
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
              rows={3}
              placeholder="e.g. Is multi-factor authentication enforced on all user accounts?"
              className="w-full px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Help Text */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Help Text / Guidance (Optional)
            </label>
            <input
              type="text"
              value={helpText}
              onChange={e => setHelpText(e.target.value)}
              placeholder="e.g. Look for settings in Azure Active Directory under Enterprise Policies."
              className="w-full px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Question Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Response Type
              </label>
              <select
                value={questionType}
                onChange={e => setQuestionType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
              >
                {QUESTION_TYPES.map(type => (
                  <option key={type} value={type}>
                    {QUESTION_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            {/* Risk Weight */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Weight (Risk Multiplier)
              </label>
              <input
                type="number"
                value={weight}
                min={1}
                max={10}
                onChange={e => setWeight(Number(e.target.value))}
                className="w-full px-4 py-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Validation Toggles */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-800 bg-slate-900/30">
            <div>
              <span className="text-sm font-semibold text-slate-200">Required Response</span>
              <p className="text-xs text-slate-500">Assessors must answer this question to submit.</p>
            </div>
            <input
              type="checkbox"
              checked={isRequired}
              onChange={e => setIsRequired(e.target.checked)}
              className="w-4 h-4 rounded text-blue-500 border-slate-700 bg-slate-800 focus:ring-blue-500 focus:ring-offset-slate-900"
            />
          </div>

          {/* Type-Specific Options Configuration */}
          {showOptionsConfig && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Predefined Options
                </label>
                <button
                  type="button"
                  onClick={addOption}
                  className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold"
                >
                  <Plus size={14} /> Add Option
                </button>
              </div>

              <div className="space-y-2">
                {options.map((opt, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt.label}
                      placeholder={`Label (e.g. Option ${index + 1})`}
                      onChange={e => updateOption(index, 'label', e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={opt.value}
                      placeholder={`Value (e.g. option_${index + 1})`}
                      onChange={e => updateOption(index, 'value', e.target.value)}
                      className="w-32 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                    />
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit controls */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-2"
            >
              {isSubmitting ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
