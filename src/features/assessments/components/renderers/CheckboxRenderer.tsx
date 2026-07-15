'use client';
import React from 'react';
import type { RendererProps } from './QuestionFactory';

export function CheckboxRenderer({ question, value, onChange, disabled }: RendererProps) {
  const options = question.options ?? [];
  const selected: string[] = Array.isArray(value) ? (value as string[]) : [];

  const toggle = (val: string) => {
    if (disabled) return;
    const next = selected.includes(val)
      ? selected.filter(v => v !== val)
      : [...selected, val];
    onChange?.(next);
  };

  return (
    <div className="space-y-3">
      {question.help_text && (
        <p className="text-sm text-slate-400 italic">{question.help_text}</p>
      )}
      <div className="space-y-2">
        {options.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No options configured.</p>
        ) : options.map(opt => {
          const checked = selected.includes(opt.value);
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => toggle(opt.value)}
              role="checkbox"
              aria-checked={checked}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-150
                ${checked
                  ? 'bg-violet-500/15 border-violet-400 text-violet-100'
                  : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:border-slate-500'}
                ${disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}
              `}
            >
              <span className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center
                ${checked ? 'border-violet-400 bg-violet-400' : 'border-slate-500'}`}>
                {checked && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
              <span className="text-sm font-medium">{opt.label}</span>
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-slate-500">{selected.length} selected</p>
      )}
    </div>
  );
}
