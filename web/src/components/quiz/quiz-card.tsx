"use client";

import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SingleChoice } from "./single-choice";
import { FillIn } from "./fill-in";
import { Explanation } from "./explanation";
import type { Question, QuizAnswer } from "@/types/quiz";

interface QuizCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  answer: QuizAnswer | null;
  isRevealed: boolean;
  onAnswer: (answer: QuizAnswer) => void;
  onReveal: () => void;
  onNext: () => void;
  isLast: boolean;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  "warm-up": "初階 / Beginner",
  "practice": "中階 / Intermediate",
  "challenge": "進階 / Advanced",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  "warm-up": "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/30",
  "practice": "text-orange-500 bg-orange-50 dark:bg-orange-950/30 border-orange-500/30",
  "challenge": "text-red-500 bg-red-50 dark:bg-red-950/30 border-red-500/30",
};

function renderQuestionText(text: string) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-sm dark:bg-zinc-800"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

function renderQuestionBlock(text: string) {
  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let codeLines: string[] = [];
  let inCodeBlock = false;
  let blockIndex = 0;
  let codeLang = "";

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        blocks.push(
          <pre
            key={blockIndex++}
            className="my-3 overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-900 p-4 text-xs leading-relaxed"
            data-language={codeLang || undefined}
          >
            <code className="text-zinc-300">{codeLines.join("\n")}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
        codeLang = "";
      } else {
        inCodeBlock = true;
        codeLang = line.trim().slice(3);
      }
    } else if (inCodeBlock) {
      codeLines.push(line);
    } else if (line.trim() === "") {
      blocks.push(<div key={blockIndex++} className="h-2" />);
    } else {
      blocks.push(
        <p key={blockIndex++} className="text-sm leading-relaxed text-[var(--color-text)]">
          {renderQuestionText(line)}
        </p>
      );
    }
  }

  return <>{blocks}</>;
}

export function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  answer,
  isRevealed,
  onAnswer,
  onReveal,
  onNext,
  isLast,
}: QuizCardProps) {
  const canReveal =
    question.type === "single"
      ? answer?.selectedOptions != null && answer.selectedOptions.length > 0
      : question.type === "fill-in"
      ? Object.keys(answer?.fillInAnswers ?? {}).length === question.blanks.length &&
        Object.values(answer?.fillInAnswers ?? {}).every((v) => v.trim() !== "")
      : false;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-[var(--color-text-secondary)]">
          第 {questionNumber} 題 / 共 {totalQuestions} 題 &nbsp;
          <span className="hidden sm:inline">({questionNumber}/{totalQuestions})</span>
        </span>
        <span
          className={cn(
            "rounded-full border px-2.5 py-0.5 text-xs font-medium",
            DIFFICULTY_COLORS[question.difficulty]
          )}
        >
          {DIFFICULTY_LABELS[question.difficulty] ?? question.difficulty}
        </span>
      </div>

      {/* Question — fade/slide animation on question change */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5"
        >
          <div className="mb-4 text-base font-semibold leading-relaxed">
            {renderQuestionBlock(question.question)}
          </div>

          {/* Answer Area */}
          {question.type === "single" && (
            <SingleChoice
              question={question}
              selectedOption={answer?.selectedOptions?.[0] ?? null}
              isRevealed={isRevealed}
              onSelect={(index) =>
                onAnswer({
                  questionId: question.id,
                  type: "single",
                  selectedOptions: [index],
                })
              }
            />
          )}

          {question.type === "fill-in" && (
            <FillIn
              question={question}
              answers={answer?.fillInAnswers ?? {}}
              isRevealed={isRevealed}
              onChange={(blankId, value) =>
                onAnswer({
                  questionId: question.id,
                  type: "fill-in",
                  fillInAnswers: {
                    ...(answer?.fillInAnswers ?? {}),
                    [blankId]: value,
                  },
                })
              }
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Explanation */}
      {isRevealed && <Explanation text={question.explanation} />}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {!isRevealed && (
          <button
            disabled={!canReveal}
            onClick={onReveal}
            className={cn(
              "rounded-lg px-5 py-2.5 text-sm font-medium transition-all",
              canReveal
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "cursor-not-allowed bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
            )}
          >
            確認答案 / Confirm
          </button>
        )}
        {isRevealed && (
          <button
            onClick={onNext}
            className="rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-blue-600"
          >
            {isLast ? "查看結果 / Results" : "下一題 / Next →"}
          </button>
        )}
      </div>
    </div>
  );
}
