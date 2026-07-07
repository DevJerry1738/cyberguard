'use client';

import React from 'react';
import { Eye, Edit2, Archive, Trash2, Shield, Calendar, Building2 } from 'lucide-react';
import type { Department } from '@/types/departments';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { EditDepartmentModal } from './EditDepartmentModal';
import { ArchiveDialog } from './ArchiveDialog';
import { DeleteDialog } from './DeleteDialog';

interface DepartmentTableProps {
  departments: Department[];
  members: any[];
  userRole: string;
}

export function DepartmentTable({ departments, members, userRole }: DepartmentTableProps) {
  const [selectedDept, setSelectedDept] = React.useState<Department | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);

  const canManage = ['Owner', 'Admin'].includes(userRole);
  const isOwner = userRole === 'Owner';

  const handleEdit = (dept: Department) => {
    setSelectedDept(dept);
    setIsEditOpen(true);
  };

  const handleArchive = (dept: Department) => {
    setSelectedDept(dept);
    setIsArchiveOpen(true);
  };

  const handleDelete = (dept: Department) => {
    setSelectedDept(dept);
    setIsDeleteOpen(true);
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/40">
      <table className="min-w-full divide-y divide-zinc-850 text-left text-sm">
        <thead className="bg-zinc-900/50 text-zinc-400 font-medium">
          <tr>
            <th className="px-6 py-4">Department Name</th>
            <th className="px-6 py-4">Description</th>
            <th className="px-6 py-4">Manager</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Created Date</th>
            {canManage && <th className="px-6 py-4 text-right">Actions</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-850/60 text-zinc-300">
          {departments.map((dept) => {
            const managerName = dept.manager
              ? [dept.manager.first_name, dept.manager.last_name].filter(Boolean).join(' ') || dept.manager.email
              : 'Unassigned';

            const createdDate = new Date(dept.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <tr key={dept.id} className="hover:bg-zinc-900/20 transition-all">
                <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-emerald-400/80" />
                    {dept.name}
                  </div>
                </td>
                <td className="px-6 py-4 max-w-xs truncate text-zinc-400">
                  {dept.description || <span className="text-zinc-600 italic">No description</span>}
                </td>
                <td className="px-6 py-4 text-zinc-300">
                  {dept.manager ? (
                    <div>
                      <div className="font-medium text-white">{managerName}</div>
                      <div className="text-xs text-zinc-500">{dept.manager.email}</div>
                    </div>
                  ) : (
                    <span className="text-zinc-500 italic">No manager</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={dept.is_archived ? 'archived' : 'active'} />
                </td>
                <td className="px-6 py-4 text-zinc-400 whitespace-nowrap">
                  {createdDate}
                </td>
                {canManage && (
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(dept)}
                        title="Edit Department"
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleArchive(dept)}
                        title={dept.is_archived ? 'Restore Department' : 'Archive Department'}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                      {isOwner && (
                        <button
                          onClick={() => handleDelete(dept)}
                          title="Delete Department"
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-950 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {selectedDept && isEditOpen && (
        <EditDepartmentModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedDept(null);
          }}
          department={selectedDept}
          members={members}
        />
      )}

      {selectedDept && isArchiveOpen && (
        <ArchiveDialog
          isOpen={isArchiveOpen}
          onClose={() => {
            setIsArchiveOpen(false);
            setSelectedDept(null);
          }}
          departmentId={selectedDept.id}
          departmentName={selectedDept.name}
          isArchived={selectedDept.is_archived}
        />
      )}

      {selectedDept && isDeleteOpen && (
        <DeleteDialog
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setSelectedDept(null);
          }}
          departmentId={selectedDept.id}
          departmentName={selectedDept.name}
        />
      )}
    </div>
  );
}
