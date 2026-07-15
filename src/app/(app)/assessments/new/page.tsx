import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { listAssessmentTemplates } from '@/features/assessments/actions/templates';
import { LaunchSessionButton } from '@/features/assessments/components/LaunchSessionButton';

export const metadata: Metadata = {
  title: 'Launch Assessment',
  description: 'Choose an active template and launch a new assessment session.',
};

export default async function NewAssessmentPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single();

  if (!profile?.organization_id) redirect('/onboarding');

  const { data: membership } = await supabase
    .from('organization_members')
    .select('roles(name)')
    .eq('profile_id', user.id)
    .eq('organization_id', profile.organization_id)
    .single();

  const userRole = (membership?.roles as any)?.name || 'Employee';
  const canLaunch = ['Owner', 'Admin', 'Security Officer'].includes(userRole);
  const templates = await listAssessmentTemplates({ status: 'Active' });

  return (
    <div className="flex-1 px-6 py-8 lg:px-10 max-w-7xl mx-auto w-full space-y-6">
      <PageHeader
        title="Launch Assessment"
        description="Choose a published template to start a live assessment session and assign the participating users."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-surface-700 bg-surface-950/40 p-8 text-sm text-slate-400">
            No active assessment templates are available yet. Activate a template from the templates blueprint page first.
          </div>
        ) : (
          templates.map(template => (
            <div key={template.id} className="rounded-2xl border border-surface-800 bg-surface-900/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold text-white">{template.name}</h2>
                  <p className="text-xs text-slate-400">{template.framework}</p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-semibold text-emerald-400">
                  v{template.version}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-400">{template.description || 'No description provided.'}</p>
              <div className="mt-4">
                <LaunchSessionButton templateId={template.id} templateName={template.name} canLaunch={canLaunch} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
