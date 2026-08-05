import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { createAdminClient, createClient } from '@/lib/supabase/server';
import { getAssessmentRuntime, getAssessmentResponses } from '@/features/assessments/actions/runtime';
import type { AssessmentRuntime } from '@/features/assessments/actions/runtime';
import type { AssessmentSession } from '@/features/assessments/schemas/session';
import { AssessmentWizard } from '@/features/assessments/components/AssessmentWizard';
import { AssignUsersDialog } from '@/features/assessments/components/AssignUsersDialog';
import { getMembers } from '@/features/organizations/actions/data';

export const metadata: Metadata = {
  title: 'Assessment Wizard',
  description: 'Complete a live assessment session from the session snapshot.',
};

interface AssessmentWizardPageProps {
  params: Promise<{ id: string }>;
}

function normalizeSnapshot(snapshot: Record<string, unknown> | null | undefined) {
  const rawDomains = Array.isArray(snapshot?.domains) ? snapshot.domains : [];
  const rawQuestions = Array.isArray(snapshot?.questions) ? snapshot.questions : [];

  const domains = (rawDomains as Array<Record<string, unknown>>)
    .map(domain => ({
      domain_id: String(domain.domain_id ?? ''),
      domain_name: String(domain.domain_name ?? 'Unknown Domain'),
      sort_order: Number(domain.sort_order ?? 0),
    }))
    .filter(domain => domain.domain_id)
    .sort((a, b) => a.sort_order - b.sort_order);

  const questions = (rawQuestions as Array<Record<string, unknown>>)
    .map(question => ({
      ...(question as Record<string, unknown>),
      options: Array.isArray(question.options) ? [...question.options] : [],
    }))
    .sort((a, b) => (Number((a as Record<string, unknown>).sort_order) || 0) - (Number((b as Record<string, unknown>).sort_order) || 0));

  return {
    id: String(snapshot?.id ?? ''),
    name: String(snapshot?.name ?? ''),
    version: String(snapshot?.version ?? ''),
    framework: String(snapshot?.framework ?? ''),
    domains,
    questions,
  };
}

function buildGroups(snapshot: ReturnType<typeof normalizeSnapshot>): Array<{ domain_id: string; domain_name: string; questions: Array<Record<string, unknown>> }> {
  return snapshot.domains.map(domain => ({
    domain_id: domain.domain_id,
    domain_name: domain.domain_name,
    questions: snapshot.questions.filter(question => (question as Record<string, unknown>).domain_id === domain.domain_id),
  }));
}

async function loadRuntimeFallback(sessionId: string): Promise<AssessmentRuntime | null> {
  const supabase = await createClient();
  const { data: session, error } = await supabase
    .from('assessment_sessions')
    .select('id, organization_id, status, metadata, template_id, template_name, template_version, template_framework, template_snapshot, started_by, progress_percent, started_at, completed_at, due_at, created_at, updated_at, deleted_at, deleted_by')
    .eq('id', sessionId)
    .is('deleted_at', null)
    .maybeSingle();

  let resolvedSession = session as AssessmentSession | null;

  if (!resolvedSession || error) {
    const adminSupabase = createAdminClient();
    if (adminSupabase) {
      const { data: adminSession } = await adminSupabase
        .from('assessment_sessions')
        .select('id, organization_id, status, metadata, template_id, template_name, template_version, template_framework, template_snapshot, started_by, progress_percent, started_at, completed_at, due_at, created_at, updated_at, deleted_at, deleted_by')
        .eq('id', sessionId)
        .is('deleted_at', null)
        .maybeSingle();

      resolvedSession = adminSession as AssessmentSession | null;
    }
  }

  if (!resolvedSession) {
    return null;
  }

  const snapshot = normalizeSnapshot((resolvedSession.template_snapshot as Record<string, unknown>) ?? null);
  const groups = buildGroups(snapshot) as unknown as AssessmentRuntime['groups'];

  return {
    session: resolvedSession,
    snapshot: {
      id: snapshot.id,
      name: snapshot.name,
      version: snapshot.version,
      framework: snapshot.framework,
      domains: snapshot.domains,
      questions: snapshot.questions as unknown as AssessmentRuntime['snapshot']['questions'],
    },
    groups,
  };
}

export default async function AssessmentWizardPage({ params }: AssessmentWizardPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const resolvedParams = await params;
  const responsePromise = getAssessmentResponses(resolvedParams.id);
  const runtimeFromPrimary = await getAssessmentRuntime(resolvedParams.id);
  const runtime = runtimeFromPrimary ?? (await loadRuntimeFallback(resolvedParams.id));
  console.log('[wizard page] runtimeFromPrimary', runtimeFromPrimary ? 'ok' : 'null');
  console.log('[wizard page] runtimeFromFallback', runtime ? 'ok' : 'null');
  const responses = await responsePromise;

  let userRole = 'Employee';
  let canManage = false;

  if (runtime) {
    const { data: membership } = await supabase
      .from('organization_members')
      .select('roles(name)')
      .eq('profile_id', user.id)
      .eq('organization_id', runtime.session.organization_id)
      .maybeSingle();

    userRole = (membership?.roles as { name?: string } | null)?.name || 'Employee';
    canManage = ['Owner', 'Admin', 'Security Officer'].includes(userRole);
  }

  const members = canManage && runtime ? await getMembers() : [];
  const sessionHref = runtime
    ? `/assessments/sessions/${runtime.session.id}`
    : `/assessments/sessions/${resolvedParams.id}`;

  return (
    <div className="flex-1 px-6 py-8 lg:px-10 max-w-7xl mx-auto w-full space-y-6">
      <PageHeader
        title={runtime?.session.template_name ?? 'Assessment session'}
        description={
          runtime
            ? `${runtime.session.template_framework} • Version ${runtime.session.template_version}`
            : 'The session is loading or could not be loaded yet.'
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          {canManage && runtime && <AssignUsersDialog sessionId={runtime.session.id} members={members} />}
          <Link
            href={sessionHref}
            className="inline-flex items-center rounded-xl border border-surface-700 bg-surface-900 px-3 py-2 text-sm font-medium text-slate-200 hover:border-brand-500 hover:text-white transition-colors"
          >
            Session Details
          </Link>
          {runtime && <StatusBadge status={runtime.session.status} />}
        </div>
      </PageHeader>

      {!runtime ? (
        <div className="rounded-2xl border border-surface-800 bg-surface-900/40 p-6 text-slate-300">
          <h2 className="text-lg font-semibold text-white">Unable to load this assessment session</h2>
          <p className="mt-2 text-sm text-slate-400">
            The session may still be initializing. Please refresh and try again.
          </p>
        </div>
      ) : (
        <AssessmentWizard runtime={runtime} initialResponses={responses} userRole={userRole} />
      )}
    </div>
  );
}
