import React from 'react';
import Link from 'next/link';
import { Calendar, Layers, Shield } from 'lucide-react';
import type { AssessmentTemplate } from '../schemas/template';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { VersionBadge } from './VersionBadge';

interface TemplateCardProps {
  template: AssessmentTemplate & { domain_count?: number };
}

export function TemplateCard({ template }: TemplateCardProps) {
  const formattedDate = new Date(template.updated_at).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="relative group rounded-2xl border border-surface-800 bg-surface-900/40 p-5 shadow-card hover:shadow-glow-sm hover:border-brand-500/50 hover:bg-surface-900/60 transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-800 border border-surface-700 text-slate-300 group-hover:bg-brand-500/10 group-hover:border-brand-500/20 group-hover:text-brand-400 transition-colors">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-semibold tracking-wider uppercase">
                {template.framework}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <VersionBadge version={template.version} />
            <StatusBadge status={template.status} />
          </div>
        </div>

        {/* Info */}
        <Link href={`/assessments/templates/${template.id}`} className="block focus:outline-none">
          <h3 className="font-display text-base font-bold text-white group-hover:text-brand-400 transition-colors mb-2 line-clamp-1">
            {template.name}
          </h3>
          <p className="text-sm text-slate-400 line-clamp-2 mb-4 h-10">
            {template.description || <span className="text-slate-600 italic">No description provided.</span>}
          </p>
        </Link>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-surface-800/60 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Layers className="h-4 w-4 text-slate-400" />
          <span>{template.domain_count ?? 0} Domains</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
