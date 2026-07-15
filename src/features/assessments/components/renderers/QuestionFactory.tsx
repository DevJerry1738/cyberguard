/**
 * Question Factory Registry
 * 
 * Central registry mapping question_type → { PreviewRenderer, editorConfig }
 * To add a new question type: add an entry to QUESTION_REGISTRY only.
 * No changes needed in orchestration components.
 */

import React from 'react';
import type { QuestionType, AssessmentQuestion, QuestionOption } from '../../schemas/question';
import { YesNoRenderer } from './YesNoRenderer';
import { MultipleChoiceRenderer } from './MultipleChoiceRenderer';
import { CheckboxRenderer } from './CheckboxRenderer';
import { TextRenderer } from './TextRenderer';
import { TextareaRenderer } from './TextareaRenderer';
import { NumberRenderer } from './NumberRenderer';
import { DateRenderer } from './DateRenderer';

export interface RendererProps {
  question: AssessmentQuestion;
  value?: unknown;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
  preview?: boolean;
}

export interface QuestionRegistryEntry {
  label: string;
  icon: string;
  color: string;
  PreviewRenderer: React.ComponentType<RendererProps>;
  hasOptions: boolean;
  description: string;
}

export const QUESTION_REGISTRY: Record<QuestionType, QuestionRegistryEntry> = {
  yes_no: {
    label: 'Yes / No',
    icon: '✓',
    color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    PreviewRenderer: YesNoRenderer,
    hasOptions: false,
    description: 'Binary compliance check (Yes or No)',
  },
  multiple_choice: {
    label: 'Multiple Choice',
    icon: '◎',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    PreviewRenderer: MultipleChoiceRenderer,
    hasOptions: true,
    description: 'Single selection from predefined options',
  },
  checkbox: {
    label: 'Checkbox',
    icon: '☑',
    color: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    PreviewRenderer: CheckboxRenderer,
    hasOptions: true,
    description: 'Multiple selections from predefined options',
  },
  text: {
    label: 'Short Text',
    icon: 'T',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    PreviewRenderer: TextRenderer,
    hasOptions: false,
    description: 'Single-line text response',
  },
  textarea: {
    label: 'Long Text',
    icon: '≡',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    PreviewRenderer: TextareaRenderer,
    hasOptions: false,
    description: 'Multi-line detailed response',
  },
  number: {
    label: 'Number',
    icon: '#',
    color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    PreviewRenderer: NumberRenderer,
    hasOptions: false,
    description: 'Numeric value input',
  },
  date: {
    label: 'Date',
    icon: '📅',
    color: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    PreviewRenderer: DateRenderer,
    hasOptions: false,
    description: 'Date picker input',
  },
  file_upload: {
    label: 'File Upload',
    icon: '↑',
    color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    PreviewRenderer: TextRenderer, // Placeholder until implemented
    hasOptions: false,
    description: 'File attachment (future implementation)',
  },
};

export function getRegistryEntry(type: QuestionType): QuestionRegistryEntry {
  return QUESTION_REGISTRY[type];
}

export function renderQuestion(props: RendererProps): React.ReactElement {
  const entry = QUESTION_REGISTRY[props.question.question_type];
  if (!entry) {
    return React.createElement('div', { className: 'text-red-400 text-sm' }, 'Unknown question type');
  }
  return React.createElement(entry.PreviewRenderer, props);
}

// Utility: get badge JSX inline (usable in both server and client components)
export function QuestionTypeBadge({ type }: { type: QuestionType }) {
  const entry = QUESTION_REGISTRY[type];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-xs font-medium ${entry.color}`}>
      <span aria-hidden="true">{entry.icon}</span>
      {entry.label}
    </span>
  );
}
