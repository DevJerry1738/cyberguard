'use client';

interface SaveIndicatorProps {
  status: 'saved' | 'saving' | 'unsaved' | 'error';
}

const STATUS_COPY: Record<SaveIndicatorProps['status'], string> = {
  saved: 'Saved',
  saving: 'Saving…',
  unsaved: 'Unsaved changes',
  error: 'Save error',
};

export function SaveIndicator({ status }: SaveIndicatorProps) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-surface-700 bg-surface-950/50 px-3 py-1.5 text-xs font-semibold text-slate-200">
      <span className={`h-2 w-2 rounded-full ${
        status === 'saved' ? 'bg-emerald-400' :
        status === 'saving' ? 'bg-amber-400' :
        status === 'error' ? 'bg-red-400' : 'bg-sky-400'
      }`} />
      {STATUS_COPY[status]}
    </div>
  );
}
