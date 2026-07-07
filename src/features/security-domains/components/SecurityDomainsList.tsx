'use client';

import React, { useState, useTransition } from 'react';
import { Search } from 'lucide-react';
import type { SecurityDomain } from '@/features/security-domains/schemas/security-domain';
import { SecurityDomainTable } from './SecurityDomainTable';
import { reorderSecurityDomainsAction } from '../actions/security-domains';

interface SecurityDomainsListProps {
  domains: SecurityDomain[];
  userRole: string;
}

export function SecurityDomainsList({ domains, userRole }: SecurityDomainsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [isPending, startTransition] = useTransition();

  const list = showArchived ? domains : domains.filter(d => !d.is_archived);

  const filtered = list.filter(d => {
    const matchName = d.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDesc = d.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false;
    return matchName || matchDesc;
  });

  const handleReorder = (items: Array<{ id: string; sort_order: number }>) => {
    startTransition(async () => {
      await reorderSecurityDomainsAction(items);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search domains..."
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
          <p className="text-zinc-400">
            {searchQuery ? 'No domains match your search.' : 'No domains found.'}
          </p>
        </div>
      ) : (
        <SecurityDomainTable domains={filtered} userRole={userRole} onReorder={handleReorder} />
      )}
    </div>
  );
}
