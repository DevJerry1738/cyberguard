import type { Metadata } from 'next';
import Link from 'next/link';
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

  const { data: membership } = await supabase
    .from('organization_members')
    .select('roles(name)')
    .eq('profile_id', user.id)
    .eq('organization_id', sessionData.session.organization_id)
    .single();

  const userRole = (membership?.roles as { name?: string } | null)?.name || 'Employee';
  const canManage = ['Owner', 'Admin', 'Security Officer'].includes(userRole);

  const members = await getMembers();
  const { session, assignments } = sessionData;
  const memberEmailLookup = new Map(
    members.map(member => [member.profile_id, member.profiles?.email ?? 'Unknown user'])
  );

  return (
    <div className="flex-1 px-6 py-8 lg:px-10 max-w-7xl mx-auto w-full space-y-6">
      <PageHeader
        title={session.template_name}
        description={`${session.template_framework} • Version ${session.template_version}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          {canManage && <AssignUsersDialog sessionId={session.id} members={members} />}
          <Link
            href={`/assessments/sessions/${session.id}/wizard`}
            className="inline-flex items-center rounded-xl border border-surface-700 bg-surface-900 px-3 py-2 text-sm font-medium text-slate-200 hover:border-brand-500 hover:text-white transition-colors"
          >
            Open Wizard
          </Link>
          <StatusBadge status={session.status} />
        </div>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-surface-800 bg-surface-900/40 p-5">
          <h2 className="text-lg font-semibold text-white">Session overview</h2>
          <dl className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Started by</dt>
              <dd className="font-medium text-white">{session.started_by || 'System'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Progress</dt>
              <dd className="font-medium text-white">{session.progress_percent}%</dd>
            </div>
            <div>
              <dt className="text-slate-500">Started at</dt>
              <dd className="font-medium text-white">
                {session.started_at ? new Date(session.started_at).toLocaleString() : 'Not started'}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Completed at</dt>
              <dd className="font-medium text-white">
                {session.completed_at ? new Date(session.completed_at).toLocaleString() : 'In progress'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-surface-800 bg-surface-900/40 p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">Assignments</h2>
            {canManage && <AssignUsersDialog sessionId={session.id} members={members} />}
          </div>
          {assignments.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">No users have been assigned to this session yet.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {assignments.map(assignment => (
                <li key={assignment.id} className="rounded-xl border border-surface-800 bg-surface-950/40 px-3 py-2">
                  {memberEmailLookup.get(assignment.profile_id) ?? assignment.profile_id} • {assignment.status}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
