'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  AlertTriangle,
  FileText,
  Users,
  Building2,
  Settings,
  UserPlus,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import { PERMISSIONS, type Permission } from '@/features/authorization/permissions';
import { roleHasPermission } from '@/features/authorization/roles';

const NAV_ITEMS: {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: Permission;
}[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/departments', label: 'Departments', icon: Building2, permission: PERMISSIONS.DEPARTMENTS_VIEW },
  { href: '/members', label: 'Team', icon: Users, permission: PERMISSIONS.MEMBERS_VIEW },
  { href: '/invitations', label: 'Invitations', icon: UserPlus, permission: PERMISSIONS.MEMBERS_INVITE },
  { href: '/organization', label: 'Organization', icon: ClipboardList, permission: PERMISSIONS.ORGANIZATION_VIEW },
  { href: '/assessments', label: 'Assessments', icon: AlertTriangle, permission: PERMISSIONS.ASSESSMENTS_VIEW },
  { href: '/reports', label: 'Reports', icon: FileText, permission: PERMISSIONS.REPORTS_VIEW },
  { href: '/settings/security-domains', label: 'Security Domains', icon: Shield, permission: PERMISSIONS.SECURITY_DOMAINS_VIEW },
  { href: '/settings', label: 'Settings', icon: Settings, permission: PERMISSIONS.SETTINGS_VIEW },
];

interface SidebarNavProps {
  role?: string | null;
}

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();

  const navItems = NAV_ITEMS.filter((item) => {
    return item.permission ? roleHasPermission(role, item.permission) : true;
  });

  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Main navigation">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
              isActive
                ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                : 'text-slate-400 hover:text-white hover:bg-surface-800/60 border border-transparent'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon
              className={`h-4 w-4 flex-shrink-0 transition-colors ${
                isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'
              }`}
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
