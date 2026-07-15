import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { getAssessmentRuntime, getAssessmentResponses } from '@/features/assessments/actions/runtime';
import { ReviewPanel } from '@/features/assessments/components/ReviewPanel';

export const metadata: Metadata = {
  title: 'Assessment Review',
  description: 'Review answers before submitting the assessment.',
};

interface AssessmentReviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function AssessmentReviewPage({ params }: AssessmentReviewPageProps) {
  const resolvedParams = await params;
  const runtime = await getAssessmentRuntime(resolvedParams.id);

  if (!runtime) {
    notFound();
  }

  const responses = await getAssessmentResponses(resolvedParams.id);

  return (
    <div className="flex-1 px-6 py-8 lg:px-10 max-w-7xl mx-auto w-full space-y-6">
      <PageHeader
        title={`${runtime.session.template_name} • Review`}
        description="Validate the assessment responses before final submission."
      >
        <StatusBadge status={runtime.session.status} />
      </PageHeader>

      <ReviewPanel groups={runtime.groups} responses={responses} onJumpToQuestion={() => undefined} />

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/assessments/sessions/${resolvedParams.id}/wizard`}
          className="rounded-lg border border-surface-700 bg-surface-950/40 px-4 py-2 text-sm text-white"
        >
          Back to wizard
        </Link>
        <Link
          href={`/assessments/sessions/${resolvedParams.id}/complete`}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Submit assessment
        </Link>
      </div>
    </div>
  );
}
