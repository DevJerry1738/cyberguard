'use client';
import React from 'react';
import type { RendererProps } from './QuestionFactory';

export function TextRenderer({ question, value, onChange, disabled }: RendererProps) {
  return (
    <div className="space-y-2">
      {question.help_text && (
        <p className="text-sm text-slate-400 italic">{question.help_text}</p>
      )}
      <input
        type="text"
        value={(value as string) ?? ''}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled}
        placeholder="Enter your response…"
        aria-label={question.question_text}
        className="w-full px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/60
          text-slate-100 placeholder-slate-500 text-sm
          focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500
          disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      />
    </div>
  );
}
