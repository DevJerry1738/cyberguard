import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { getAssessmentSession } from '@/features/assessments/actions/sessions';
import { getMembers } from '@/features/organizations/actions/data';
import { AssignUsersDialog } from '@/features/assessments/components/AssignUsersDialog';

export const metadata: Metadata = {
  title: 'Assessment Session',
  description: 'Review the live assessment session and assignment status.',
};

interface SessionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const resolvedParams = await params;
  const sessionData = await getAssessmentSession(resolvedParams.id);
  if (!sessionData) notFound();

  redirect(`/assessments/sessions/${resolvedParams.id}/wizard`);

  return null;
}
