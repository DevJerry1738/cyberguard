'use client';

import React, { useState } from 'react';
import { Shield, Menu, X } from 'lucide-react';
import { SidebarNav } from './SidebarNav';
import { signOutAction } from '@/features/auth/actions/auth';
import { LogOut } from 'lucide-react';

interface MobileSidebarProps {
  role?: string | null;
}

export function MobileSidebar({ role }: MobileSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Hamburger button */}
      <button
        id="mobile-menu-toggle"
        onClick={() => setOpen(true)}
        className="lg:hidden flex items-center justify-center h-9 w-9 rounded-xl hover:bg-surface-800/60 transition-all"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5 text-slate-400" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-surface-900 border-r border-surface-800/60 flex flex-col transition-transform duration-300 lg:hidden ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-surface-800/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold text-white">
              Cyber<span className="text-brand-400">Guard</span>
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex items-center justify-center h-8 w-8 rounded-xl hover:bg-surface-800/60 transition-all"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>

        {/* Nav */}
        <div onClick={() => setOpen(false)}>
          <SidebarNav role={role} />
        </div>

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
    </>
  );
}
