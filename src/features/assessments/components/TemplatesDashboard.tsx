'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid, List, Plus, Search, Shield } from 'lucide-react';
import type { AssessmentTemplate } from '../schemas/template';
import { FrameworksList } from '../schemas/template';
import { TemplateCard } from './TemplateCard';
import { TemplateTable } from './TemplateTable';
import { DuplicateDialog } from './DuplicateDialog';
import { DeleteTemplateDialog } from './DeleteTemplateDialog';

interface TemplatesDashboardProps {
  initialTemplates: AssessmentTemplate[];
  userRole: string;
}

export function TemplatesDashboard({ initialTemplates, userRole }: TemplatesDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedFramework, setSelectedFramework] = useState(searchParams.get('framework') || 'All');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'All');

  // Dialog states
  const [activeDialogTemplate, setActiveDialogTemplate] = useState<AssessmentTemplate | null>(null);
  const [isDuplicateOpen, setIsDuplicateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const canCreate = ['Owner', 'Admin', 'Security Officer'].includes(userRole);

  // Handle filter changes by updating the URL query parameters
  const applyFilters = (search: string, framework: string, status: string) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (framework && framework !== 'All') params.set('framework', framework);
    if (status && status !== 'All') params.set('status', status);

    router.push(`/assessments/templates?${params.toString()}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    applyFilters(val, selectedFramework, selectedStatus);
  };

  const handleFrameworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedFramework(val);
    applyFilters(searchQuery, val, selectedStatus);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedStatus(val);
    applyFilters(searchQuery, selectedFramework, val);
  };

  const triggerDuplicate = (template: AssessmentTemplate) => {
    setActiveDialogTemplate(template);
    setIsDuplicateOpen(true);
  };

  const triggerDelete = (template: AssessmentTemplate) => {
    setActiveDialogTemplate(template);
    setIsDeleteOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-surface-900/20 border border-surface-800 p-4 rounded-2xl">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search templates by name..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full rounded-xl border border-surface-700 bg-surface-800/30 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedFramework}
            onChange={handleFrameworkChange}
            className="rounded-xl border border-surface-700 bg-surface-800/30 px-3 py-2 text-xs text-slate-300 focus:border-brand-500 focus:outline-none transition-all"
          >
            <option value="All">All Frameworks</option>
            {FrameworksList.map(fw => (
              <option key={fw} value={fw}>
                {fw}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            className="rounded-xl border border-surface-700 bg-surface-800/30 px-3 py-2 text-xs text-slate-300 focus:border-brand-500 focus:outline-none transition-all"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Archived">Archived</option>
          </select>

          {/* Toggle View */}
          <div className="flex items-center bg-surface-800/40 p-1 rounded-xl border border-surface-700/60">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-brand-500 text-white shadow-glow-sm' : 'text-slate-400 hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-brand-500 text-white shadow-glow-sm' : 'text-slate-400 hover:text-white'}`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {canCreate && (
            <Link
              href="/assessments/templates/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 px-4 py-2 text-xs font-semibold text-white shadow-glow-sm hover:shadow-glow-md transition-all"
            >
              <Plus className="h-4 w-4" />
              New Template
            </Link>
          )}
        </div>
      </div>

      {/* Templates List */}
      {initialTemplates.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-surface-800 rounded-2xl bg-surface-950/20">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-900 border border-surface-800 text-slate-500 mb-4">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">No templates found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query or filters, or create a new assessment template draft to get started.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialTemplates.map(template => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      ) : (
        <TemplateTable
          templates={initialTemplates}
          userRole={userRole}
          onDuplicate={triggerDuplicate}
          onDelete={triggerDelete}
        />
      )}

      {/* Modals */}
      {isDuplicateOpen && (
        <DuplicateDialog
          isOpen={isDuplicateOpen}
          onClose={() => {
            setIsDuplicateOpen(false);
            setActiveDialogTemplate(null);
          }}
          template={activeDialogTemplate}
        />
      )}

      {isDeleteOpen && (
        <DeleteTemplateDialog
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setActiveDialogTemplate(null);
          }}
          template={activeDialogTemplate}
        />
      )}
    </div>
  );
}
