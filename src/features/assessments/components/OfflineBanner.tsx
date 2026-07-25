'use client';

import React from 'react';
import { WifiOff, X } from 'lucide-react';
import { useDraft } from './DraftProvider';

export function OfflineBanner() {
  const { isOffline } = useDraft();
  const [dismissed, setDismissed] = React.useState(false);

  if (!isOffline || dismissed) return null;

  return (
    <div
      role="alert"
      className="bg-amber-950/80 border-b border-amber-800/60 px-4 py-2.5 text-amber-200 text-xs font-medium backdrop-blur-md transition-all duration-200"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="font-semibold text-amber-100">You're offline.</strong> Changes are
            being stored locally in your browser and will sync automatically once your connection is
            restored.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 rounded hover:bg-amber-900/60 text-amber-300 transition-colors"
          aria-label="Dismiss offline banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
