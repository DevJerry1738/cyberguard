import type { Metadata } from 'next';
import { getOrganization, getMembers } from '@/features/organizations/actions/data';
import { getDepartments } from '@/features/departments/actions/departments';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Building2, Globe, Clock, Users, LayoutGrid, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Organization',
  description: 'View your organization details and settings.',
};

export default async function OrganizationPage() {
  const [org, members, departments] = await Promise.all([
    getOrganization(),
    getMembers(),
    getDepartments(),
  ]);

  const settings = org?.settings ?? null;

  const createdDate = org?.created_at
    ? new Date(org.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="flex-1 px-6 py-8 lg:px-10 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Organization"
        description="Your organization profile and configuration."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-4">
          {/* Name / Slug card */}
          <div className="rounded-2xl border border-surface-800/60 bg-surface-900/80 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15 border border-brand-500/25">
                <Building2 className="h-6 w-6 text-brand-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-display">{org?.name ?? '—'}</h2>
                <p className="text-sm text-slate-400 font-mono">slug: {org?.slug ?? '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoRow icon={Globe} label="Industry" value={settings?.industry ?? '—'} />
              <InfoRow icon={Users} label="Company Size" value={settings?.company_size ?? '—'} />
              <InfoRow icon={Globe} label="Country" value={settings?.country ?? '—'} />
              <InfoRow icon={Clock} label="Timezone" value={settings?.timezone ?? '—'} />
              <InfoRow icon={Calendar} label="Created" value={createdDate} />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            <MiniStat value={String(members.length)} label="Members" icon={Users} />
            <MiniStat value={String(departments.length)} label="Departments" icon={LayoutGrid} />
            <MiniStat value="0" label="Assessments" icon={Building2} note="Coming soon" />
          </div>
        </div>

        {/* Side info */}
        <div className="rounded-2xl border border-surface-800/60 bg-surface-900/80 p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Quick Info</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Organization ID</p>
              <p className="text-slate-300 font-mono text-xs mt-1 break-all">{org?.id ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Plan</p>
              <p className="text-slate-300 mt-1">Free Tier</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Compliance Status</p>
              <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/25">
                Not assessed
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-800/30 border border-surface-700/30">
      <Icon className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-sm text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function MiniStat({
  value,
  label,
  icon: Icon,
  note,
}: {
  value: string;
  label: string;
  icon: React.ElementType;
  note?: string;
}) {
  return (
    <div className="rounded-2xl border border-surface-800/60 bg-surface-900/80 p-4 text-center">
      <div className="flex justify-center mb-2">
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <p className="text-2xl font-bold text-white font-display">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{note ?? label}</p>
    </div>
  );
}
