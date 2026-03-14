"use client";

import { useState, useEffect } from "react";
import type { QuizProgress } from "@/types/quiz";

const STORAGE_KEY = "quiz-progress";

export function useQuizProgress() {
  const [progress, setProgress] = useState<Record<string, QuizProgress>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProgress(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  const getSessionProgress = (session: string): QuizProgress | null => {
    return progress[session] ?? null;
  };

  const getTotalCompleted = (): number => {
    return Object.values(progress).filter((p) => p.completed).length;
  };

  const getTotalSessions = (): number => 12;

  const getOverallPercentage = (): number => {
    const completed = getTotalCompleted();
    return Math.round((completed / getTotalSessions()) * 100);
  };

  return {
    progress,
    isLoaded,
    getSessionProgress,
    getTotalCompleted,
    getTotalSessions,
    getOverallPercentage,
  };
}
