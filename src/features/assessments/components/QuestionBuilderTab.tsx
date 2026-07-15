'use client';

import React, { useState, useTransition } from 'react';
import { Eye, Plus, ArrowUp, ArrowDown, Search, Filter } from 'lucide-react';
import type { QuestionsByDomain, AssessmentQuestion } from '../schemas/question';
import type { SecurityDomain } from '@/features/security-domains/schemas/security-domain';
import { QuestionCard } from './QuestionCard';
import { QuestionEditorModal } from './QuestionEditorModal';
import { QuestionPreviewModal } from './QuestionPreviewModal';
import {
  createAssessmentQuestion,
  updateAssessmentQuestion,
  deleteAssessmentQuestion,
  duplicateAssessmentQuestion,
  reorderAssessmentQuestions,
} from '../actions/questions';

interface QuestionBuilderTabProps {
  templateId: string;
  templateName: string;
  templateStatus: string;
  initialQuestions: QuestionsByDomain[];
  assignedDomains: Array<SecurityDomain & { sort_order?: number }>;
  userRole: string;
}

export function QuestionBuilderTab({
  templateId,
  templateName,
  templateStatus,
  initialQuestions,
  assignedDomains,
  userRole,
}: QuestionBuilderTabProps) {
  const [questionsGrouped, setQuestionsGrouped] = useState<QuestionsByDomain[]>(initialQuestions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRequired, setSelectedRequired] = useState('all');

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AssessmentQuestion | null>(null);
  const [defaultDomainId, setDefaultDomainId] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isReadOnly = templateStatus !== 'Draft' || !['Owner', 'Admin', 'Security Officer'].includes(userRole);
  const canDelete = ['Owner', 'Admin'].includes(userRole);

  // Drag and Drop States
  const [draggedItem, setDraggedItem] = useState<{ id: string; domainId: string } | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string, domainId: string) => {
    if (isReadOnly) return;
    setDraggedItem({ id, domainId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, domainId: string) => {
    if (isReadOnly) return;
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetId: string, domainId: string) => {
    if (isReadOnly || !draggedItem || draggedItem.domainId !== domainId) {
      setDraggedItem(null);
      return;
    }

    const currentDomain = questionsGrouped.find(g => g.domain_id === domainId);
    if (!currentDomain) return;

    const list = [...currentDomain.questions];
    const dragIdx = list.findIndex(q => q.id === draggedItem.id);
    const dropIdx = list.findIndex(q => q.id === targetId);

    if (dragIdx === -1 || dropIdx === -1 || dragIdx === dropIdx) {
      setDraggedItem(null);
      return;
    }

    // Perform Reorder
    const [removed] = list.splice(dragIdx, 1);
    list.splice(dropIdx, 0, removed);

    // Optimistically update
    const updatedQuestions = list.map((q, idx) => ({ ...q, sort_order: idx }));
    setQuestionsGrouped(prev =>
      prev.map(g => (g.domain_id === domainId ? { ...g, questions: updatedQuestions } : g))
    );
    setDraggedItem(null);

    // Persist to Server
    startTransition(async () => {
      const res = await reorderAssessmentQuestions(
        templateId,
        updatedQuestions.map(q => ({ id: q.id, sort_order: q.sort_order }))
      );
      if (!res.success) {
        setError(res.error || 'Failed to persist question sorting.');
        // Revert back
        setQuestionsGrouped(initialQuestions);
      }
    });
  };

  // Up / Down fallback reordering
  const handleMoveQuestion = async (id: string, domainId: string, direction: 'up' | 'down') => {
    if (isReadOnly) return;
    const currentDomain = questionsGrouped.find(g => g.domain_id === domainId);
    if (!currentDomain) return;

    const list = [...currentDomain.questions];
    const idx = list.findIndex(q => q.id === id);
    if (idx === -1) return;

    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    // Swap elements
    const temp = list[idx];
    list[idx] = list[targetIdx];
    list[targetIdx] = temp;

    const updatedQuestions = list.map((q, i) => ({ ...q, sort_order: i }));
    setQuestionsGrouped(prev =>
      prev.map(g => (g.domain_id === domainId ? { ...g, questions: updatedQuestions } : g))
    );

    startTransition(async () => {
      const res = await reorderAssessmentQuestions(
        templateId,
        updatedQuestions.map(q => ({ id: q.id, sort_order: q.sort_order }))
      );
      if (!res.success) {
        setError(res.error || 'Failed to move question.');
        setQuestionsGrouped(initialQuestions);
      }
    });
  };

  const handleSaveQuestion = async (data: any) => {
    startTransition(async () => {
      let res;
      if (editingQuestion) {
        res = await updateAssessmentQuestion(editingQuestion.id, templateId, data, data.options);
      } else {
        res = await createAssessmentQuestion(templateId, data, data.options);
      }

      if (!res.success) {
        throw new Error(res.error);
      }
      setIsEditorOpen(false);
      setEditingQuestion(null);
    });
  };

  const handleDuplicate = async (question: AssessmentQuestion) => {
    if (isReadOnly) return;
    startTransition(async () => {
      const res = await duplicateAssessmentQuestion(question.id, templateId);
      if (!res.success) {
        setError(res.error || 'Failed to duplicate question.');
      }
    });
  };

  const handleDelete = async (question: AssessmentQuestion) => {
    if (isReadOnly || !canDelete) return;
    if (confirm('Are you sure you want to delete this question?')) {
      startTransition(async () => {
        const res = await deleteAssessmentQuestion(question.id, templateId);
        if (!res.success) {
          setError(res.error || 'Failed to delete question.');
        }
      });
    }
  };

  const openAddModal = (domainId: string) => {
    setEditingQuestion(null);
    setDefaultDomainId(domainId);
    setIsEditorOpen(true);
  };

  const openEditModal = (question: AssessmentQuestion) => {
    setEditingQuestion(question);
    setIsEditorOpen(true);
  };

  // Synchronization with server updates
  React.useEffect(() => {
    setQuestionsGrouped(initialQuestions);
  }, [initialQuestions]);

  // Client Side Filtering & Searching
  const getFilteredQuestionsGrouped = () => {
    return questionsGrouped.map(group => {
      const filtered = group.questions.filter(q => {
        const matchesSearch = q.question_text.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = selectedType === 'all' || q.question_type === selectedType;
        const matchesRequired =
          selectedRequired === 'all' ||
          (selectedRequired === 'required' && q.is_required) ||
          (selectedRequired === 'optional' && !q.is_required);

        return matchesSearch && matchesType && matchesRequired;
      });

      return {
        ...group,
        questions: filtered,
      };
    });
  };

  const filteredGroups = getFilteredQuestionsGrouped();
  const hasAssignedDomains = assignedDomains.length > 0;

  return (
    <div className="space-y-6">
      {/* Workspace Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/30">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors"
          >
            <Eye size={16} /> Preview Assessment
          </button>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          {isReadOnly && (
            <span className="text-xs text-slate-500 italic">
              {templateStatus === 'Draft' ? 'Read-only Access' : 'Active templates cannot be edited'}
            </span>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-slate-700"
          />
        </div>

        <div className="relative">
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-100 text-sm focus:outline-none focus:border-slate-700 appearance-none"
          >
            <option value="all">All Question Types</option>
            <option value="yes_no">Yes / No</option>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="checkbox">Checkbox</option>
            <option value="text">Short Text</option>
            <option value="textarea">Long Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
          </select>
        </div>

        <div className="relative">
          <select
            value={selectedRequired}
            onChange={e => setSelectedRequired(e.target.value)}
            className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-100 text-sm focus:outline-none focus:border-slate-700 appearance-none"
          >
            <option value="all">Required & Optional</option>
            <option value="required">Required Only</option>
            <option value="optional">Optional Only</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Main Builder Area */}
      {!hasAssignedDomains ? (
        <div className="text-center py-12 border border-slate-800/80 rounded-2xl bg-slate-900/10">
          <p className="text-sm text-slate-400">
            Please assign Security Domains to this template first before creating questions.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredGroups.map((group) => {
            const hasQuestions = group.questions.length > 0;
            return (
              <div
                key={group.domain_id}
                className="space-y-4"
                onDragOver={e => handleDragOver(e, group.domain_id)}
              >
                {/* Domain Section Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-200">
                      {group.domain_name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {group.questions.length} question{group.questions.length === 1 ? '' : 's'} defined
                    </p>
                  </div>

                  {!isReadOnly && (
                    <button
                      onClick={() => openAddModal(group.domain_id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 transition-all duration-150"
                    >
                      <Plus size={14} /> Add Question
                    </button>
                  )}
                </div>

                {/* List Container */}
                {!hasQuestions ? (
                  <div className="flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-slate-800 bg-slate-900/5 text-slate-500 text-xs">
                    No questions match the filters in this domain.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {group.questions.map((question, idx) => (
                      <div
                        key={question.id}
                        draggable={!isReadOnly}
                        onDragStart={e => handleDragStart(e, question.id, group.domain_id)}
                        onDrop={e => handleDrop(e, question.id, group.domain_id)}
                        className="relative flex items-center gap-2"
                      >
                        <div className="flex-1">
                          <QuestionCard
                            question={question}
                            onEdit={openEditModal}
                            onDuplicate={handleDuplicate}
                            onDelete={handleDelete}
                            isReadOnly={isReadOnly}
                            canDelete={canDelete}
                          />
                        </div>

                        {/* Drag and Drop Fallback button handles */}
                        {!isReadOnly && group.questions.length > 1 && (
                          <div className="flex flex-col gap-1 pr-1 opacity-0 hover:opacity-100 focus-within:opacity-100 group-hover:opacity-100 transition-opacity">
                            {idx > 0 && (
                              <button
                                onClick={() => handleMoveQuestion(question.id, group.domain_id, 'up')}
                                className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                                title="Move Up"
                              >
                                <ArrowUp size={12} />
                              </button>
                            )}
                            {idx < group.questions.length - 1 && (
                              <button
                                onClick={() => handleMoveQuestion(question.id, group.domain_id, 'down')}
                                className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800"
                                title="Move Down"
                              >
                                <ArrowDown size={12} />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      <QuestionEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingQuestion(null);
        }}
        onSave={handleSaveQuestion}
        question={editingQuestion}
        domains={assignedDomains}
        defaultDomainId={defaultDomainId}
      />

      {/* Preview Modal */}
      <QuestionPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        templateName={templateName}
        groupedQuestions={questionsGrouped}
      />
    </div>
  );
}
