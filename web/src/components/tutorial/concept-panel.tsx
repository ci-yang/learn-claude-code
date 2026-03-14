"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ExternalLink, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TutorialConcept } from "@/data/tutorials/types";

interface ConceptPanelProps {
  concept: TutorialConcept | undefined;
}

export function ConceptPanel({ concept }: ConceptPanelProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-l border-[var(--color-border)] transition-all duration-200 lg:block",
        collapsed ? "w-10" : "w-72"
      )}
      style={{ position: "sticky", top: "56px", height: "calc(100vh - 56px - 64px)", overflowY: "auto" }}
      aria-label="概念提示面板"
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex h-10 w-10 items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        aria-label={collapsed ? "展開概念面板" : "收合概念面板"}
      >
        <ChevronRight
          size={16}
          className={cn("transition-transform duration-200", collapsed ? "" : "rotate-180")}
        />
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 pb-6"
          >
            {concept ? (
              <div className="space-y-4">
                {/* Key concept */}
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    關鍵概念 / Key Concept
                  </p>
                  <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <Lightbulb size={14} className="text-blue-500" />
                      <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">
                        {concept.title}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                      {concept.body}
                    </p>
                  </div>
                </div>

                {/* Related links */}
                {concept.links && concept.links.length > 0 && (
                  <div>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                      相關連結 / Links
                    </p>
                    <div className="space-y-1">
                      {concept.links.map((link) => (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline dark:text-blue-400"
                        >
                          <ExternalLink size={12} />
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-zinc-400">
                選擇一個步驟查看概念說明 / Select a step to see concept notes
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
