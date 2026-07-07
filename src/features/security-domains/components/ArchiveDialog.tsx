'use client';

import React, { useState, useTransition } from 'react';
import { X, Archive, AlertTriangle, Loader2 } from 'lucide-react';
import { archiveSecurityDomainAction } from '../actions/security-domains';
import { useRouter } from 'next/navigation';

interface ArchiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  domainId: string;
  domainName: string;
  isArchived: boolean;
}

export function ArchiveDialog({ isOpen, onClose, domainId, domainName, isArchived }: ArchiveDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClose() {
    if (!isPending) {
      onClose();
      setError(null);
    }
  }

  async function handleConfirm() {
    setError(null);
    startTransition(async () => {
      const result = await archiveSecurityDomainAction(domainId, !isArchived);
      if (result.success) {
        handleClose();
        router.refresh();
      } else {
        setError(result.error ?? 'Something went wrong.');
      }
    });
  }

  if (!isOpen) return null;

  const action = isArchived ? 'Restore' : 'Archive';
  const message = isArchived
    ? 'This domain will be restored and can be used in new assessment templates.'
    : 'Archived domains cannot be assigned to new assessment templates but remain available for historical assessments.';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="archive-domain-title"
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto animate-fade-in"
      >
        <div className="rounded-3xl border border-surface-800/80 bg-surface-900/95 backdrop-blur-md shadow-xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${isArchived ? 'bg-emerald-500/15 border-emerald-500/25' : 'bg-amber-500/15 border-amber-500/25'}`}>
                <AlertTriangle className={`h-4.5 w-4.5 ${isArchived ? 'text-emerald-400' : 'text-amber-400'}`} />
              </div>
              <h2 id="archive-domain-title" className="font-display text-lg font-bold text-white">
                {action} Domain
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

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-500/10 p-3 mb-4 text-sm text-red-400 border border-red-500/20">
              {error}
            </div>
          )}

          {/* Content */}
          <div className="mb-6">
            <p className="text-sm text-slate-300 mb-3">
              <strong>{domainName}</strong>
            </p>
            <p className="text-sm text-slate-400">{message}</p>
          </div>

          {/* Footer */}
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
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-all ${isArchived ? 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/60' : 'bg-amber-600 hover:bg-amber-700 disabled:bg-amber-600/60'}`}
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {action}ing...
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4" />
                  {action}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
