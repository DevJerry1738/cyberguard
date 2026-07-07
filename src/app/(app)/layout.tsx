import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Shield, Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { SidebarNav } from '@/components/dashboard/SidebarNav';
import { MobileSidebar } from '@/components/dashboard/MobileSidebar';
import { UserDropdown } from '@/components/dashboard/UserDropdown';
import { signOutAction } from '@/features/auth/actions/auth';
import { LogOut } from 'lucide-react';

export const metadata: Metadata = {
  title: { default: 'Dashboard', template: '%s | CyberGuard' },
  description: 'CyberGuard compliance and security risk management platform.',
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  // Fetch profile + role for the shell
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, organization_id')
    .eq('id', user.id)
    .single();

  const { data: org } = profile?.organization_id
    ? await supabase
        .from('organizations')
        .select('name')
        .eq('id', profile.organization_id)
        .single()
    : { data: null };

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

  const firstName = profile?.first_name ?? '';
  const lastName = profile?.last_name ?? '';
  const email = profile?.email ?? user.email ?? '';
  const orgName = org?.name ?? 'Your Organization';

  return (
    <div className="flex min-h-screen bg-surface-950">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-surface-900 border-r border-surface-800/60 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-6 py-5 border-b border-surface-800/60">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 shadow-glow-sm group-hover:shadow-glow-md transition-shadow">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-white">
              Cyber<span className="text-brand-400">Guard</span>
            </span>
          </Link>
        </div>

        {/* Org name */}
        <div className="px-6 py-3 border-b border-surface-800/60">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Organization</p>
          <p className="text-sm text-white font-medium mt-0.5 truncate">{orgName}</p>
        </div>

        {/* Navigation */}
        <SidebarNav role={userRole} />

        {/* Sign out */}
        <div className="px-3 py-4 border-t border-surface-800/60">
          <form action={signOutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main Column ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ── Topbar ── */}
        <header className="sticky top-0 z-30 flex items-center gap-4 px-4 lg:px-6 h-16 bg-surface-950/90 backdrop-blur-md border-b border-surface-800/60 flex-shrink-0">
          {/* Mobile hamburger */}
          <MobileSidebar role={userRole} />

          {/* Mobile logo */}
          <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500">
              <Shield className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-display text-base font-bold text-white">
              Cyber<span className="text-brand-400">Guard</span>
            </span>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Notification bell */}
          <button
            id="notifications-btn"
            className="flex items-center justify-center h-9 w-9 rounded-xl hover:bg-surface-800/60 transition-all relative"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5 text-slate-400" />
            {/* Future: notification dot */}
          </button>

          {/* User dropdown */}
          <UserDropdown
            firstName={firstName}
            lastName={lastName}
            email={email}
            role={userRole}
          />
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 flex flex-col min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
