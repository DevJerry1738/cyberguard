'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { Rocket } from 'lucide-react';
import { createAssessmentSession } from '@/features/assessments/actions/sessions';

interface LaunchSessionButtonProps {
  templateId: string;
  templateName: string;
  canLaunch: boolean;
}

export function LaunchSessionButton({ templateId, templateName, canLaunch }: LaunchSessionButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLaunch = () => {
    if (!canLaunch) {
      setError('Only Owners, Admins, and Security Officers can launch sessions.');
      return;
    }

    startTransition(async () => {
      setError(null);
      const result = await createAssessmentSession(templateId);

      if (!result.success || !result.id) {
        setError(result.error || 'Unable to launch assessment session.');
        return;
      }

      router.push(`/assessments/sessions/${result.id}/wizard`);
      router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleLaunch}
        disabled={isPending || !canLaunch}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
      >
        <Rocket className="h-4 w-4" />
        {isPending ? 'Launching…' : `Launch ${templateName}`}
      </button>
      {error && <div className="text-xs text-red-400">{error}</div>}
    </div>
  );
}
