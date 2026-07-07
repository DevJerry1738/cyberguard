'use client';

import React from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { archiveDepartmentAction } from '../actions/departments';
import { useRouter } from 'next/navigation';

interface ArchiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  departmentId: string;
  departmentName: string;
  isArchived: boolean;
}

export function ArchiveDialog({ isOpen, onClose, departmentId, departmentName, isArchived }: ArchiveDialogProps) {
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  if (!isOpen) return null;

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await archiveDepartmentAction(departmentId, !isArchived);
      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error || 'An error occurred');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
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
              {isArchived ? 'Restore Department' : 'Archive Department'}
            </h3>
            <p className="mt-2 text-sm text-zinc-400">
              {isArchived
                ? `Are you sure you want to restore "${departmentName}"? It will become active again.`
                : `Are you sure you want to archive "${departmentName}"? Members cannot be added to archived departments.`}
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
            onClick={onClose}
            disabled={isPending}
            className="rounded-lg border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className={`flex items-center rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${
              isArchived
                ? 'bg-emerald-600 hover:bg-emerald-500'
                : 'bg-amber-600 hover:bg-amber-500'
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
