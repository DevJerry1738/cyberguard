'use client';

import React from 'react';
import { X, Mail, Shield, UserPlus, Loader2 } from 'lucide-react';
import { createInvitationAction } from '../actions/invitations';
import { CopyLinkButton } from './CopyLinkButton';

interface InviteMemberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  departments: any[];
  roles: any[];
  onSuccess: () => void;
}

export function InviteMemberDialog({ isOpen, onClose, departments, roles, onSuccess }: InviteMemberDialogProps) {
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [inviteLink, setInviteLink] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setInviteLink(null);

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createInvitationAction(formData);
      if (result.success && result.inviteLink) {
        setInviteLink(result.inviteLink);
        // Log to console per MVP requirement
        console.log(`Generated invite link: ${result.inviteLink}`);
        onSuccess();
      } else {
        setError(result.error || 'Failed to generate invitation');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 hover:bg-zinc-900 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2 text-emerald-400">
          <UserPlus className="h-5 w-5" />
          <h2 className="text-xl font-bold text-white">Invite Team Member</h2>
        </div>

        <p className="mt-1 text-sm text-zinc-400">
          Send an invitation link to onboard a new member.
        </p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {inviteLink ? (
          <div className="mt-6 space-y-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-semibold text-emerald-400">Invitation Link Generated!</h3>
            <p className="text-xs text-zinc-400">
              Copy the onboarding token URL below and send it to your invitee.
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300 select-all focus:outline-none"
              />
              <CopyLinkButton value={inviteLink} />
            </div>
            <div className="flex justify-end pt-2 border-t border-zinc-850">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  placeholder="e.g. employee@company.com"
                  className="block w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-10 pr-3 py-2 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role_id" className="block text-sm font-medium text-zinc-300">
                Organization Role <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <select
                  name="role_id"
                  id="role_id"
                  required
                  className="block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                >
                  <option value="">Select a Role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="department_id" className="block text-sm font-medium text-zinc-300">
                Department <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <div className="relative mt-1">
                <select
                  name="department_id"
                  id="department_id"
                  className="block w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
                >
                  <option value="">No Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3 border-t border-zinc-800 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="rounded-lg border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Link
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
