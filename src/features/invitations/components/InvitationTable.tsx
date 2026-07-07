'use client';

import React from 'react';
import { Mail, Clock, Shield, Building, Trash2, ShieldAlert, Copy } from 'lucide-react';
import type { InvitationWithMeta } from '@/types/invitations';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { revokeInvitationAction, deleteInvitationAction } from '../actions/invitations';
import { useRouter } from 'next/navigation';

interface InvitationTableProps {
  invitations: InvitationWithMeta[];
  userRole: string;
}

export function InvitationTable({ invitations, userRole }: InvitationTableProps) {
  const [isPending, startTransition] = React.useTransition();
  const [copiedToken, setCopiedToken] = React.useState<string | null>(null);
  const router = useRouter();

  const handleRevoke = (id: string) => {
    if (confirm('Are you sure you want to revoke this invitation? The invitee will not be able to join using this link.')) {
      startTransition(async () => {
        const res = await revokeInvitationAction(id);
        if (res.success) {
          router.refresh();
        } else {
          alert(res.error || 'Failed to revoke invitation');
        }
      });
    };
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this invitation? It will be removed permanently.')) {
      startTransition(async () => {
        const res = await deleteInvitationAction(id);
        if (res.success) {
          router.refresh();
        } else {
          alert(res.error || 'Failed to delete invitation');
        }
      });
    }
  };

  const copyLink = (token: string) => {
    const origin = window.location.origin;
    const url = `${origin}/accept-invite/${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950/40">
      <table className="min-w-full divide-y divide-zinc-850 text-left text-sm">
        <thead className="bg-zinc-900/50 text-zinc-400 font-medium">
          <tr>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">Department</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Expires</th>
            <th className="px-6 py-4">Invited By</th>
            <th className="px-6 py-4">Created</th>
            <th className="px-6 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-850/60 text-zinc-300">
          {invitations.map((inv) => {
            const roleName = inv.role?.name ?? 'Employee';
            const deptName = inv.department?.name ?? 'None';
            const inviterName = inv.inviter
              ? [inv.inviter.first_name, inv.inviter.last_name].filter(Boolean).join(' ') || inv.inviter.email
              : 'Unknown';

            const createdDate = new Date(inv.created_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            const expiresDate = new Date(inv.expires_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            const isPendingStatus = inv.status === 'pending';

            return (
              <tr key={inv.id} className="hover:bg-zinc-900/20 transition-all">
                <td className="px-6 py-4 font-semibold text-white whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-zinc-500" />
                    {inv.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-emerald-500/80" />
                    {roleName}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-zinc-500" />
                    {deptName}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={inv.status} />
                </td>
                <td className="px-6 py-4 text-zinc-400 whitespace-nowrap">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-zinc-500" />
                    {expiresDate}
                  </span>
                </td>
                <td className="px-6 py-4 text-zinc-400 whitespace-nowrap">
                  {inviterName}
                </td>
                <td className="px-6 py-4 text-zinc-400 whitespace-nowrap">
                  {createdDate}
                </td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-2">
                    {isPendingStatus && (
                      <button
                        onClick={() => copyLink(inv.token)}
                        className={`rounded-lg p-1.5 text-xs font-semibold flex items-center gap-1 transition-all ${
                          copiedToken === inv.token
                            ? 'bg-emerald-950 text-emerald-400'
                            : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
                        }`}
                        title="Copy Invitation Link"
                      >
                        <Copy className="h-4 w-4" />
                        {copiedToken === inv.token ? 'Copied' : 'Link'}
                      </button>
                    )}
                    {isPendingStatus && (
                      <button
                        onClick={() => handleRevoke(inv.id)}
                        disabled={isPending}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all disabled:opacity-50"
                        title="Revoke Invitation"
                      >
                        <ShieldAlert className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(inv.id)}
                      disabled={isPending}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-950 hover:text-red-400 transition-all disabled:opacity-50"
                      title="Delete Record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
