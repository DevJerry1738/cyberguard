'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Shield, Layers, HelpCircle, AlertCircle, Loader2 } from 'lucide-react';
import { createAssessmentTemplate } from '../actions/templates';
import { FrameworksList } from '../schemas/template';
import type { SecurityDomain } from '@/features/security-domains/schemas/security-domain';

interface CreateTemplateWizardProps {
  domains: SecurityDomain[];
}

export function CreateTemplateWizard({ domains }: CreateTemplateWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [framework, setFramework] = useState('CyberGuard Baseline');
  const [customFramework, setCustomFramework] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);

  // Validation
  const validateStep1 = () => {
    if (!name.trim()) return 'Template name is required';
    if (name.trim().length < 3) return 'Name must be at least 3 characters';
    if (framework === 'Custom' && !customFramework.trim()) return 'Custom framework name is required';
    if (!version.trim()) return 'Initial version tag is required';
    if (!/^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$/.test(version)) {
      return 'Version must be a valid semantic version (e.g. 1.0.0)';
    }
    return null;
  };

  const validateStep2 = () => {
    if (selectedDomains.length === 0) return 'At least one security domain must be assigned';
    return null;
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      const err = validateStep1();
      if (err) {
        setError(err);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const err = validateStep2();
      if (err) {
        setError(err);
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleDomainToggle = (domainId: string) => {
    setSelectedDomains(prev =>
      prev.includes(domainId) ? prev.filter(id => id !== domainId) : [...prev, domainId]
    );
  };

  const handleSubmit = () => {
    setError(null);
    const finalFramework = framework === 'Custom' ? customFramework.trim() : framework;

    startTransition(async () => {
      const result = await createAssessmentTemplate(
        {
          name: name.trim(),
          description: description.trim() || undefined,
          framework: finalFramework,
          version: version.trim(),
        },
        selectedDomains
      );

      if (result.success && result.id) {
        router.push(`/assessments/templates/${result.id}`);
        router.refresh();
      } else {
        setError(result.error ?? 'Failed to create template');
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-8 max-w-lg mx-auto relative">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-surface-800 z-0" />
        {[1, 2, 3].map(num => {
          const isActive = step === num;
          const isCompleted = step > num;
          return (
            <div key={num} className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-brand-500 border-brand-500 text-white shadow-glow-sm'
                    : isCompleted
                      ? 'bg-brand-950 border-brand-500 text-brand-400'
                      : 'bg-surface-900 border-surface-800 text-slate-500'
                }`}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : num}
              </div>
              <span className={`text-[11px] font-medium mt-2 transition-colors ${isActive ? 'text-white' : 'text-slate-500'}`}>
                {num === 1 ? 'Metadata' : num === 2 ? 'Security Domains' : 'Review'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20 flex gap-3 items-center">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Wizard Form Cards */}
      <div className="rounded-3xl border border-surface-800 bg-surface-900/30 backdrop-blur-md p-6 sm:p-8 shadow-xl">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-lg font-bold text-white mb-1">Basic Template Information</h3>
              <p className="text-sm text-slate-400">Define the blueprint name, compliant framework, and version.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                  Template Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. ISO 27001 Checklist, Baseline Assessment"
                  className="w-full rounded-xl border border-surface-700 bg-surface-800/40 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                  Compliance Framework
                </label>
                <select
                  value={framework}
                  onChange={e => setFramework(e.target.value)}
                  className="w-full rounded-xl border border-surface-700 bg-surface-800/40 px-3.5 py-2.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                >
                  {FrameworksList.map(fw => (
                    <option key={fw} value={fw}>
                      {fw}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                  Version
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={e => setVersion(e.target.value)}
                  placeholder="e.g. 1.0.0"
                  className="w-full rounded-xl border border-surface-700 bg-surface-800/40 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>

              {framework === 'Custom' && (
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                    Custom Framework Name
                  </label>
                  <input
                    type="text"
                    value={customFramework}
                    onChange={e => setCustomFramework(e.target.value)}
                    placeholder="Enter custom framework name..."
                    className="w-full rounded-xl border border-surface-700 bg-surface-800/40 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Summarize the assessment scope, objective, and reference docs..."
                  rows={4}
                  className="w-full rounded-xl border border-surface-700 bg-surface-800/40 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all resize-none"
                />
                <p className="mt-1.5 text-right text-xs text-slate-500">
                  {description.length}/1000 characters
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-lg font-bold text-white mb-1">Select Security Domains</h3>
              <p className="text-sm text-slate-400">Choose which categories from the assessment engine will belong to this template.</p>
            </div>

            {domains.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-surface-800 rounded-xl">
                <Layers className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No active security domains found.</p>
                <p className="text-xs text-slate-500 mt-1">Please create domains in Security Domains first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {domains.map(dom => {
                  const isChecked = selectedDomains.includes(dom.id);
                  return (
                    <button
                      key={dom.id}
                      type="button"
                      onClick={() => handleDomainToggle(dom.id)}
                      className={`flex items-start text-left gap-3 p-4 rounded-2xl border transition-all ${
                        isChecked
                          ? 'border-brand-500 bg-brand-500/10 text-white'
                          : 'border-surface-800 bg-surface-900/40 text-slate-300 hover:border-surface-700 hover:bg-surface-900/60'
                      }`}
                    >
                      <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border transition-colors ${isChecked ? 'bg-brand-500 border-brand-500 text-white' : 'border-surface-750 text-transparent'}`}>
                        <Check className="h-3.5 w-3.5 stroke-[3px]" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{dom.name}</p>
                        <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{dom.description || 'No description'}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-lg font-bold text-white mb-1">Review & Create</h3>
              <p className="text-sm text-slate-400">Verify your configurations before creating the template draft.</p>
            </div>

            <div className="space-y-4 rounded-2xl bg-surface-950/40 border border-surface-800 p-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">TEMPLATE NAME</p>
                  <p className="font-semibold text-white mt-0.5">{name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">FRAMEWORK</p>
                  <p className="font-semibold text-white mt-0.5">
                    {framework === 'Custom' ? customFramework : framework}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">INITIAL VERSION</p>
                  <p className="font-semibold text-brand-400 mt-0.5">v{version}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">INITIAL STATUS</p>
                  <p className="font-semibold text-amber-400 mt-0.5">Draft</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">DESCRIPTION</p>
                  <p className="text-slate-300 mt-0.5 text-xs leading-relaxed">
                    {description || <span className="italic text-slate-650">No description provided</span>}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                ASSIGNED DOMAINS ({selectedDomains.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedDomains.map(id => {
                  const dom = domains.find(d => d.id === id);
                  return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-brand-500/20 bg-brand-500/5 text-xs text-brand-300 font-medium"
                    >
                      <Shield className="h-3.5 w-3.5 text-brand-400" />
                      {dom?.name}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between items-center gap-4 pt-6 border-t border-surface-800">
          <button
            type="button"
            onClick={step === 1 ? () => router.push('/assessments/templates') : handleBack}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-surface-750 hover:border-surface-600 bg-surface-900/20 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition-all disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" />
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 hover:bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow-sm hover:shadow-glow-md transition-all"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-glow-sm hover:shadow-glow-md transition-all disabled:opacity-75"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Create Template
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
