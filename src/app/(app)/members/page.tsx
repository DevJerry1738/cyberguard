import type { Metadata } from 'next';
import { getMembers } from '@/features/organizations/actions/data';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { RoleBadge } from '@/components/dashboard/RoleBadge';
import Link from 'next/link';
import { Users, Mail, Briefcase, Calendar, UserPlus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Team Members',
  description: "Manage your organization's team members.",
};

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <div className="flex-1 px-6 py-8 lg:px-10 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Team Members"
        description={`${members.length} member${members.length !== 1 ? 's' : ''} in your organization`}
      >
        <Link
          id="invite-member-btn"
          href="/invitations"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-all shadow-glow-sm"
        >
          <UserPlus className="h-4 w-4" />
          Invite Member
        </Link>
      </PageHeader>

      {members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team members yet"
          description="Your organization has no members. Invite your security team to collaborate."
        />
      ) : (
        <div className="rounded-2xl border border-surface-800/60 bg-surface-900/80 overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-surface-800/40 border-b border-surface-800/60 text-xs font-medium text-slate-500 uppercase tracking-wide">
            <div className="col-span-4">Member</div>
            <div className="col-span-3 hidden sm:block">Job Title</div>
            <div className="col-span-2 hidden md:block">Role</div>
            <div className="col-span-3">Email</div>
          </div>

          {/* Rows */}
          <ul className="divide-y divide-surface-800/60">
            {members.map((member) => {
              const p = member.profiles;
              const fullName = p
                ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || p.email
                : 'Unknown';
              const initials = p
                ? `${(p.first_name ?? '').charAt(0)}${(p.last_name ?? '').charAt(0)}`.toUpperCase() || p.email.charAt(0).toUpperCase()
                : '?';
              const roleName = member.roles?.name ?? 'Employee';
              const joinDate = new Date(member.joined_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <li
                  key={member.profile_id}
                  className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-surface-800/20 transition-colors"
                >
                  {/* Avatar + Name */}
                  <div className="col-span-4 flex items-center gap-3 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-brand-500/15 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-brand-400">{initials}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">{fullName}</p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        <span>Joined {joinDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* Job title */}
                  <div className="col-span-3 hidden sm:flex items-center gap-2 min-w-0">
                    <Briefcase className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                    <span className="text-sm text-slate-400 truncate">
                      {p?.job_title ?? <span className="text-slate-600 italic">Not set</span>}
                    </span>
                  </div>

                  {/* Role */}
                  <div className="col-span-2 hidden md:block">
                    <RoleBadge role={roleName} />
                  </div>

                  {/* Email */}
                  <div className="col-span-3 flex items-center gap-2 min-w-0">
                    <Mail className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
                    <span className="text-sm text-slate-400 truncate">{p?.email ?? '—'}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
