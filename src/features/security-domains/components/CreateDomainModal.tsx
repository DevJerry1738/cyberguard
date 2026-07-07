'use client';

import React, { useState, useRef, useTransition } from 'react';
import { Plus, X, Shield, Loader2 } from 'lucide-react';
import { createSecurityDomainAction } from '../actions/security-domains';
import { useRouter } from 'next/navigation';

interface CreateDomainModalProps {
  variant?: 'default' | 'cta';
}

export default function CreateDomainModal({ variant = 'default' }: CreateDomainModalProps) {
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
      const result = await createSecurityDomainAction(formData);
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
      id="create-domain-cta-btn"
      onClick={handleOpen}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-all shadow-glow-sm hover:shadow-glow-md"
    >
      <Plus className="h-4 w-4" />
      Create Domain
    </button>
  ) : (
    <button
      id="create-domain-header-btn"
      onClick={handleOpen}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-all shadow-glow-sm"
    >
      <Plus className="h-4 w-4" />
      New Domain
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
            aria-labelledby="create-domain-title"
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto animate-fade-in"
          >
            <div className="rounded-3xl border border-surface-800/80 bg-surface-900/95 backdrop-blur-md shadow-xl p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15 border border-brand-500/25">
                    <Shield className="h-4.5 w-4.5 text-brand-400" />
                  </div>
                  <h2 id="create-domain-title" className="font-display text-lg font-bold text-white">
                    New Security Domain
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

              {/* Form */}
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="domain-name" className="text-sm font-medium text-slate-300">
                    Domain Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="domain-name"
                    name="name"
                    type="text"
                    required
                    minLength={3}
                    maxLength={100}
                    placeholder="e.g. Access Control, Network Security"
                    className="w-full rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="domain-desc" className="text-sm font-medium text-slate-300">
                    Description <span className="text-slate-500 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="domain-desc"
                    name="description"
                    rows={3}
                    maxLength={500}
                    placeholder="Brief description of this security domain..."
                    className="w-full rounded-xl border border-surface-700 bg-surface-800/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500/60 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all resize-none"
                  />
                </div>

                {/* Footer */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isPending}
                    className="flex-1 rounded-xl border border-surface-700 bg-surface-800/30 px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:border-surface-600 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:bg-brand-500/60 px-4 py-2 text-sm font-medium text-white transition-all"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Create Domain
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
