'use client';

import React, { useState, useTransition } from 'react';
import { X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { deleteTemplate } from '../actions/templates';
import { useRouter } from 'next/navigation';
import type { AssessmentTemplate } from '../schemas/template';

interface DeleteTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  template: AssessmentTemplate | null;
}

export function DeleteTemplateDialog({ isOpen, onClose, template }: DeleteTemplateDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!isOpen || !template) return null;

  function handleClose() {
    if (!isPending) {
      onClose();
      setError(null);
    }
  }

  async function handleConfirm() {
    if (!template) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteTemplate(template.id);
      if (result.success) {
        handleClose();
        router.push('/assessments/templates');
        router.refresh();
      } else {
        setError(result.error ?? 'Failed to delete template');
      }
    });
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45 animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto animate-fade-in"
      >
        <div className="rounded-3xl border border-red-500/25 bg-surface-900/95 backdrop-blur-md shadow-xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/25 bg-red-500/15 text-red-400">
                <AlertTriangle className="h-4.5 w-4.5" />
              </div>
              <h2 id="delete-dialog-title" className="font-display text-lg font-bold text-white">
                Delete Template
              </h2>
            </div>
            <button
              onClick={handleClose}
              disabled={isPending}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-surface-800/60 transition-all"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20 mb-4">
              {error}
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm text-slate-300 mb-3">
              Are you sure you want to delete the assessment template: <strong>{template.name} (v{template.version})</strong>?
            </p>
            <p className="text-xs text-red-400">
              Warning: This is a soft deletion. This template will no longer be visible or available for creating new assessment sessions, but historical references may persist.
            </p>
          </div>

          {/* Footer buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={isPending}
              className="flex-1 rounded-xl border border-surface-700 bg-surface-800/30 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:border-surface-600 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isPending}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 transition-all disabled:opacity-70"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
