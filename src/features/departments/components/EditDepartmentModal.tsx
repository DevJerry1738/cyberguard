'use client';

import React from 'react';
import { X, Building2, Loader2 } from 'lucide-react';
import { updateDepartmentAction } from '../actions/departments';
import { useRouter } from 'next/navigation';
import type { Department } from '@/types/departments';

interface EditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department: Department;
  members: any[];
}

export function EditDepartmentModal({ isOpen, onClose, department, members }: EditDepartmentModalProps) {
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateDepartmentAction(department.id, formData);
      if (result.success) {
        router.refresh();
        onClose();
      } else {
        setError(result.error || 'Failed to update department');
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

        <div className="flex items-center space-x-2 text-emerald-400">
          <Building2 className="h-5 w-5" />
          <h2 className="text-xl font-bold text-white">Edit Department</h2>
        </div>

        <p className="mt-1 text-sm text-zinc-400">
          Modify the department name, description, and assign or change the manager.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-300">
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              maxLength={100}
              defaultValue={department.name}
              className="mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
              placeholder="e.g. Security Operations"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-zinc-300">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              defaultValue={department.description || ''}
              className="mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
              placeholder="Brief overview of department functions"
            />
          </div>

          <div>
            <label htmlFor="manager_id" className="block text-sm font-medium text-zinc-300">
              Department Manager
            </label>
            <select
              name="manager_id"
              id="manager_id"
              defaultValue={department.manager_id || ''}
              className="mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
            >
              <option value="">No Manager Assigned</option>
              {members.map(member => {
                const profile = member.profiles;
                if (!profile) return null;
                const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email;
                return (
                  <option key={member.profile_id} value={member.profile_id}>
                    {name} ({profile.email})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="mt-6 flex justify-end space-x-3 border-t border-zinc-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
