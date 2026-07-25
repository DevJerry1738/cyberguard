'use client';

import React from 'react';
import { useDraft } from './DraftProvider';
import { Play, Trash2, Clock, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ResumeCardProps {
  assessmentName?: string;
  onContinue?: () => void;
  className?: string;
}

export function ResumeCard({ assessmentName = 'CyberGuard Assessment', onContinue, className = '' }: ResumeCardProps) {
  const { initialDraftToResume, clearResumePrompt, discardDraft } = useDraft();
  const [isDiscarding, setIsDiscarding] = React.useState(false);

  if (!initialDraftToResume) return null;

  const progress = initialDraftToResume.progress ?? 0;
  const lastSavedTime = initialDraftToResume.last_saved_at
    ? new Date(initialDraftToResume.last_saved_at).toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  const handleContinue = () => {
    clearResumePrompt();
    onContinue?.();
  };

  const handleDiscard = async () => {
    setIsDiscarding(true);
    try {
      await discardDraft();
    } finally {
      setIsDiscarding(false);
    }
  };

  return (
    <Card className={`bg-slate-900/90 border-slate-800 text-slate-100 shadow-xl backdrop-blur-md overflow-hidden ${className}`}>
      <div className="h-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-semibold text-slate-200">
            Resume Previous Session
          </CardTitle>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-sky-950 text-sky-300 border border-sky-800/50">
            <Clock className="w-3 h-3" />
            {lastSavedTime}
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">{assessmentName}</p>
      </CardHeader>

      <CardContent className="space-y-2.5 pb-4 text-xs">
        <div className="flex justify-between items-center text-slate-300 font-medium">
          <span>Completion Progress</span>
          <span className="text-sky-400">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2 bg-slate-800" />
        <p className="text-[11px] text-slate-500">
          Your responses and navigation position were saved automatically.
        </p>
      </CardContent>

      <CardFooter className="flex gap-2 pt-2 border-t border-slate-800/80 bg-slate-950/40">
        <Button
          onClick={handleContinue}
          size="sm"
          className="flex-1 bg-sky-600 hover:bg-sky-500 text-white shadow-sm font-medium"
        >
          <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
          Continue Assessment
        </Button>
        <Button
          onClick={handleDiscard}
          disabled={isDiscarding}
          variant="outline"
          size="sm"
          className="border-slate-700 bg-slate-800/80 hover:bg-rose-950/50 hover:text-rose-300 hover:border-rose-800/60 text-slate-300"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          Discard Draft
        </Button>
      </CardFooter>
    </Card>
  );
}
