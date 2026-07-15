'use client';
import React from 'react';
import type { RendererProps } from './QuestionFactory';

export function NumberRenderer({ question, value, onChange, disabled }: RendererProps) {
  const min = (question.metadata?.min as number | undefined);
  const max = (question.metadata?.max as number | undefined);

  return (
    <div className="space-y-2">
      {question.help_text && (
        <p className="text-sm text-slate-400 italic">{question.help_text}</p>
      )}
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={(value as number | string) ?? ''}
          min={min}
          max={max}
          onChange={e => onChange?.(e.target.valueAsNumber)}
          disabled={disabled}
          placeholder="0"
          aria-label={question.question_text}
          className="w-40 px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/60
            text-slate-100 placeholder-slate-500 text-sm
            focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
            disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        />
        {(min !== undefined || max !== undefined) && (
          <span className="text-xs text-slate-500">
            {min !== undefined && max !== undefined
              ? `${min} – ${max}`
              : min !== undefined
              ? `Min: ${min}`
              : `Max: ${max}`}
          </span>
        )}
      </div>
    </div>
  );
}
