"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useLocale } from "@/lib/i18n";
import { CHEATSHEET_CARDS } from "@/data/cheatsheet";
import type { CheatSheetCard } from "@/data/cheatsheet";

const LAYER_COLORS: Record<string, string> = {
  tools: "border-blue-500/40 hover:border-blue-500/70",
  planning: "border-emerald-500/40 hover:border-emerald-500/70",
  memory: "border-purple-500/40 hover:border-purple-500/70",
  concurrency: "border-orange-500/40 hover:border-orange-500/70",
  collaboration: "border-red-500/40 hover:border-red-500/70",
};

const LAYER_BADGE_COLORS: Record<string, string> = {
  tools: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  planning: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
  memory: "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400",
  concurrency: "bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400",
  collaboration: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
};

const LAYER_LABELS: Record<string, string> = {
  tools: "工具 / Tools",
  planning: "計劃 / Planning",
  memory: "記憶體 / Memory",
  concurrency: "並發 / Concurrency",
  collaboration: "協作 / Collaboration",
};

const ALL_LAYERS = ["tools", "planning", "memory", "concurrency", "collaboration"] as const;

function CheatCard({ card, locale }: { card: CheatSheetCard; locale: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={cn(
        "rounded-xl border transition-all duration-200",
        "bg-[var(--color-bg)]",
        LAYER_COLORS[card.layer]
      )}
    >
      <div className="p-4">
        {/* Header */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "rounded px-2 py-0.5 text-xs font-medium",
                  LAYER_BADGE_COLORS[card.layer]
                )}
              >
                {LAYER_LABELS[card.layer]}
              </span>
              <Link
                href={`/${locale}/${card.session}`}
                className="text-xs text-[var(--color-text-secondary)] hover:underline"
              >
                {card.session}
              </Link>
            </div>
            <h3 className="mt-1.5 text-base font-bold">{card.pattern}</h3>
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          {card.summary}
        </p>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Toggle code */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
        >
          <span className={cn("transition-transform", expanded ? "rotate-90" : "")}>▶</span>
          <span>{expanded ? "隱藏程式碼 / Hide code" : "查看程式碼 / Show code"}</span>
        </button>
      </div>

      {/* Code block */}
      {expanded && (
        <div className="border-t border-[var(--color-border)]">
          <pre className="overflow-x-auto p-4 text-xs leading-relaxed">
            <code className="text-zinc-300">{card.code}</code>
          </pre>
        </div>
      )}
    </div>
  );
}

export default function CheatsheetPage() {
  const locale = useLocale();
  const [search, setSearch] = useState("");
  const [activeLayer, setActiveLayer] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return CHEATSHEET_CARDS.filter((card) => {
      if (activeLayer && card.layer !== activeLayer) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          card.pattern.toLowerCase().includes(q) ||
          card.summary.toLowerCase().includes(q) ||
          card.tags.some((t) => t.toLowerCase().includes(q)) ||
          card.session.includes(q)
        );
      }
      return true;
    });
  }, [search, activeLayer]);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">速查卡 / Cheat Sheet</h1>
        <p className="mt-2 text-[var(--color-text-secondary)]">
          12 個核心設計模式一覽，包含程式碼片段與首次出現位置 / 12 core design patterns with code snippets
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          placeholder="搜尋模式、標籤... / Search patterns, tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:placeholder:text-zinc-600"
        />
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveLayer(null)}
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium transition-colors",
              activeLayer === null
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
            )}
          >
            全部 / All
          </button>
          {ALL_LAYERS.map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(activeLayer === layer ? null : layer)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                activeLayer === layer
                  ? LAYER_BADGE_COLORS[layer] + " font-semibold"
                  : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]"
              )}
            >
              {LAYER_LABELS[layer]}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-[var(--color-text-secondary)]">
        顯示 / Showing {filtered.length} / {CHEATSHEET_CARDS.length} 張卡 / cards
      </p>

      {/* Cards Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((card) => (
            <CheatCard key={card.id} card={card} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-[var(--color-text-secondary)]">
          <p className="text-lg">沒有符合的速查卡 / No matching cards</p>
          <p className="mt-1 text-sm">試試其他關鍵字 / Try different keywords</p>
        </div>
      )}
    </div>
  );
}
