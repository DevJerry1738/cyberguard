'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { X, UserPlus } from 'lucide-react';
import type { MemberProfile } from '@/features/organizations/actions/data';
import { assignUsersToSession } from '@/features/assessments/actions/sessions';

interface AssignUsersDialogProps {
  sessionId: string;
  members: MemberProfile[];
}

export function AssignUsersDialog({ sessionId, members }: AssignUsersDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggleMember = (profileId: string) => {
    setSelectedIds(current =>
      current.includes(profileId)
        ? current.filter(id => id !== profileId)
        : [...current, profileId]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (selectedIds.length === 0) {
      setError('Select at least one member to assign the session to.');
      return;
    }

    startTransition(async () => {
      const result = await assignUsersToSession(sessionId, selectedIds);
      if (!result.success) {
        setError(result.error || 'Unable to assign users.');
        return;
      }

      setSelectedIds([]);
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-surface-700 bg-surface-900 px-3 py-2 text-sm font-medium text-slate-200 hover:border-brand-500 hover:text-white transition-colors"
      >
        <UserPlus className="h-4 w-4" />
        Assign Users
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-surface-800 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surface-800 px-5 py-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Assign Session Users</h3>
                <p className="text-sm text-slate-400">Choose who should receive this assessment session.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-surface-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                {members.length === 0 ? (
                  <p className="text-sm text-slate-400">No organization members are available to assign yet.</p>
                ) : (
                  members.map(member => {
                    const profile = member.profiles;
                    const fullName = profile
                      ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || profile.email
                      : 'Unknown user';
                    const roleName = member.roles?.name ?? 'Employee';

                    return (
                      <label
                        key={member.profile_id}
                        className="flex cursor-pointer items-center justify-between rounded-xl border border-surface-800 bg-surface-950/40 px-3 py-2"
                      >
                        <div>
                          <div className="text-sm font-medium text-white">{fullName}</div>
                          <div className="text-xs text-slate-400">{roleName} • {profile?.email ?? 'No email'}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(member.profile_id)}
                          onChange={() => toggleMember(member.profile_id)}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-brand-500"
                        />
                      </label>
                    );
                  })
                )}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-surface-700 px-3 py-2 text-sm text-slate-300 hover:border-surface-600 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? 'Saving…' : 'Assign Users'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
