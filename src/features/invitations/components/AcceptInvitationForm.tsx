'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Key, CheckCircle } from 'lucide-react';
import { acceptInvitationAction } from '../actions/accept';

interface AcceptInvitationFormProps {
  token: string;
  email: string;
}

export function AcceptInvitationForm({ token, email }: AcceptInvitationFormProps) {
  const [isPending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirm_password') as string;

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    startTransition(async () => {
      const res = await acceptInvitationAction(token, password);
      if (res.success) {
        setSuccess(true);
        // Delay slightly for visual feedback, then login or redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setError(res.error || 'Failed to accept invitation. Please try again.');
      }
    });
  };

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center space-y-3 animate-in fade-in zoom-in-95">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <CheckCircle className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-white">Account Created!</h3>
        <p className="text-sm text-zinc-400">
          You have successfully joined the organization. Redirecting to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-400">
          Email Address
        </label>
        <input
          type="text"
          disabled
          value={email}
          className="mt-1 block w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-zinc-500 cursor-not-allowed sm:text-sm focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative mt-1">
          <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="password"
            name="password"
            id="password"
            required
            minLength={8}
            className="block w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-10 pr-3 py-2 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
            placeholder="Min 8 characters"
          />
        </div>
      </div>

      <div>
        <label htmlFor="confirm_password" className="block text-sm font-medium text-zinc-300">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <div className="relative mt-1">
          <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="password"
            name="confirm_password"
            id="confirm_password"
            required
            className="block w-full rounded-lg border border-zinc-800 bg-zinc-900 pl-10 pr-3 py-2 text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm"
            placeholder="Re-enter password"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition-all disabled:opacity-50"
      >
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account & Join
      </button>
    </form>
  );
}
