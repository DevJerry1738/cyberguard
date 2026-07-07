'use client';

import React from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { softDeleteDepartmentAction } from '../actions/departments';
import { useRouter } from 'next/navigation';

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  departmentId: string;
  departmentName: string;
}

export function DeleteDialog({ isOpen, onClose, departmentId, departmentName }: DeleteDialogProps) {
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  if (!isOpen) return null;

  const handleConfirm = () => {
    setError(null);
    startTransition(async () => {
      const result = await softDeleteDepartmentAction(departmentId);
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
          <div className="rounded-lg bg-red-500/10 p-2 text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Delete Department</h3>
            <p className="mt-2 text-sm text-zinc-400">
              Are you sure you want to delete "{departmentName}"? This action will hide it from all normal lists. This operation is restricted to Owners.
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
            className="flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-50"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
