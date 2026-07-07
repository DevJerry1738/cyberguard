'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { signOutAction } from '@/features/auth/actions/auth';

interface UserDropdownProps {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export function UserDropdown({ firstName, lastName, email, role }: UserDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || email.charAt(0).toUpperCase();
  const displayName = firstName && lastName ? `${firstName} ${lastName}` : email;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        id="user-dropdown-trigger"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-surface-800/60 transition-all group"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="h-8 w-8 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-brand-400">{initials}</span>
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-white leading-none">{displayName}</p>
          <p className="text-xs text-slate-500 mt-0.5">{role}</p>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-500 transition-transform ${open ? 'rotate-180' : ''} hidden md:block`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-surface-800/80 bg-surface-900/95 backdrop-blur-md shadow-xl z-50 overflow-hidden animate-fade-in"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-surface-800/60">
            <p className="text-sm font-medium text-white truncate">{displayName}</p>
            <p className="text-xs text-slate-500 truncate">{email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1.5">
            <Link
              href="/profile"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-surface-800/60 transition-colors"
            >
              <User className="h-4 w-4 text-slate-500" />
              My Profile
            </Link>
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-surface-800/60 transition-colors"
            >
              <Settings className="h-4 w-4 text-slate-500" />
              Settings
            </Link>
          </div>

          {/* Sign out */}
          <div className="py-1.5 border-t border-surface-800/60">
            <form action={signOutAction}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
