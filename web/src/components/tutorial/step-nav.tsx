"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import type { TutorialStep } from "@/data/tutorials/types";

interface StepNavProps {
  steps: TutorialStep[];
  currentIndex: number;
  onSelect: (index: number) => void;
  sessionTitle: string;
}

export function StepNav({ steps, currentIndex, onSelect, sessionTitle }: StepNavProps) {
  return (
    <nav
      aria-label="教學步驟導航"
      className="hidden w-60 shrink-0 flex-col border-r border-[var(--color-border)] lg:flex"
      style={{ position: "sticky", top: "56px", height: "calc(100vh - 56px - 64px)", overflowY: "auto" }}
    >
      <div className="px-4 pt-5 pb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          {sessionTitle}
        </p>
      </div>

      <ol className="flex flex-col gap-0 px-2 pb-4">
        {steps.map((step, i) => {
          const isActive = i === currentIndex;
          const isDone = i < currentIndex;

          return (
            <li key={step.id}>
              {/* Connector line */}
              {i > 0 && (
                <div className="ml-[19px] h-4 w-px border-l border-dashed border-[var(--color-border)]" />
              )}

              <button
                onClick={() => onSelect(i)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
                  isActive
                    ? "border-l-[3px] border-blue-500 bg-blue-50 pl-[9px] dark:bg-blue-950/30"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
                aria-current={isActive ? "step" : undefined}
              >
                {/* Step indicator */}
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isDone
                      ? "bg-emerald-500 text-white"
                      : isActive
                      ? "border-2 border-blue-500 bg-white dark:bg-zinc-900"
                      : "border border-zinc-300 bg-transparent text-zinc-500 dark:border-zinc-600"
                  )}
                >
                  {isDone ? (
                    <Check size={12} strokeWidth={3} />
                  ) : isActive ? (
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                  ) : (
                    <span className="text-[10px]">{i + 1}</span>
                  )}
                </span>

                {/* Step title */}
                <span
                  className={cn(
                    "text-sm leading-snug",
                    isActive
                      ? "font-semibold text-zinc-900 dark:text-zinc-50"
                      : isDone
                      ? "text-zinc-600 dark:text-zinc-400"
                      : "text-zinc-500 dark:text-zinc-400"
                  )}
                >
                  {step.title}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
