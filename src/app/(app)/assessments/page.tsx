import type { Metadata } from 'next';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { ClipboardList } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Assessments',
  description: 'Run and manage compliance assessments.',
};

export default function AssessmentsPage() {
  return (
    <div className="flex-1 px-6 py-8 lg:px-10 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Assessments"
        description="Run compliance and security assessments across your organization."
      />
      <EmptyState
        icon={ClipboardList}
        title="Assessments coming soon"
        description="In the next sprint, you'll be able to run GDPR, ISO 27001, and custom compliance assessments across your departments."
      />
    </div>
  );
}
