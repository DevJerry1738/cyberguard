'use client';

interface ShortcutHelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutHelpDialog({ isOpen, onClose }: ShortcutHelpDialogProps) {
  if (!isOpen) return null;

  const shortcuts = [
    { combo: 'Alt + →', action: 'Next question' },
    { combo: 'Alt + ←', action: 'Previous question' },
    { combo: 'Ctrl/Cmd + S', action: 'Save draft' },
    { combo: 'Alt + R', action: 'Open review' },
    { combo: 'Alt + Enter', action: 'Submit from review' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 px-4">
      <div className="w-full max-w-md rounded-2xl border border-surface-800 bg-surface-900 p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-white">Keyboard shortcuts</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-surface-700 px-3 py-1 text-sm text-slate-300"
          >
            Close
          </button>
        </div>

        <div className="mt-4 space-y-2 text-sm text-slate-300">
          {shortcuts.map(shortcut => (
            <div key={shortcut.combo} className="flex items-center justify-between rounded-lg bg-surface-950/60 px-3 py-2">
              <span className="text-slate-400">{shortcut.combo}</span>
              <span className="font-medium text-white">{shortcut.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
