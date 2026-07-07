import React from 'react';
import type { AuditLog } from '@/features/organizations/actions/data';
import {
  Shield,
  Building2,
  UserPlus,
  LogIn,
  Settings,
  Activity,
  Trash2,
} from 'lucide-react';

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function getActionMeta(action: string): { label: string; icon: React.ElementType; color: string } {
  const map: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    'onboarding.complete': { label: 'Workspace initialized', icon: Shield, color: 'text-brand-400' },
    'department.create': { label: 'Department created', icon: Building2, color: 'text-accent-400' },
    'department.delete': { label: 'Department deleted', icon: Trash2, color: 'text-rose-400' },
    'member.invite': { label: 'Member invited', icon: UserPlus, color: 'text-violet-400' },
    'auth.sign_in': { label: 'User signed in', icon: LogIn, color: 'text-slate-400' },
    'settings.update': { label: 'Settings updated', icon: Settings, color: 'text-amber-400' },
  };
  return map[action] ?? { label: action, icon: Activity, color: 'text-slate-400' };
}

interface ActivityTimelineProps {
  logs: AuditLog[];
}

export function ActivityTimeline({ logs }: ActivityTimelineProps) {
  if (logs.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-4">No activity recorded yet.</p>
    );
  }

  return (
    <ul className="space-y-3">
      {logs.map((log) => {
        const { label, icon: Icon, color } = getActionMeta(log.action);
        const actor = log.profiles
          ? `${log.profiles.first_name ?? ''} ${log.profiles.last_name ?? ''}`.trim() || log.profiles.email
          : 'System';

        return (
          <li key={log.id} className="flex items-start gap-3">
            <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-surface-800/60 border border-surface-700/40 mt-0.5`}>
              <Icon className={`h-3.5 w-3.5 ${color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-300 leading-snug">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{actor}</p>
            </div>
            <span className="text-xs text-slate-500 flex-shrink-0">{formatRelativeTime(log.created_at)}</span>
          </li>
        );
      })}
    </ul>
  );
}
