'use client';
import React from 'react';
import type { RendererProps } from './QuestionFactory';

export function MultipleChoiceRenderer({ question, value, onChange, disabled }: RendererProps) {
  const options = question.options ?? [];
  return (
    <div className="space-y-3">
      {question.help_text && (
        <p className="text-sm text-slate-400 italic">{question.help_text}</p>
      )}
      <div className="space-y-2">
        {options.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No options configured.</p>
        ) : options.map(opt => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange?.(opt.value)}
              role="radio"
              aria-checked={selected}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-150
                ${selected
                  ? 'bg-blue-500/15 border-blue-400 text-blue-100'
                  : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500'}
                ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
              `}
            >
              <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                ${selected ? 'border-blue-400 bg-blue-400' : 'border-slate-500'}`}>
                {selected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
              <span className="text-sm font-medium">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
