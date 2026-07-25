'use client';

import React from 'react';
import { useDraft } from './DraftProvider';
import { CheckCircle2, Loader2, CloudOff, AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react';
import { SaveStatus } from '../schemas/draft';

interface SaveIndicatorProps {
  className?: string;
}

export function SaveIndicator({ className = '' }: SaveIndicatorProps) {
  const { saveStatus, lastSavedAt } = useDraft();

  function getStatusConfig(status: SaveStatus) {
    switch (status) {
      case 'saved':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
          label: 'Saved',
          dotBg: 'bg-emerald-500',
          textColor: 'text-slate-300',
        };
      case 'saving':
        return {
          icon: <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />,
          label: 'Saving...',
          dotBg: 'bg-sky-400',
          textColor: 'text-slate-300',
        };
      case 'unsaved':
        return {
          icon: <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />,
          label: 'Unsaved Changes',
          dotBg: 'bg-amber-400',
          textColor: 'text-amber-200',
        };
      case 'sync_pending':
        return {
          icon: <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />,
          label: 'Sync Pending',
          dotBg: 'bg-blue-400',
          textColor: 'text-blue-200',
        };
      case 'offline':
        return {
          icon: <CloudOff className="w-4 h-4 text-orange-400" />,
          label: 'Offline (Saved Locally)',
          dotBg: 'bg-orange-400',
          textColor: 'text-orange-200',
        };
      case 'conflict':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
          label: 'Conflict Detected',
          dotBg: 'bg-red-400',
          textColor: 'text-red-200',
        };
      case 'error':
      default:
        return {
          icon: <AlertCircle className="w-4 h-4 text-rose-500" />,
          label: 'Save Failed',
          dotBg: 'bg-rose-500',
          textColor: 'text-rose-300',
        };
    }
  }

  const config = getStatusConfig(saveStatus);

  const formattedTime = lastSavedAt
    ? new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-sm transition-all duration-200 text-xs font-medium ${config.textColor} ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
      {saveStatus === 'saved' && formattedTime && (
        <span className="text-[10px] text-slate-500 pl-1 border-l border-slate-800">
          {formattedTime}
        </span>
      )}
    </div>
  );
}
