"use client";

import { cn } from "@/lib/utils";
import type { SingleChoiceQuestion } from "@/types/quiz";

interface SingleChoiceProps {
  question: SingleChoiceQuestion;
  selectedOption: number | null;
  isRevealed: boolean;
  onSelect: (index: number) => void;
}

export function SingleChoice({
  question,
  selectedOption,
  isRevealed,
  onSelect,
}: SingleChoiceProps) {
  return (
    <div className="space-y-3" role="radiogroup" aria-label="Answer options">
      {question.options.map((option, index) => {
        const isSelected = selectedOption === index;
        const isCorrect = index === question.answer;

        let stateClass = "";
        if (isRevealed) {
          if (isCorrect) {
            stateClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30";
          } else if (isSelected && !isCorrect) {
            stateClass = "border-red-400 bg-red-50 dark:bg-red-950/30";
          } else {
            stateClass = "border-[var(--color-border)] opacity-60";
          }
        } else if (isSelected) {
          stateClass = "border-blue-500 bg-blue-50 dark:bg-blue-950/30";
        } else {
          stateClass = "border-[var(--color-border)] hover:border-zinc-400 hover:bg-[var(--color-bg-secondary)]";
        }

        return (
          <button
            key={index}
            role="radio"
            aria-checked={isSelected}
            aria-label={`Option ${String.fromCharCode(65 + index)}: ${option}`}
            disabled={isRevealed}
            onClick={() => onSelect(index)}
            className={cn(
              "w-full rounded-lg border p-4 text-left transition-all duration-150",
              "flex items-start gap-3",
              isRevealed ? "cursor-default" : "cursor-pointer",
              stateClass
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
                isRevealed && isCorrect
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : isRevealed && isSelected && !isCorrect
                  ? "border-red-400 bg-red-400 text-white"
                  : isSelected
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-zinc-400 text-zinc-400"
              )}
            >
              {String.fromCharCode(65 + index)}
            </span>
            <span className="text-sm leading-relaxed text-[var(--color-text)]">
              {option}
            </span>
            {isRevealed && isCorrect && (
              <span className="ml-auto shrink-0 text-emerald-500 text-sm font-medium">✓</span>
            )}
            {isRevealed && isSelected && !isCorrect && (
              <span className="ml-auto shrink-0 text-red-400 text-sm font-medium">✗</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
