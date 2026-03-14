"use client";

import { cn } from "@/lib/utils";
import type { FillInQuestion } from "@/types/quiz";

interface FillInProps {
  question: FillInQuestion;
  answers: Record<string, string>;
  isRevealed: boolean;
  onChange: (blankId: string, value: string) => void;
}

function normalizeAnswer(answer: string): string {
  return answer.trim().toLowerCase();
}

function isAnswerCorrect(userAnswer: string, correctAnswer: string): boolean {
  const user = normalizeAnswer(userAnswer);
  const correct = normalizeAnswer(correctAnswer);
  return user === correct;
}

export function FillIn({
  question,
  answers,
  isRevealed,
  onChange,
}: FillInProps) {
  return (
    <div className="space-y-4">
      {question.blanks.map((blank) => {
        const userAnswer = answers[blank.id] ?? "";
        const correct = isAnswerCorrect(userAnswer, blank.answer);

        return (
          <div key={blank.id} className="space-y-1.5">
            <label className="block text-sm font-medium text-[var(--color-text)]">
              {blank.label}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                disabled={isRevealed}
                value={userAnswer}
                onChange={(e) => onChange(blank.id, e.target.value)}
                placeholder="填入答案..."
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-sm font-mono",
                  "bg-[var(--color-bg)] text-[var(--color-text)]",
                  "placeholder:text-zinc-400 dark:placeholder:text-zinc-600",
                  "transition-colors duration-150",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500/30",
                  isRevealed
                    ? correct
                      ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
                      : "border-red-400 bg-red-50 dark:bg-red-950/30"
                    : "border-[var(--color-border)] focus:border-blue-500"
                )}
              />
              {isRevealed && (
                <span
                  className={cn(
                    "text-sm font-medium shrink-0",
                    correct ? "text-emerald-500" : "text-red-400"
                  )}
                >
                  {correct ? "✓ 正確" : "✗"}
                </span>
              )}
            </div>
            {isRevealed && !correct && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                正確答案：
                <code className="ml-1 rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800">
                  {blank.answer}
                </code>
              </p>
            )}
            {!isRevealed && blank.hint && (
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                提示：{blank.hint}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
