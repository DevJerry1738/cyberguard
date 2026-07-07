import type { Metadata } from 'next';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Shield, Bell, Palette, Key, Globe, Users, ChevronRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Manage your CyberGuard workspace settings.',
};

const SETTING_GROUPS = [
  {
    group: 'Security',
    icon: Shield,
    color: 'text-brand-400',
    bg: 'bg-brand-500/10',
    border: 'border-brand-500/20',
    items: [
      { label: 'Two-Factor Authentication', description: 'Add an extra layer of security to your account', available: false },
      { label: 'Session Management', description: 'Manage active sessions and access tokens', available: false },
      { label: 'Audit Log Export', description: "Download your organization's full audit trail", available: false },
    ],
  },
  {
    group: 'Notifications',
    icon: Bell,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    items: [
      { label: 'Email Alerts', description: 'Get notified about compliance events by email', available: false },
      { label: 'In-App Notifications', description: 'Manage notification preferences in the app', available: false },
    ],
  },
  {
    group: 'Organization',
    icon: Globe,
    color: 'text-accent-400',
    bg: 'bg-accent-500/10',
    border: 'border-accent-500/20',
    items: [
      { label: 'Organization Profile', description: 'Update your organization name and details', available: false },
      { label: 'Compliance Frameworks', description: 'Select the compliance standards your org follows', available: false },
      { label: 'Data Retention', description: 'Configure how long your data is retained', available: false },
    ],
  },
  {
    group: 'Access & Roles',
    icon: Users,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    items: [
      { label: 'Role Permissions', description: 'Customize what each role can see and do', available: false },
      { label: 'API Keys', description: 'Manage API access for integrations', available: false },
    ],
  },
  {
    group: 'Appearance',
    icon: Palette,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    items: [
      { label: 'Theme', description: 'Switch between dark and light mode', available: false },
      { label: 'Density', description: 'Choose compact or comfortable layout', available: false },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="flex-1 px-6 py-8 lg:px-10 max-w-4xl mx-auto w-full">
      <PageHeader
        title="Settings"
        description="Configure your workspace, security, and preferences."
      />

      <div className="space-y-6">
        {SETTING_GROUPS.map(({ group, icon: Icon, color, bg, border, items }) => (
          <div key={group} className="rounded-2xl border border-surface-800/60 bg-surface-900/80 overflow-hidden">
            {/* Group header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-surface-800/60">
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${bg} border ${border}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <h2 className="text-sm font-semibold text-white">{group}</h2>
            </div>

            {/* Settings rows */}
            <ul className="divide-y divide-surface-800/40">
              {items.map(({ label, description, available }) => (
                <li key={label}>
                  <div className="flex items-center justify-between px-6 py-4 hover:bg-surface-800/20 transition-colors group cursor-not-allowed opacity-60">
                    <div>
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {!available && (
                        <span className="text-xs text-slate-500 bg-surface-800/60 border border-surface-700/60 px-2.5 py-1 rounded-full">
                          Coming soon
                        </span>
                      )}
                      <ChevronRight className="h-4 w-4 text-slate-600 flex-shrink-0" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
