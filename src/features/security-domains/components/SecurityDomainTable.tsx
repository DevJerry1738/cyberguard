'use client';

import React from 'react';
import { Edit2, Archive, Trash2, GripVertical, Calendar } from 'lucide-react';
import type { SecurityDomain } from '@/features/security-domains/schemas/security-domain';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { EditDomainModal } from './EditDomainModal';
import { ArchiveDialog } from './ArchiveDialog';
import { DeleteDialog } from './DeleteDialog';

interface SecurityDomainTableProps {
  domains: SecurityDomain[];
  userRole: string;
  onReorder?: (items: Array<{ id: string; sort_order: number }>) => void;
}

export function SecurityDomainTable({ domains, userRole, onReorder }: SecurityDomainTableProps) {
  const [selectedDomain, setSelectedDomain] = React.useState<SecurityDomain | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [draggedItem, setDraggedItem] = React.useState<string | null>(null);
  const [localDomains, setLocalDomains] = React.useState(domains);

  React.useEffect(() => {
    setLocalDomains(domains);
  }, [domains]);

  const canManage = ['Owner', 'Admin'].includes(userRole);
  const canReorder = ['Owner', 'Admin', 'Security Officer'].includes(userRole);
  const isOwner = userRole === 'Owner';

  const handleEdit = (domain: SecurityDomain) => {
    setSelectedDomain(domain);
    setIsEditOpen(true);
  };

  const handleArchive = (domain: SecurityDomain) => {
    setSelectedDomain(domain);
    setIsArchiveOpen(true);
  };

  const handleDelete = (domain: SecurityDomain) => {
    setSelectedDomain(domain);
    setIsDeleteOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!canReorder) return;
    setDraggedItem(localDomains[index].id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedItem || !canReorder) return;

    const draggedIndex = localDomains.findIndex(d => d.id === draggedItem);
    if (draggedIndex === targetIndex) return;

    const newDomains = [...localDomains];
    const [moved] = newDomains.splice(draggedIndex, 1);
    newDomains.splice(targetIndex, 0, moved);

    // Update sort_order
    const reorderedItems = newDomains.map((domain, idx) => ({
      id: domain.id,
      sort_order: idx,
    }));

    setLocalDomains(newDomains);
    setDraggedItem(null);

    // Call the reorder action
    if (onReorder) {
      onReorder(reorderedItems);
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/40">
      <table className="min-w-full divide-y divide-zinc-850 text-left text-sm">
        <thead className="bg-zinc-900/50 text-zinc-400 font-medium">
          <tr>
            {canReorder && <th className="px-4 py-4 w-8" />}
            <th className="px-6 py-4">Domain Name</th>
            <th className="px-6 py-4">Description</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Created Date</th>
            {canManage && <th className="px-6 py-4 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-850/60 text-zinc-300">
          {localDomains.map((domain, index) => (
            <tr
              key={domain.id}
              className="hover:bg-zinc-900/20 transition-all"
              draggable={canReorder}
              onDragStart={e => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, index)}
            >
              {canReorder && (
                <td className="px-4 py-4 text-zinc-500 hover:text-zinc-400 cursor-move transition-colors">
                  <GripVertical className="h-4 w-4" />
                </td>
              )}
              <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">
                {domain.name}
              </td>
              <td className="px-6 py-4 max-w-xs truncate text-zinc-400">
                {domain.description || <span className="text-zinc-600 italic">No description</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={domain.is_archived ? 'archived' : 'active'} />
              </td>
              <td className="px-6 py-4 text-zinc-400 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(domain.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              </td>
              {canManage && (
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(domain)}
                      title="Edit Domain"
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleArchive(domain)}
                      title={domain.is_archived ? 'Restore Domain' : 'Archive Domain'}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                    {isOwner && (
                      <button
                        onClick={() => handleDelete(domain)}
                        title="Delete Domain"
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-950 hover:text-red-400 transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedDomain && isEditOpen && (
        <EditDomainModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedDomain(null);
          }}
          domain={selectedDomain}
        />
      )}

      {selectedDomain && isArchiveOpen && (
        <ArchiveDialog
          isOpen={isArchiveOpen}
          onClose={() => {
            setIsArchiveOpen(false);
            setSelectedDomain(null);
          }}
          domainId={selectedDomain.id}
          domainName={selectedDomain.name}
          isArchived={selectedDomain.is_archived}
        />
      )}

      {selectedDomain && isDeleteOpen && (
        <DeleteDialog
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setSelectedDomain(null);
          }}
          domainId={selectedDomain.id}
          domainName={selectedDomain.name}
        />
      )}
    </div>
  );
}
