import React from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight, Copy, Eye, Trash2 } from 'lucide-react';
import type { AssessmentTemplate } from '../schemas/template';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { VersionBadge } from './VersionBadge';

interface TemplateTableProps {
  templates: Array<AssessmentTemplate & { domain_count?: number }>;
  userRole: string;
  onDuplicate: (template: AssessmentTemplate) => void;
  onDelete: (template: AssessmentTemplate) => void;
}

export function TemplateTable({ templates, userRole, onDuplicate, onDelete }: TemplateTableProps) {
  const isOwner = userRole === 'Owner';
  const canManage = ['Owner', 'Admin', 'Security Officer'].includes(userRole);

  return (
    <div className="overflow-x-auto rounded-xl border border-surface-800 bg-surface-950/40">
      <table className="min-w-full divide-y divide-surface-800 text-left text-sm">
        <thead className="bg-surface-900/50 text-slate-400 font-medium">
          <tr>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Framework</th>
            <th className="px-6 py-4">Version</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4 text-center">Domains</th>
            <th className="px-6 py-4">Last Updated</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-850/60 text-slate-300">
          {templates.map(template => (
            <tr key={template.id} className="hover:bg-surface-900/20 transition-all group">
              <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">
                <Link
                  href={`/assessments/templates/${template.id}`}
                  className="hover:text-brand-400 transition-colors"
                >
                  {template.name}
                </Link>
              </td>
              <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                {template.framework}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <VersionBadge version={template.version} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={template.status} />
              </td>
              <td className="px-6 py-4 text-center text-slate-400 whitespace-nowrap font-medium">
                {template.domain_count ?? 0}
              </td>
              <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  {new Date(template.updated_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </td>
              <td className="px-6 py-4 text-right whitespace-nowrap">
                <div className="inline-flex items-center gap-2">
                  <Link
                    href={`/assessments/templates/${template.id}`}
                    title="View Template"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-surface-800 hover:text-white transition-all"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  {canManage && (
                    <button
                      onClick={() => onDuplicate(template)}
                      title="Duplicate & Version"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-surface-800 hover:text-white transition-all"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  )}
                  {isOwner && (
                    <button
                      onClick={() => onDelete(template)}
                      title="Delete Template"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-950 hover:text-rose-400 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                  <Link
                    href={`/assessments/templates/${template.id}`}
                    className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all pl-1"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
