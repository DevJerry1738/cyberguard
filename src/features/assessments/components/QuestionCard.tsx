'use client';

import React from 'react';
import { MoreVertical, Copy, Edit2, Trash2, GripVertical } from 'lucide-react';
import type { AssessmentQuestion } from '../schemas/question';
import { QuestionTypeBadge } from './renderers/QuestionFactory';

interface QuestionCardProps {
  question: AssessmentQuestion;
  onEdit: (question: AssessmentQuestion) => void;
  onDuplicate: (question: AssessmentQuestion) => void;
  onDelete: (question: AssessmentQuestion) => void;
  isReadOnly: boolean;
  canDelete: boolean;
}

export function QuestionCard({
  question,
  onEdit,
  onDuplicate,
  onDelete,
  isReadOnly,
  canDelete,
}: QuestionCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 transition-colors group relative">
      {!isReadOnly && (
        <div className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 py-1" title="Drag to reorder">
          <GripVertical size={18} />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <QuestionTypeBadge type={question.question_type} />
          {question.is_required && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
              Required
            </span>
          )}
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            Weight: {question.weight}
          </span>
          {question.options && question.options.length > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
              {question.options.length} Options
            </span>
          )}
        </div>

        <h4 className="text-slate-100 font-medium text-sm leading-relaxed mb-1">
          {question.question_text}
        </h4>

        {question.help_text && (
          <p className="text-xs text-slate-500 italic truncate max-w-2xl">
            {question.help_text}
          </p>
        )}
      </div>

      {!isReadOnly && (
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <MoreVertical size={18} />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-48 rounded-lg border border-slate-800 bg-slate-900 shadow-xl py-1 z-10">
              <button
                onClick={() => {
                  onEdit(question);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition-colors"
              >
                <Edit2 size={14} />
                Edit Question
              </button>
              <button
                onClick={() => {
                  onDuplicate(question);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition-colors"
              >
                <Copy size={14} />
                Duplicate
              </button>
              {canDelete && (
                <button
                  onClick={() => {
                    onDelete(question);
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-950/20 hover:text-red-300 flex items-center gap-2 border-t border-slate-800 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
