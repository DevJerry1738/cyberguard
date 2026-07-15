'use client';
import React from 'react';
import type { RendererProps } from './QuestionFactory';

export function YesNoRenderer({ question, value, onChange, disabled, preview }: RendererProps) {
  return (
    <div className="space-y-3">
      {question.help_text && (
        <p className="text-sm text-slate-400 italic">{question.help_text}</p>
      )}
      <div className="flex gap-3">
        {[
          { label: 'Yes', val: 'yes', bg: 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400 text-emerald-400' },
          { label: 'No', val: 'no', bg: 'bg-red-500/10 border-red-500/30 hover:border-red-400 text-red-400' },
        ].map(opt => (
          <button
            key={opt.val}
            type="button"
            disabled={disabled}
            onClick={() => onChange?.(opt.val)}
            aria-pressed={value === opt.val}
            className={`flex-1 py-3 px-6 rounded-lg border-2 font-semibold transition-all duration-150
              ${opt.bg}
              ${value === opt.val ? 'ring-2 ring-offset-2 ring-offset-slate-900 ring-current shadow-lg scale-[1.02]' : 'opacity-70'}
              ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
