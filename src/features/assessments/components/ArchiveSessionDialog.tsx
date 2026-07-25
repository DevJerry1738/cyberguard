"use client";

import React from 'react';
import { X, AlertTriangle, Loader2, Archive } from 'lucide-react';
import { archiveAssessmentSession } from '@/features/assessments/actions/sessions';
import { useRouter } from 'next/navigation';

interface ArchiveSessionDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
  sessionId: string;
  sessionName: string;
  isArchived?: boolean;
}

export function ArchiveSessionDialog({ sessionId, sessionName, isArchived }: ArchiveSessionDialogProps) {
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center rounded-xl border border-surface-700 bg-surface-800 px-3 py-2 text-sm font-medium text-slate-200 hover:border-rose-500 hover:text-white transition-colors"
      >
        <Archive className="mr-2 h-4 w-4" />
        {isArchived ? 'Restore' : 'Archive'}
      </button>
    );
  }

  const handleClose = () => {
    if (!isPending) {
      setIsOpen(false);
      setError(null);
    }
  };

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await archiveAssessmentSession(sessionId);
      if (result.success) {
        router.refresh();
        handleClose();
      } else {
        setError(result.error || 'An error occurred');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 hover:bg-zinc-900 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start space-x-3">
          <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {isArchived ? 'Restore Session' : 'Archive Session'}
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              {isArchived
                ? `Are you sure you want to restore "${sessionName}"? It will become active again.`
                : `Are you sure you want to archive "${sessionName}"? Archived sessions are hidden from employees.`}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={isPending}
            className="rounded-lg border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
              isArchived ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'
            }`}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isArchived ? 'Restore' : 'Archive'}
          </button>
        </div>
      </div>
    </div>
  );
}
