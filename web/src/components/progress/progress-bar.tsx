"use client";

import { useQuizProgress } from "@/hooks/useQuizProgress";
import { LEARNING_PATH, VERSION_META } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLocale } from "@/lib/i18n";

interface ProgressBarProps {
  compact?: boolean;
}

export function ProgressBar({ compact = false }: ProgressBarProps) {
  const { progress, isLoaded, getOverallPercentage, getTotalCompleted, getTotalSessions } =
    useQuizProgress();
  const locale = useLocale();

  if (!isLoaded) {
    return (
      <div className="h-1.5 w-full animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
    );
  }

  const percentage = getOverallPercentage();
  const completed = getTotalCompleted();
  const total = getTotalSessions();

  if (compact) {
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
          <span>測驗進度 / Progress</span>
          <span>{completed} / {total}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">整體測驗進度 / Overall Progress</span>
        <span className="text-sm text-[var(--color-text-secondary)]">
          {completed} / {total} 完成 / done（{percentage}%）
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full rounded-full bg-blue-500 transition-all duration-700"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Session grid */}
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-12">
        {LEARNING_PATH.map((session) => {
          const sessionProgress = progress[session];
          const isCompleted = sessionProgress?.completed;
          const meta = VERSION_META[session];

          return (
            <Link
              key={session}
              href={`/${locale}/quiz/${session}`}
              title={`${session}: ${meta?.title}`}
              className={cn(
                "group flex flex-col items-center gap-0.5 rounded-lg border p-1.5 transition-all",
                isCompleted
                  ? "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/20"
                  : "border-[var(--color-border)] hover:border-zinc-400"
              )}
            >
              <span
                className={cn(
                  "text-xs font-mono font-medium",
                  isCompleted
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-[var(--color-text-secondary)]"
                )}
              >
                {session}
              </span>
              {isCompleted && sessionProgress && (
                <span className="text-[10px] tabular-nums text-emerald-500">
                  {sessionProgress.score}/{sessionProgress.total}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
