'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Layers,
  Shield,
  Edit2,
  Copy,
  Archive,
  Trash2,
  CheckCircle,
  HelpCircle,
  Clock,
  ArrowLeft,
  Loader2,
  Check,
} from 'lucide-react';
import type { AssessmentTemplate } from '../schemas/template';
import type { SecurityDomain } from '@/features/security-domains/schemas/security-domain';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { VersionBadge } from './VersionBadge';
import {
  updateDraftTemplate,
  activateTemplate,
  archiveTemplate,
  assignDomainsToTemplate,
} from '../actions/templates';
import { DuplicateDialog } from './DuplicateDialog';
import { DeleteTemplateDialog } from './DeleteTemplateDialog';

interface TemplateDetailViewProps {
  template: AssessmentTemplate;
  domains: Array<SecurityDomain & { sort_order?: number }>;
  allAvailableDomains: SecurityDomain[];
  history: AssessmentTemplate[];
  userRole: string;
}

export function TemplateDetailView({
  template,
  domains,
  allAvailableDomains,
  history,
  userRole,
}: TemplateDetailViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Edit Mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(template.name);
  const [editDescription, setEditDescription] = useState(template.description || '');
  const [editFramework, setEditFramework] = useState(template.framework);
  const [editVersion, setEditVersion] = useState(template.version);

  // Manage Assigned Domains states (for Draft)
  const [isManagingDomains, setIsManagingDomains] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState<string[]>(
    domains.map(d => d.id)
  );

  // Dialogs
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Permissions
  const canManage = ['Owner', 'Admin', 'Security Officer'].includes(userRole);
  const canPublish = ['Owner', 'Admin'].includes(userRole);
  const isOwner = userRole === 'Owner';

  const handleUpdateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await updateDraftTemplate(template.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        framework: editFramework.trim(),
        version: editVersion.trim(),
      });

      if (result.success) {
        setIsEditing(false);
        router.refresh();
      } else {
        setError(result.error ?? 'Failed to update template');
      }
    });
  };

  const handleDomainToggle = (domainId: string) => {
    setSelectedDomains(prev =>
      prev.includes(domainId) ? prev.filter(id => id !== domainId) : [...prev, domainId]
    );
  };

  const handleSaveDomains = async () => {
    setError(null);
    if (selectedDomains.length === 0) {
      setError('A template must have at least one security domain');
      return;
    }

    startTransition(async () => {
      const result = await assignDomainsToTemplate(template.id, selectedDomains);
      if (result.success) {
        setIsManagingDomains(false);
        router.refresh();
      } else {
        setError(result.error ?? 'Failed to assign domains');
      }
    });
  };

  const handleActivate = () => {
    setError(null);
    startTransition(async () => {
      const result = await activateTemplate(template.id);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? 'Failed to activate template');
      }
    });
  };

  const handleArchive = () => {
    setError(null);
    startTransition(async () => {
      const result = await archiveTemplate(template.id);
      if (result.success) {
        router.refresh();
      } else {
        setError(result.error ?? 'Failed to archive template');
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/assessments/templates"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Templates
        </Link>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-400 border border-red-500/20">
          {error}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Info + Domains */}
        <div className="lg:col-span-2 space-y-6">
          {/* Metadata Card */}
          <div className="rounded-3xl border border-surface-800 bg-surface-900/30 backdrop-blur-md p-6 sm:p-8 shadow-xl">
            {isEditing ? (
              <form onSubmit={handleUpdateTemplate} className="space-y-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-white mb-4">Edit Template Metadata</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                      Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      className="w-full rounded-xl border border-surface-700 bg-surface-800/40 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                        Framework
                      </label>
                      <input
                        type="text"
                        required
                        value={editFramework}
                        onChange={e => setEditFramework(e.target.value)}
                        className="w-full rounded-xl border border-surface-700 bg-surface-800/40 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                        Version
                      </label>
                      <input
                        type="text"
                        required
                        value={editVersion}
                        onChange={e => setEditVersion(e.target.value)}
                        className="w-full rounded-xl border border-surface-700 bg-surface-800/40 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
                      Description
                    </label>
                    <textarea
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-surface-700 bg-surface-800/40 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={isPending}
                    className="flex-1 rounded-xl border border-surface-750 bg-surface-900/20 px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-500 transition-all disabled:opacity-75"
                  >
                    {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">
                      {template.framework}
                    </span>
                    <h1 className="font-display text-2xl font-bold text-white leading-tight">
                      {template.name}
                    </h1>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <VersionBadge version={template.version} />
                    <StatusBadge status={template.status} />
                  </div>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {template.description || <span className="italic text-slate-650">No description provided.</span>}
                </p>

                {/* Date meta */}
                <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-surface-800/60 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>Created: {new Date(template.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>Updated: {new Date(template.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Assigned Domains Card */}
          <div className="rounded-3xl border border-surface-800 bg-surface-900/30 backdrop-blur-md p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-white">Assigned Security Domains</h3>
                <p className="text-sm text-slate-400 mt-0.5">Logical grouping categories included in this blueprint.</p>
              </div>
              {template.status === 'Draft' && canManage && (
                <button
                  onClick={() => {
                    setSelectedDomains(domains.map(d => d.id));
                    setIsManagingDomains(!isManagingDomains);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-surface-750 bg-surface-800/30 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-all"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  {isManagingDomains ? 'Cancel' : 'Manage'}
                </button>
              )}
            </div>

            {isManagingDomains ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {allAvailableDomains.map(dom => {
                    const isChecked = selectedDomains.includes(dom.id);
                    return (
                      <button
                        key={dom.id}
                        type="button"
                        onClick={() => handleDomainToggle(dom.id)}
                        className={`flex items-start text-left gap-3 p-3.5 rounded-xl border transition-all ${
                          isChecked
                            ? 'border-brand-500 bg-brand-500/10 text-white'
                            : 'border-surface-800 bg-surface-900/40 text-slate-300 hover:border-surface-700'
                        }`}
                      >
                        <div className={`mt-0.5 flex h-4.5 w-4.5 items-center justify-center rounded border transition-colors ${isChecked ? 'bg-brand-500 border-brand-500 text-white' : 'border-surface-750 text-transparent'}`}>
                          <Check className="h-3 w-3 stroke-[3px]" />
                        </div>
                        <div>
                          <p className="font-semibold text-xs">{dom.name}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{dom.description || 'No description'}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setIsManagingDomains(false)}
                    disabled={isPending}
                    className="rounded-xl border border-surface-750 bg-surface-900/20 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDomains}
                    disabled={isPending}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-500 transition-all disabled:opacity-75"
                  >
                    {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Save Assignments'}
                  </button>
                </div>
              </div>
            ) : domains.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-surface-800 rounded-2xl">
                <Layers className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No domains assigned to this template.</p>
                {template.status === 'Draft' && <p className="text-xs text-slate-500 mt-1">Click Manage to assign categories.</p>}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {domains.map((dom, index) => (
                  <div
                    key={dom.id}
                    className="flex items-start gap-3 p-4 rounded-2xl border border-surface-800/80 bg-surface-900/20 group hover:border-surface-700 transition-all"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-900 border border-surface-800 text-slate-450 group-hover:text-brand-400 transition-colors">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-white">{dom.name}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                        {dom.description || <span className="italic text-slate-600">No description</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Epic 10 Questions placeholder */}
          <div className="rounded-3xl border border-surface-800 bg-surface-900/10 p-6 flex items-start gap-4">
            <HelpCircle className="h-6 w-6 text-slate-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm text-white">Assessment Questions (Epic 10)</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                In the next sprint (Epic 10), you will be able to author and manage specific compliance questions against the domains assigned to this template blueprint.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Actions + History */}
        <div className="space-y-6">
          {/* Actions panel */}
          <div className="rounded-3xl border border-surface-800 bg-surface-900/30 backdrop-blur-md p-6 shadow-xl space-y-4">
            <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              Template Actions
            </h3>

            <div className="flex flex-col gap-2.5">
              {template.status === 'Draft' && canManage && (
                <button
                  onClick={() => setIsEditing(true)}
                  disabled={isPending}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-surface-750 hover:border-surface-600 bg-surface-800/30 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:text-white transition-all disabled:opacity-50"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Draft Info
                </button>
              )}

              {canManage && (
                <button
                  onClick={() => setIsDuplicateOpen(true)}
                  disabled={isPending}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-surface-750 hover:border-surface-600 bg-surface-800/30 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:text-white transition-all disabled:opacity-50"
                >
                  <Copy className="h-4 w-4" />
                  Duplicate & Version
                </button>
              )}

              {template.status === 'Draft' && canPublish && (
                <button
                  onClick={handleActivate}
                  disabled={isPending}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-glow-sm hover:shadow-glow-md transition-all disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Activate Template
                    </>
                  )}
                </button>
              )}

              {template.status === 'Active' && canPublish && (
                <button
                  onClick={handleArchive}
                  disabled={isPending}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-glow-sm hover:shadow-glow-md transition-all disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Archive className="h-4 w-4" />
                      Archive Template
                    </>
                  )}
                </button>
              )}

              {isOwner && (
                <button
                  onClick={() => setIsDeleteOpen(true)}
                  disabled={isPending}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 hover:border-red-500/45 hover:bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition-all disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Template
                </button>
              )}
            </div>
          </div>

          {/* Family Lineage / Version History */}
          <div className="rounded-3xl border border-surface-800 bg-surface-900/30 backdrop-blur-md p-6 shadow-xl space-y-4">
            <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
              Version History
            </h3>

            {history.length <= 1 ? (
              <p className="text-xs text-slate-500">No other versions in this family lineage.</p>
            ) : (
              <div className="space-y-3.5 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-800">
                {history.map(hist => {
                  const isActive = hist.id === template.id;
                  return (
                    <div key={hist.id} className="flex items-start gap-3 relative pl-8">
                      {/* Circle indicator */}
                      <div className={`absolute left-2.5 -translate-x-1/2 h-2.5 w-2.5 rounded-full border ${isActive ? 'bg-brand-400 border-brand-400 ring-4 ring-brand-500/15' : 'bg-surface-900 border-surface-750'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <Link
                            href={`/assessments/templates/${hist.id}`}
                            className={`text-xs font-semibold hover:text-brand-400 transition-colors ${isActive ? 'text-white' : 'text-slate-400'}`}
                          >
                            v{hist.version} {hist.id === (template.root_template_id || template.id) && <span className="text-[10px] text-slate-500 font-normal italic">(Root)</span>}
                          </Link>
                          <StatusBadge status={hist.status} />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {new Date(hist.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {isDuplicateOpen && (
        <DuplicateDialog
          isOpen={isDuplicateOpen}
          onClose={() => setIsDuplicateOpen(false)}
          template={template}
        />
      )}

      {isDeleteOpen && (
        <DeleteTemplateDialog
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          template={template}
        />
      )}
    </div>
  );
}
