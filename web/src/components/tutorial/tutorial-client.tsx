"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ChevronUp } from "lucide-react";
import { StepNav } from "./step-nav";
import { ConceptPanel } from "./concept-panel";
import { CodeBlock } from "./code-block";
import { cn } from "@/lib/utils";
import type { TutorialSession } from "@/data/tutorials/types";

interface TutorialClientProps {
  tutorial: TutorialSession;
  locale: string;
}

export function TutorialClient({ tutorial, locale }: TutorialClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const shouldReduceMotion = useReducedMotion();

  const currentStep = tutorial.steps[currentIndex];
  const totalSteps = tutorial.steps.length;

  function goTo(index: number) {
    if (index < 0 || index >= totalSteps) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }

  const variants = {
    enter: (dir: number) => ({
      x: shouldReduceMotion ? 0 : dir * 40,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      x: shouldReduceMotion ? 0 : dir * -40,
      opacity: 0,
    }),
  };

  return (
    <div className="flex min-h-[calc(100vh-56px-64px)] flex-col">
      {/* Mobile progress bar */}
      <div className="h-1 w-full bg-zinc-200 dark:bg-zinc-800 lg:hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Mobile step dots */}
      <div className="flex justify-center gap-1.5 py-3 lg:hidden">
        {tutorial.steps.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`跳至第 ${i + 1} 步`}
            className={cn(
              "h-2 rounded-full transition-all",
              i === currentIndex
                ? "w-6 bg-blue-500"
                : i < currentIndex
                ? "w-2 bg-emerald-400"
                : "w-2 bg-zinc-300 dark:bg-zinc-700"
            )}
          />
        ))}
      </div>

      {/* Main layout */}
      <div className="flex flex-1">
        {/* Left: Step nav (desktop) */}
        <StepNav
          steps={tutorial.steps}
          currentIndex={currentIndex}
          onSelect={goTo}
          sessionTitle={tutorial.title}
        />

        {/* Center: Content */}
        <main
          className="flex-1 overflow-hidden"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="mx-auto max-w-2xl px-6 py-8 md:px-12 md:py-10">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                {/* Step header */}
                <div className="mb-6">
                  <p className="mb-1 text-xs font-medium uppercase tracking-wider text-blue-500">
                    第 {currentIndex + 1} 步 / 共 {totalSteps} 步
                  </p>
                  <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                    {currentStep.title}
                  </h1>
                </div>

                {/* Markdown content */}
                <div
                  className="prose-custom mb-6"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(currentStep.content) }}
                />

                {/* Code block */}
                {currentStep.code && (
                  <div className="mb-6">
                    <CodeBlock
                      code={currentStep.code}
                      language={currentStep.codeLanguage}
                      highlightLines={currentStep.codeHighlightLines}
                    />
                  </div>
                )}

                {/* Mobile concept panel */}
                {currentStep.concept && (
                  <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30 lg:hidden">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-500">
                      關鍵概念 / Key Concept
                    </p>
                    <p className="mb-0.5 text-sm font-semibold text-blue-700 dark:text-blue-400">
                      {currentStep.concept.title}
                    </p>
                    <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {currentStep.concept.body}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Right: Concept panel (desktop) */}
        <ConceptPanel concept={currentStep.concept} />
      </div>

      {/* Bottom navigation */}
      <nav
        aria-label="步驟導航"
        className="sticky bottom-0 z-10 flex h-16 items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-bg)] px-4 sm:px-8"
      >
        <button
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          className={cn(
            "flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-lg border border-blue-500 px-4 text-sm font-medium text-blue-500 transition-colors",
            "hover:bg-blue-50 dark:hover:bg-blue-950/30",
            "disabled:cursor-not-allowed disabled:border-zinc-300 disabled:text-zinc-300 dark:disabled:border-zinc-700 dark:disabled:text-zinc-700"
          )}
          aria-label="上一步"
        >
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">上一步 / Prev</span>
        </button>

        <span className="text-sm text-zinc-400">
          第 {currentIndex + 1} 步 / 共 {totalSteps} 步
        </span>

        {currentIndex < totalSteps - 1 ? (
          <button
            onClick={() => goTo(currentIndex + 1)}
            className="flex min-h-[44px] items-center gap-2 rounded-lg bg-blue-500 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-600"
            aria-label="下一步"
          >
            <span className="hidden sm:inline">下一步 / Next</span>
            <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={() => goTo(0)}
            className="flex min-h-[44px] items-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
            aria-label="回到開始"
          >
            <ChevronUp size={16} />
            <span className="hidden sm:inline">重新開始 / Restart</span>
          </button>
        )}
      </nav>
    </div>
  );
}

// Simple markdown-to-HTML renderer
function renderMarkdown(md: string): string {
  return md
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/^> (.+)$/gm, '<blockquote class="hero-callout"><p>$1</p></blockquote>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/<\/ul>\s*<ul>/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hul]|<block)(.+)/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '');
}
