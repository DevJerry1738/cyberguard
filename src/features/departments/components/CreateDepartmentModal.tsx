'use client';

import React, { useState, useRef, useTransition } from 'react';
import { Plus, X, Building2, Loader2 } from 'lucide-react';
import { createDepartmentAction } from '../actions/departments';
import { useRouter } from 'next/navigation';

interface CreateDepartmentModalProps {
  variant?: 'default' | 'cta';
  members: any[];
}

export default function CreateDepartmentModal({ variant = 'default', members }: CreateDepartmentModalProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  function handleOpen() {
    setError(null);
    setOpen(true);
  }

  function handleClose() {
    if (!isPending) {
      setOpen(false);
      setError(null);
      formRef.current?.reset();
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createDepartmentAction(formData);
      if (result.success) {
        setOpen(false);
        formRef.current?.reset();
        router.refresh();
      } else {
        setError(result.error ?? 'Something went wrong.');
      }
    });
  }

  const triggerButton = variant === 'cta' ? (
    <button
      id="create-dept-cta-btn"
      onClick={handleOpen}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-all shadow-glow-sm hover:shadow-glow-md"
    >
      <Plus className="h-4 w-4" />
      Create Department
    </button>
  ) : (
    <button
      id="create-dept-header-btn"
      onClick={handleOpen}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-all shadow-glow-sm"
    >
      <Plus className="h-4 w-4" />
      New Department
    </button>
  );

  return (
    <>
      {triggerButton}

      {open && (
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
            aria-labelledby="create-dept-title"
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto animate-fade-in"
          >
            <div className="rounded-3xl border border-surface-800/80 bg-surface-900/95 backdrop-blur-md shadow-xl p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15 border border-brand-500/25">
                    <Building2 className="h-4.5 w-4.5 text-brand-400" />
                  </div>
                  <h2 id="create-dept-title" className="font-display text-lg font-bold text-white">
                    New Department
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
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="dept-name" className="text-sm font-medium text-slate-300">
                    Department Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="dept-name"
                    name="name"
                    type="text"
                    required
                    maxLength={100}
                    placeholder="e.g. Engineering, Finance, Legal"
                    className="w-full rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="dept-desc" className="text-sm font-medium text-slate-300">
                    Description <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="dept-desc"
                    name="description"
                    rows={3}
                    maxLength={500}
                    placeholder="Brief description of this department's responsibilities..."
                    className="w-full rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all resize-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="dept-manager" className="text-sm font-medium text-slate-300">
                    Manager <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <select
                    id="dept-manager"
                    name="manager_id"
                    className="w-full rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-2.5 text-sm text-white focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                  >
                    <option value="" className="bg-surface-900 text-slate-400">No Manager Assigned</option>
                    {members.map(member => {
                      const profile = member.profiles;
                      if (!profile) return null;
                      const name = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.email;
                      return (
                        <option key={member.profile_id} value={member.profile_id} className="bg-surface-900 text-white">
                          {name} ({profile.email})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3">
                    <p className="text-sm text-rose-400">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isPending}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-surface-700 text-sm text-slate-400 hover:text-white hover:border-surface-600 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-all shadow-glow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating…
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Create Department
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
