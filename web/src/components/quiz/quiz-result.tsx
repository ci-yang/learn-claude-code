"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { QuizAnswer, Question } from "@/types/quiz";

interface QuizResultProps {
  session: string;
  title: string;
  questions: Question[];
  answers: Record<string, QuizAnswer>;
  locale: string;
  onRetry: () => void;
}

function computeScore(questions: Question[], answers: Record<string, QuizAnswer>): number {
  let correct = 0;
  for (const q of questions) {
    const answer = answers[q.id];
    if (!answer) continue;

    if (q.type === "single") {
      if (answer.selectedOptions?.[0] === q.answer) correct++;
    } else if (q.type === "fill-in") {
      const blankAnswers = answer.fillInAnswers ?? {};
      const allCorrect = q.blanks.every((blank) => {
        const user = (blankAnswers[blank.id] ?? "").trim().toLowerCase();
        return user === blank.answer.trim().toLowerCase();
      });
      if (allCorrect) correct++;
    }
  }
  return correct;
}

export function QuizResult({
  session,
  title,
  questions,
  answers,
  locale,
  onRetry,
}: QuizResultProps) {
  const score = computeScore(questions, answers);
  const total = questions.length;
  const percentage = Math.round((score / total) * 100);

  const emoji =
    percentage === 100 ? "🎉" : percentage >= 67 ? "👍" : percentage >= 33 ? "💪" : "📚";

  const message =
    percentage === 100
      ? "完美！所有題目全部答對！ / Perfect score!"
      : percentage >= 67
      ? "不錯！繼續保持！ / Great job!"
      : percentage >= 33
      ? "還有進步空間，可以複習後再試！ / Keep practicing!"
      : "建議重新學習課程內容後再作答。 / Review the material and try again.";

  // SVG circle progress constants
  const CIRCLE_SIZE = 160;
  const RADIUS = 64;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeColor =
    percentage === 100
      ? "#10b981" // emerald-500
      : percentage >= 67
      ? "#3b82f6" // blue-500
      : percentage >= 33
      ? "#f97316" // orange-500
      : "#ef4444"; // red-500
  const dashOffset = CIRCUMFERENCE * (1 - percentage / 100);

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Score Circle — SVG circular progress */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative" style={{ width: CIRCLE_SIZE, height: CIRCLE_SIZE }}>
          <svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} className="-rotate-90">
            {/* Track */}
            <circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              className="text-zinc-200 dark:text-zinc-800"
            />
            {/* Progress */}
            <circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={strokeColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 0.8s ease" }}
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl">{emoji}</span>
            <span
              className="text-2xl font-bold tabular-nums leading-none"
              style={{ color: strokeColor }}
            >
              {score}/{total}
            </span>
            <span className="text-xs text-[var(--color-text-secondary)]">{percentage}%</span>
          </div>
        </div>
        <p className="text-center text-sm text-[var(--color-text-secondary)]">{message}</p>
      </div>

      {/* Per-question breakdown */}
      <div className="w-full max-w-lg space-y-2">
        {questions.map((q, i) => {
          const answer = answers[q.id];
          let isCorrect = false;

          if (answer && q.type === "single") {
            isCorrect = answer.selectedOptions?.[0] === q.answer;
          } else if (answer && q.type === "fill-in") {
            isCorrect = q.blanks.every((blank) => {
              const user = (answer.fillInAnswers?.[blank.id] ?? "").trim().toLowerCase();
              return user === blank.answer.trim().toLowerCase();
            });
          }

          return (
            <div
              key={q.id}
              className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] px-4 py-2.5"
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  isCorrect
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                    : "bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400"
                )}
              >
                {isCorrect ? "✓" : "✗"}
              </span>
              <span className="flex-1 text-sm text-[var(--color-text)]">
                第 {i + 1} 題 / Q{i + 1}
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {isCorrect ? "答對 / Correct" : "答錯 / Wrong"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-bg-secondary)]"
        >
          重新作答 / Retry
        </button>
        <Link
          href={`/${locale}/${session}`}
          className="rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-600"
        >
          回到課程 / Back to Lesson
        </Link>
      </div>
    </div>
  );
}
