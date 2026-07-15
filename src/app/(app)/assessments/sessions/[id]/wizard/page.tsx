import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { getAssessmentRuntime, getAssessmentResponses } from '@/features/assessments/actions/runtime';
import { AssessmentWizard } from '@/features/assessments/components/AssessmentWizard';

export const metadata: Metadata = {
  title: 'Assessment Wizard',
  description: 'Complete a live assessment session from the session snapshot.',
};

interface AssessmentWizardPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssessmentWizardPage({ params }: AssessmentWizardPageProps) {
  const resolvedParams = await params;
  const runtime = await getAssessmentRuntime(resolvedParams.id);

  if (!runtime) {
    notFound();
  }

  const responses = await getAssessmentResponses(resolvedParams.id);

  return (
    <div className="flex-1 px-6 py-8 lg:px-10 max-w-7xl mx-auto w-full space-y-6">
      <PageHeader
        title={runtime.session.template_name}
        description={`${runtime.session.template_framework} • Version ${runtime.session.template_version}`}
      >
        <StatusBadge status={runtime.session.status} />
      </PageHeader>

      <AssessmentWizard runtime={runtime} initialResponses={responses} />
    </div>
  );
}
