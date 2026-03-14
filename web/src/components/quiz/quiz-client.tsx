"use client";

import { useState, useCallback, useEffect } from "react";
import { QuizCard } from "./quiz-card";
import { QuizResult } from "./quiz-result";
import type { QuizSession, QuizAnswer, QuizProgress } from "@/types/quiz";

interface QuizClientProps {
  quizSession: QuizSession;
  locale: string;
}

const STORAGE_KEY = "quiz-progress";

function loadProgress(): Record<string, QuizProgress> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function saveProgress(session: string, progress: QuizProgress) {
  if (typeof window === "undefined") return;
  const all = loadProgress();
  all[session] = progress;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function QuizClient({ quizSession, locale }: QuizClientProps) {
  const { session, title, questions } = quizSession;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizAnswer>>({});
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleAnswer = useCallback((answer: QuizAnswer) => {
    setAnswers((prev) => ({
      ...prev,
      [answer.questionId]: answer,
    }));
  }, []);

  const handleReveal = useCallback(() => {
    setIsRevealed(true);
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setIsCompleted(true);

      // Calculate and save score
      let score = 0;
      for (const q of questions) {
        const answer = answers[q.id];
        if (!answer) continue;
        if (q.type === "single") {
          if (answer.selectedOptions?.[0] === q.answer) score++;
        } else if (q.type === "fill-in") {
          const allCorrect = q.blanks.every((blank) => {
            const user = (answer.fillInAnswers?.[blank.id] ?? "").trim().toLowerCase();
            return user === blank.answer.trim().toLowerCase();
          });
          if (allCorrect) score++;
        }
      }

      saveProgress(session, {
        session,
        completed: true,
        score,
        total: questions.length,
        completedAt: new Date().toISOString(),
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
      setIsRevealed(false);
    }
  }, [currentIndex, questions, answers, session]);

  const handleRetry = useCallback(() => {
    setCurrentIndex(0);
    setAnswers({});
    setIsRevealed(false);
    setIsCompleted(false);
  }, []);

  if (isCompleted) {
    return (
      <QuizResult
        session={session}
        title={title}
        questions={questions}
        answers={answers}
        locale={locale}
        onRetry={handleRetry}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
          <span>進度</span>
          <span>{currentIndex} / {questions.length}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${(currentIndex / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <QuizCard
        key={currentQuestion.id}
        question={currentQuestion}
        questionNumber={currentIndex + 1}
        totalQuestions={questions.length}
        answer={answers[currentQuestion.id] ?? null}
        isRevealed={isRevealed}
        onAnswer={handleAnswer}
        onReveal={handleReveal}
        onNext={handleNext}
        isLast={currentIndex + 1 === questions.length}
      />
    </div>
  );
}
