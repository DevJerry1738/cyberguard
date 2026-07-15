import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Assessment Complete',
  description: 'Assessment completed successfully.',
};

interface AssessmentCompletePageProps {
  params: Promise<{ id: string }>;
}

export default async function AssessmentCompletePage({ params }: AssessmentCompletePageProps) {
  const resolvedParams = await params;

  return (
    <div className="flex-1 px-6 py-8 lg:px-10 max-w-4xl mx-auto w-full">
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-300" />
        <h1 className="mt-3 text-2xl font-semibold text-white">Assessment submitted</h1>
        <p className="mt-2 text-sm text-slate-300">
          Session {resolvedParams.id} has been completed and locked for review.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Link href="/assessments" className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white">
            Return to assessments
          </Link>
        </div>
      </div>
    </div>
  );
}
