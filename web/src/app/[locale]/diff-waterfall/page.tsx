"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ChevronDown, ChevronUp, Plus, Minus, Code2,
  Wrench, Box, FunctionSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SESSION_DIFFS } from "@/data/comparisons";
import { LAYERS } from "@/lib/constants";

const LAYER_COLORS: Record<string, string> = {
  tools: "#3B82F6",
  planning: "#10B981",
  memory: "#8B5CF6",
  concurrency: "#F59E0B",
  collaboration: "#EF4444",
};

const LAYER_LABELS: Record<string, string> = {
  tools: "Tools",
  planning: "Planning",
  memory: "Memory",
  concurrency: "Concurrency",
  collaboration: "Collaboration",
};

export default function DiffWaterfallPage() {
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set(["s01"]));
  const [filterLayer, setFilterLayer] = useState<string>("all");
  const shouldReduceMotion = useReducedMotion();

  function toggle(session: string) {
    setExpandedSessions(prev => {
      const next = new Set(prev);
      if (next.has(session)) {
        next.delete(session);
      } else {
        next.add(session);
      }
      return next;
    });
  }

  function expandAll() {
    setExpandedSessions(new Set(SESSION_DIFFS.map(d => d.session)));
  }

  function collapseAll() {
    setExpandedSessions(new Set());
  }

  const filtered = filterLayer === "all"
    ? SESSION_DIFFS
    : SESSION_DIFFS.filter(d => d.layer === filterLayer);

  return (
    <div className="py-4">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          12 Session Diff 瀑布流 / Session Diff Waterfall
        </h1>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">
          12 個 Session 的演化歷程，高亮每次新增的程式碼。
          / The evolution across 12 sessions, highlighting code additions.
        </p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {/* Layer filter */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilterLayer("all")}
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium transition-colors",
              filterLayer === "all"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "border border-[var(--color-border)] text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            )}
          >
            全部 / All
          </button>
          {LAYERS.map(layer => (
            <button
              key={layer.id}
              onClick={() => setFilterLayer(layer.id)}
              className={cn(
                "rounded-full px-3 py-1 text-sm font-medium transition-colors",
                filterLayer === layer.id
                  ? "text-white"
                  : "border border-[var(--color-border)] text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
              style={filterLayer === layer.id ? { backgroundColor: layer.color } : {}}
            >
              {LAYER_LABELS[layer.id]}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-2">
          <button
            onClick={expandAll}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <ChevronDown size={12} />
            全部展開 / Expand All
          </button>
          <button
            onClick={collapseAll}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <ChevronUp size={12} />
            全部摺疊 / Collapse All
          </button>
        </div>
      </div>

      {/* Waterfall list */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-[23px] top-0 bottom-0 w-px bg-[var(--color-border)]" />

        <div className="space-y-3">
          {filtered.map((diff, i) => {
            const isExpanded = expandedSessions.has(diff.session);
            const layerColor = LAYER_COLORS[diff.layer];

            return (
              <motion.div
                key={diff.session}
                initial={shouldReduceMotion ? {} : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="relative pl-12"
              >
                {/* Timeline dot */}
                <div
                  className="absolute left-4 top-5 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white shadow dark:border-zinc-900"
                  style={{ backgroundColor: layerColor }}
                />

                {/* Card */}
                <div className={cn(
                  "overflow-hidden rounded-xl border transition-shadow",
                  isExpanded
                    ? "border-[var(--color-border)] shadow-md"
                    : "border-[var(--color-border)] shadow-sm hover:shadow-md"
                )}>
                  {/* Card header */}
                  <button
                    onClick={() => toggle(diff.session)}
                    className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    aria-expanded={isExpanded}
                  >
                    {/* Session badge */}
                    <span className="shrink-0 font-mono text-xs font-bold text-zinc-400">
                      {diff.session.toUpperCase()}
                    </span>

                    {/* Title */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                          {diff.title} / {diff.titleEn}
                        </span>
                        {/* Layer badge */}
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                          style={{ backgroundColor: layerColor }}
                        >
                          {LAYER_LABELS[diff.layer]}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                        {diff.keyChange}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="hidden items-center gap-3 sm:flex">
                      <span className={cn(
                        "flex items-center gap-1 text-xs font-medium",
                        diff.locDelta > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"
                      )}>
                        <Plus size={11} />
                        {diff.locDelta} LOC
                      </span>
                      {diff.newTools.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-blue-500">
                          <Wrench size={11} />
                          {diff.newTools.length}
                        </span>
                      )}
                      {diff.newClasses.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-purple-500">
                          <Box size={11} />
                          {diff.newClasses.length}
                        </span>
                      )}
                      {diff.newFunctions.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-amber-500">
                          <FunctionSquare size={11} />
                          {diff.newFunctions.length}
                        </span>
                      )}
                    </div>

                    {/* Expand icon */}
                    <ChevronDown
                      size={16}
                      className={cn(
                        "shrink-0 text-zinc-400 transition-transform duration-200",
                        isExpanded ? "rotate-180" : ""
                      )}
                    />
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                      >
                        <div className="border-t border-[var(--color-border)] px-5 py-4">
                          {/* Stats row */}
                          <div className="mb-4 flex flex-wrap gap-2">
                            <StatChip
                              icon={<Plus size={11} />}
                              label={`+${diff.locDelta} 行 / lines`}
                              color="emerald"
                            />
                            {diff.newTools.map(t => (
                              <StatChip key={t} icon={<Wrench size={11} />} label={t} color="blue" />
                            ))}
                            {diff.newClasses.map(c => (
                              <StatChip key={c} icon={<Box size={11} />} label={c} color="purple" />
                            ))}
                            {diff.newFunctions.map(f => (
                              <StatChip key={f} icon={<FunctionSquare size={11} />} label={f} color="amber" />
                            ))}
                          </div>

                          {/* Code diff */}
                          {diff.codeSnippet && (
                            <div className="space-y-3">
                              {/* Before */}
                              {diff.codeSnippet.before && (
                                <div>
                                  <div className="mb-1.5 flex items-center gap-2">
                                    <Minus size={12} className="text-red-400" />
                                    <span className="text-xs font-medium text-red-500">之前 / Before</span>
                                  </div>
                                  <DiffCodeBlock
                                    code={diff.codeSnippet.before}
                                    language={diff.codeSnippet.language}
                                    variant="removed"
                                  />
                                </div>
                              )}

                              {/* After */}
                              <div>
                                <div className="mb-1.5 flex items-center gap-2">
                                  <Plus size={12} className="text-emerald-500" />
                                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                    {diff.codeSnippet.before ? "之後 / After" : "新增 / Added"}
                                  </span>
                                  <span className="ml-auto text-xs text-zinc-400">
                                    {diff.codeSnippet.description}
                                  </span>
                                </div>
                                <DiffCodeBlock
                                  code={diff.codeSnippet.after}
                                  language={diff.codeSnippet.language}
                                  variant="added"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---

function StatChip({
  icon,
  label,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  color: "emerald" | "blue" | "purple" | "amber";
}) {
  const colorMap = {
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  };

  return (
    <span className={cn(
      "flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
      colorMap[color]
    )}>
      {icon}
      {label}
    </span>
  );
}

function DiffCodeBlock({
  code,
  language,
  variant,
}: {
  code: string;
  language: string;
  variant: "added" | "removed";
}) {
  const lines = code.split("\n");
  const bgClass = variant === "added"
    ? "bg-[#0f172a]"
    : "bg-[#1a0a0a]";
  const linePrefix = variant === "added" ? "+" : "-";
  const prefixColor = variant === "added" ? "text-emerald-500" : "text-red-400";
  const lineBg = variant === "added"
    ? "hover:bg-emerald-500/5"
    : "hover:bg-red-500/5";

  return (
    <div className={cn("overflow-hidden rounded-xl border border-zinc-800", bgClass)}>
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-1.5">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-400">
          <Code2 size={11} />
          {language}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className={lineBg}>
                <td className={cn(
                  "select-none py-0.5 pl-3 pr-2 text-[11px] font-mono",
                  prefixColor
                )}>
                  {linePrefix}
                </td>
                <td className="select-none py-0.5 pr-3 text-right text-[11px] font-mono text-zinc-600">
                  {i + 1}
                </td>
                <td className="py-0.5 pr-4 font-mono text-[12px] leading-relaxed text-zinc-200">
                  <pre className="whitespace-pre">{line || " "}</pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
