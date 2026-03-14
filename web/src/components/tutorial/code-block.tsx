"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  highlightLines?: number[];
}

export function CodeBlock({ code, language = "python", highlightLines = [] }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  const lines = code.split("\n");

  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-[#0f172a]">
      {/* Language label + Copy button */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-zinc-400 transition-colors hover:text-zinc-200"
          aria-label="複製程式碼"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>複製 / Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code with line numbers */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {lines.map((line, i) => {
              const lineNum = i + 1;
              const isHighlighted = highlightLines.includes(lineNum);
              return (
                <tr
                  key={i}
                  className={cn(
                    "font-mono",
                    isHighlighted
                      ? "bg-blue-500/10"
                      : "hover:bg-white/5"
                  )}
                >
                  <td className="select-none py-0.5 pl-4 pr-3 text-right text-[11px] text-zinc-600 dark:text-zinc-600">
                    {lineNum}
                  </td>
                  {isHighlighted && (
                    <td className="w-1 bg-blue-500 py-0.5" />
                  )}
                  {!isHighlighted && (
                    <td className="w-1 py-0.5" />
                  )}
                  <td className="py-0.5 pr-4 text-[13px] leading-relaxed text-zinc-200">
                    <pre className="whitespace-pre">{line || " "}</pre>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
