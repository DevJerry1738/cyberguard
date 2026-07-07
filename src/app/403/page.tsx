import React from 'react';
import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="flex items-center justify-center h-screen bg-surface-950">
      <div className="max-w-md text-center">
        <h1 className="text-4xl font-bold text-white mb-4">403 — Unauthorized</h1>
        <p className="text-zinc-400 mb-6">You do not have permission to view this page.</p>
        <Link href="/dashboard" className="inline-flex items-center px-4 py-2 rounded-xl bg-brand-500 text-white">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
