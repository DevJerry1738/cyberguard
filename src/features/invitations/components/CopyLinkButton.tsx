'use client';

import React from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyLinkButtonProps {
  value: string;
}

export function CopyLinkButton({ value }: CopyLinkButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback or ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex h-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 px-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all focus:outline-none"
    >
      {copied ? (
        <>
          <Check className="mr-1.5 h-4 w-4 text-emerald-400" />
          <span className="text-emerald-400">Copied</span>
        </>
      ) : (
        <>
          <Copy className="mr-1.5 h-4 w-4" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}
