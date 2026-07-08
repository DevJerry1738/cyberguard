'use client';

import React, { useState, useTransition } from 'react';
import { X, Copy, Loader2, AlertTriangle } from 'lucide-react';
import { duplicateTemplate } from '../actions/templates';
import { useRouter } from 'next/navigation';
import type { AssessmentTemplate } from '../schemas/template';

interface DuplicateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  template: AssessmentTemplate | null;
}

export function DuplicateDialog({ isOpen, onClose, template }: DuplicateDialogProps) {
  const [newVersion, setNewVersion] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Suggest version increments when template changes
  React.useEffect(() => {
    if (template) {
      const parts = template.version.split('.');
      if (parts.length === 3) {
        const major = parseInt(parts[0], 10);
        const minor = parseInt(parts[1], 10);
        const patch = parseInt(parts[2], 10);
        // Suggest a minor bump by default
        setNewVersion(`${major}.${minor + 1}.0`);
      } else {
        setNewVersion('1.0.0');
      }
      setNewName(`${template.name} (Copy)`);
      setError(null);
    }
  }, [template]);

  if (!isOpen || !template) return null;

  function handleClose() {
    if (!isPending) {
      onClose();
      setError(null);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!template) return;

    setError(null);

    if (!newVersion.trim()) {
      setError('Version string is required');
      return;
    }

    startTransition(async () => {
      const result = await duplicateTemplate(template.id, newVersion.trim(), newName.trim() || undefined);
      if (result.success && result.id) {
        handleClose();
        router.push(`/assessments/templates/${result.id}`);
      } else {
        setError(result.error ?? 'Failed to duplicate template');
      }
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45 animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="duplicate-dialog-title"
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto animate-fade-in"
      >
        <div className="rounded-3xl border border-surface-800 bg-surface-900/95 backdrop-blur-md shadow-xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-500/25 bg-brand-500/15 text-brand-400">
                <Copy className="h-4.5 w-4.5" />
              </div>
              <h2 id="duplicate-dialog-title" className="font-display text-lg font-bold text-white">
                Duplicate Template
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

          {/* Form */}
          <form onSubmit={handleConfirm} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
                {error}
              </div>
            )}

            <div>
              <p className="text-xs text-slate-500 font-semibold mb-1">SOURCE TEMPLATE</p>
              <p className="text-sm font-medium text-white">{template.name}</p>
              <p className="text-xs text-slate-400">Current version: v{template.version}</p>
            </div>

            <div>
              <label htmlFor="new-name" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                New Template Name (Optional)
              </label>
              <input
                id="new-name"
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder={template.name}
                disabled={isPending}
                className="w-full rounded-xl border border-surface-700 bg-surface-800/40 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="new-version" className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                New Version (Required)
              </label>
              <input
                id="new-version"
                type="text"
                required
                value={newVersion}
                onChange={e => setNewVersion(e.target.value)}
                placeholder="e.g. 1.1.0"
                disabled={isPending}
                className="w-full rounded-xl border border-surface-700 bg-surface-800/40 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
              />
              <p className="mt-1 text-xs text-slate-500">Must be standard semantic versioning (Major.Minor.Patch).</p>
            </div>

            <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3.5 flex gap-2.5">
              <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-200/90 leading-relaxed">
                Duplicating will copy the template's metadata and all assigned security domains to a new version in the **Draft** state.
              </p>
            </div>

            {/* Footer buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isPending}
                className="flex-1 rounded-xl border border-surface-700 bg-surface-800/30 px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:border-surface-600 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-500 transition-all disabled:opacity-70"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Duplicating...
                  </>
                ) : (
                  'Create Draft'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
