import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Shield, Users, Building2, TrendingUp, Activity, ArrowRight } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { getRecentAuditLogs } from '@/features/organizations/actions/data';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'CyberGuard compliance and risk assessment dashboard.',
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, organization_id')
    .eq('id', user.id)
    .single();

  let orgId = profile?.organization_id ?? null;
  let memberCount = 1;
  let deptCount = 0;
  let userRole = 'Owner';

  if (orgId) {
    const [membersRes, deptsRes, membershipRes] = await Promise.all([
      supabase.from('organization_members').select('profile_id', { count: 'exact', head: true }).eq('organization_id', orgId),
      supabase.from('departments').select('id', { count: 'exact', head: true }).eq('organization_id', orgId),
      supabase.from('organization_members').select('roles(name)').eq('profile_id', user.id).eq('organization_id', orgId).single(),
    ]);
    memberCount = membersRes.count ?? 1;
    deptCount = deptsRes.count ?? 0;
    if (membershipRes.data?.roles && typeof membershipRes.data.roles === 'object' && 'name' in membershipRes.data.roles) {
      userRole = membershipRes.data.roles.name as string;
    }
  }

  const auditLogs = await getRecentAuditLogs(8);

  const firstName = profile?.first_name ?? user.email?.split('@')[0] ?? 'there';

  const quickActions = [
    { href: '/departments', label: 'Create Department', icon: Building2, description: 'Structure your org into departments' },
    { href: '/members', label: 'Invite Team Members', icon: Users, description: 'Bring your security team onboard' },
    { href: '/assessments', label: 'Start Assessment', icon: Shield, description: 'Run your first compliance assessment', disabled: true },
  ];

  return (
    <div className="flex-1 px-6 py-8 lg:px-10 max-w-7xl mx-auto w-full">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        description="Here's your organization's security overview."
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Team Members"
          value={memberCount}
          icon={Users}
          note={memberCount === 1 ? 'Just you for now' : `${memberCount} members`}
          colorClass="text-brand-400"
          bgClass="bg-brand-500/10"
          borderClass="border-brand-500/20"
        />
        <StatCard
          label="Departments"
          value={deptCount}
          icon={Building2}
          note={deptCount === 0 ? 'Create your first department' : `${deptCount} departments`}
          colorClass="text-accent-400"
          bgClass="bg-accent-500/10"
          borderClass="border-accent-500/20"
        />
        <StatCard
          label="Compliance Score"
          value="–"
          icon={TrendingUp}
          note="Run an assessment first"
          colorClass="text-violet-400"
          bgClass="bg-violet-500/10"
          borderClass="border-violet-500/20"
        />
        <StatCard
          label="Open Risks"
          value="0"
          icon={Activity}
          note="No active risks detected"
          colorClass="text-amber-400"
          bgClass="bg-amber-500/10"
          borderClass="border-amber-500/20"
        />
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Activity */}
        <div className="lg:col-span-2 rounded-2xl border border-surface-800/60 bg-surface-900/80 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Recent Activity</h2>
            <span className="text-xs text-slate-500">{auditLogs.length} events</span>
          </div>
          <ActivityTimeline logs={auditLogs} />
        </div>

        {/* Quick actions */}
        <div className="rounded-2xl border border-surface-800/60 bg-surface-900/80 p-6">
          <h2 className="text-sm font-semibold text-white mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map(({ href, label, icon: Icon, description, disabled }) => (
              disabled ? (
                <div
                  key={label}
                  className="flex items-start gap-3 p-3 rounded-xl border border-surface-700/30 bg-surface-800/20 opacity-50 cursor-not-allowed"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-700/50 flex-shrink-0">
                    <Icon className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-400">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                  </div>
                </div>
              ) : (
                <Link
                  key={label}
                  href={href}
                  className="flex items-start gap-3 p-3 rounded-xl border border-surface-700/30 bg-surface-800/20 hover:border-brand-500/30 hover:bg-brand-500/5 transition-all group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-700/50 group-hover:bg-brand-500/15 flex-shrink-0 transition-colors">
                    <Icon className="h-4 w-4 text-slate-400 group-hover:text-brand-400 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-brand-400 transition-colors flex-shrink-0 mt-1" />
                </Link>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
