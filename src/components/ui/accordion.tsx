"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}

const AccordionItem = ({ question, answer, isOpen, onToggle, index }: AccordionItemProps) => {
  const contentRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="border-b border-surface-700/60 last:border-0">
      <button
        id={`accordion-btn-${index}`}
        aria-expanded={isOpen}
        aria-controls={`accordion-panel-${index}`}
        onClick={onToggle}
        className="flex w-full items-center justify-between py-5 text-left text-white font-medium transition-colors hover:text-brand-400 focus-visible:outline-none focus-visible:text-brand-400"
      >
        <span className="pr-6 text-base">{question}</span>
        <span
          className={cn(
            "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-surface-600 text-slate-400 transition-all duration-300",
            isOpen && "rotate-180 border-brand-500/50 bg-brand-500/10 text-brand-400"
          )}
          aria-hidden
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      <div
        id={`accordion-panel-${index}`}
        role="region"
        aria-labelledby={`accordion-btn-${index}`}
        ref={contentRef}
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? (contentRef.current?.scrollHeight ?? 500) : 0,
          opacity: isOpen ? 1 : 0,
        }}
      >
        <p className="pb-5 text-sm leading-relaxed text-slate-400">{answer}</p>
      </div>
    </div>
  );
};

interface AccordionProps {
  items: { question: string; answer: string }[];
  className?: string;
}

export const Accordion = ({ items, className }: AccordionProps) => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <div className={cn("divide-y-0", className)}>
      {items.map((item, i) => (
        <AccordionItem
          key={i}
          index={i}
          question={item.question}
          answer={item.answer}
          isOpen={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? null : i)}
        />
      ))}
    </div>
  );
};
