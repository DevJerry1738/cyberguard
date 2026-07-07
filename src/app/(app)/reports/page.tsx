import type { Metadata } from 'next';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { FileText } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Reports',
  description: 'Generate and export compliance reports.',
};

export default function ReportsPage() {
  return (
    <div className="flex-1 px-6 py-8 lg:px-10 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Reports"
        description="Generate, export, and schedule compliance reports."
      />
      <EmptyState
        icon={FileText}
        title="Reports coming soon"
        description="Once you've run assessments, you'll be able to generate detailed compliance reports and export them as PDF or CSV."
      />
    </div>
  );
}
