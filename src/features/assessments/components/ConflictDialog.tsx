'use client';

import React, { useState } from 'react';
import { useDraft } from './DraftProvider';
import { AlertTriangle, RefreshCw, Save, ShieldAlert, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConflictDialogProps {
  userRole?: string | null;
}

export function ConflictDialog({ userRole }: ConflictDialogProps) {
  const {
    hasConflict,
    serverDraftForConflict,
    resolveConflictReload,
    resolveConflictOverwrite,
  } = useDraft();

  const [isConfirmingOverwrite, setIsConfirmingOverwrite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!hasConflict || !serverDraftForConflict) return null;

  const canOverwrite = userRole === 'Owner' || userRole === 'Admin';

  const lastSavedTime = serverDraftForConflict.last_saved_at
    ? new Date(serverDraftForConflict.last_saved_at).toLocaleString()
    : 'Recently';

  const handleReload = async () => {
    setIsSubmitting(true);
    try {
      await resolveConflictReload();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverwriteConfirm = async () => {
    setIsSubmitting(true);
    try {
      await resolveConflictOverwrite();
      setIsConfirmingOverwrite(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={hasConflict}>
      <DialogContent className="bg-slate-900 border border-slate-800 text-slate-100 max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-slate-100">
                Assessment Updated Elsewhere
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                Optimistic Concurrency Conflict
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-3 text-xs text-slate-300">
          <p>
            A newer version of this assessment draft exists on the server (Revision v
            {serverDraftForConflict.version}, saved at {lastSavedTime}).
          </p>
          <p className="bg-slate-950/60 p-3 rounded border border-slate-800 text-slate-400">
            Your local changes are still preserved, but cannot be saved until this conflict is
            resolved.
          </p>

          {isConfirmingOverwrite && (
            <div className="p-3 bg-amber-950/50 border border-amber-800/60 rounded-md text-amber-200 space-y-1.5">
              <div className="flex items-center gap-1.5 font-medium text-amber-100">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Confirm Overwrite</span>
              </div>
              <p className="text-[11px] text-amber-300/80">
                Are you sure you want to force overwrite the server version with your local copy?
                This action cannot be undone.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          {!isConfirmingOverwrite ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReload}
                disabled={isSubmitting}
                className="border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-1.5" />}
                Reload Latest (Recommended)
              </Button>

              {canOverwrite && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsConfirmingOverwrite(true)}
                  disabled={isSubmitting}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  <Save className="w-4 h-4 mr-1.5" />
                  Overwrite Draft
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsConfirmingOverwrite(false)}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={handleOverwriteConfirm}
                disabled={isSubmitting}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                Confirm & Overwrite
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
