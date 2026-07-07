import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { RoleBadge } from '@/components/dashboard/RoleBadge';
import EditProfileForm from '@/features/profile/components/EditProfileForm';
import { Mail, Calendar, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'My Profile',
  description: 'View and edit your personal profile.',
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, first_name, last_name, email, job_title, phone, organization_id')
    .eq('id', user.id)
    .single();

  let userRole = 'Member';
  if (profile?.organization_id) {
    const { data: membership } = await supabase
      .from('organization_members')
      .select('roles(name)')
      .eq('profile_id', user.id)
      .eq('organization_id', profile.organization_id)
      .single();
    if (membership?.roles && typeof membership.roles === 'object' && 'name' in membership.roles) {
      userRole = membership.roles.name as string;
    }
  }

  const initials = `${(profile?.first_name ?? '').charAt(0)}${(profile?.last_name ?? '').charAt(0)}`.toUpperCase()
    || (profile?.email ?? user.email ?? 'U').charAt(0).toUpperCase();

  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '—';

  return (
    <div className="flex-1 px-6 py-8 lg:px-10 max-w-4xl mx-auto w-full">
      <PageHeader
        title="My Profile"
        description="Manage your personal information and preferences."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="rounded-2xl border border-surface-800/60 bg-surface-900/80 p-6 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-3xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-brand-400 font-display">{initials}</span>
          </div>
          <h2 className="font-display text-lg font-bold text-white">
            {profile?.first_name && profile?.last_name
              ? `${profile.first_name} ${profile.last_name}`
              : profile?.email ?? user.email}
          </h2>
          <p className="text-sm text-slate-400 mt-1">{profile?.job_title ?? 'No title set'}</p>
          <div className="mt-3">
            <RoleBadge role={userRole} />
          </div>

          <div className="mt-6 w-full space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Mail className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{profile?.email ?? user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Joined {joinDate}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Email verified</span>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <div className="lg:col-span-2 rounded-2xl border border-surface-800/60 bg-surface-900/80 p-6">
          <h3 className="text-sm font-semibold text-white mb-6">Personal Information</h3>
          <EditProfileForm
            userId={user.id}
            defaultValues={{
              firstName: profile?.first_name ?? '',
              lastName: profile?.last_name ?? '',
              jobTitle: profile?.job_title ?? '',
              phone: profile?.phone ?? '',
            }}
          />
        </div>
      </div>
    </div>
  );
}
