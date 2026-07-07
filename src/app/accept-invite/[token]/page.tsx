import React from 'react';
import type { Metadata } from 'next';
import { validateInvitationToken } from '@/features/invitations/actions/invitations';
import { Shield, AlertCircle } from 'lucide-react';
import { AcceptInvitationForm } from '@/features/invitations/components/AcceptInvitationForm';

export const metadata: Metadata = {
  title: 'Accept Invitation',
  description: 'Setup your account and password to join your team.',
};

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function AcceptInvitePage({ params }: PageProps) {
  const { token } = await params;
  const result = await validateInvitationToken(token);

  if (!result.success || !result.invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
        <div className="w-full max-w-md border border-zinc-800 bg-zinc-900/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-white">Invalid or Expired Invitation</h1>
          <p className="text-sm text-zinc-400">
            {result.error || 'The invitation link you opened is invalid, expired, or has already been accepted.'}
          </p>
          <div className="pt-2">
            <p className="text-xs text-zinc-500">
              Please request another invitation link from your organization administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { email, organization_name } = result.invitation;

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md border border-zinc-800 bg-zinc-900/40 backdrop-blur-md rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-white">Join {organization_name}</h1>
          <p className="text-sm text-zinc-400">
            Set up your password to create your account and join the organization.
          </p>
        </div>

        <AcceptInvitationForm token={token} email={email} />
      </div>
    </div>
  );
}
