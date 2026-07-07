'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import type { Department } from '@/types/departments';
import { DepartmentTable } from './DepartmentTable';

interface DepartmentTableListProps {
  active: Department[];
  all: Department[];
  members: any[];
  userRole: string;
}

export function DepartmentTableList({ active, all, members, userRole }: DepartmentTableListProps) {
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const list = showArchived ? all : active;

  const filtered = list.filter(d => {
    const matchName = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDesc = d.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
    const managerName = d.manager
      ? `${d.manager.first_name ?? ''} ${d.manager.last_name ?? ''}`.toLowerCase()
      : '';
    const matchManager = managerName.includes(searchQuery.toLowerCase());

    return matchName || matchDesc || matchManager;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:border-emerald-500/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowArchived(false)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
              !showArchived
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setShowArchived(true)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
              showArchived
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            All (incl. Archived)
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/20">
          <p className="text-zinc-400">No departments match your query.</p>
        </div>
      ) : (
        <DepartmentTable departments={filtered} members={members} userRole={userRole} />
      )}
    </div>
  );
}
