"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Play, Pause, RotateCcw, Trash2, Brain, Wrench, MessageSquare,
  ArrowRight, Zap, Settings2, ChevronDown, ChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---
type MessageRole = "user" | "assistant" | "tool_call" | "tool_result";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  toolName?: string;
  expanded: boolean;
}

type LoopNodeId = "user_input" | "llm_call" | "tool_dispatch" | "tool_exec" | "tool_result" | "stop_check" | "output";

interface LoopNode {
  id: LoopNodeId;
  label: string;
  labelEn: string;
  color: string;
  icon: typeof Brain;
  angle: number; // degrees in circle
}

// --- Agent Loop nodes (circular layout) ---
const LOOP_NODES: LoopNode[] = [
  { id: "user_input",    label: "使用者輸入",  labelEn: "User Input",     color: "#3B82F6", icon: MessageSquare, angle: 270 },
  { id: "llm_call",      label: "呼叫 LLM",    labelEn: "Call LLM",       color: "#8B5CF6", icon: Brain,         angle: 330 },
  { id: "stop_check",    label: "stop_reason?", labelEn: "stop_reason?",   color: "#F59E0B", icon: Zap,           angle: 30  },
  { id: "tool_dispatch", label: "工具分發",    labelEn: "Dispatch Tool",  color: "#10B981", icon: Settings2,     angle: 90  },
  { id: "tool_exec",     label: "執行工具",    labelEn: "Execute Tool",   color: "#10B981", icon: Wrench,        angle: 150 },
  { id: "tool_result",   label: "回傳結果",    labelEn: "Feed Result",    color: "#3B82F6", icon: ArrowRight,    angle: 210 },
  { id: "output",        label: "輸出結果",    labelEn: "Output",         color: "#10B981", icon: MessageSquare, angle: 90  },
];

// Simulation scenario
type ScenarioStep = {
  node: LoopNodeId;
  message?: { role: MessageRole; content: string; toolName?: string };
  annotation: string;
};

function buildScenario(maxIter: number, toolCount: number): ScenarioStep[] {
  const steps: ScenarioStep[] = [
    { node: "user_input", message: { role: "user", content: "幫我分析這個目錄結構 / Analyze this directory structure" }, annotation: "使用者提問" },
    { node: "llm_call", annotation: "LLM 思考中..." },
    { node: "stop_check", annotation: "stop_reason = tool_use → 繼續迴圈" },
  ];

  const tools = toolCount >= 1 ? ["bash: ls -la"] : [];
  if (toolCount >= 2) tools.push("read_file: README.md");
  if (toolCount >= 3) tools.push("bash: cat package.json");

  const iterations = Math.min(maxIter, tools.length || 1);

  for (let i = 0; i < iterations; i++) {
    const toolName = tools[i] || "bash: echo done";
    steps.push(
      { node: "tool_dispatch", message: { role: "tool_call", content: toolName, toolName: toolName.split(":")[0] }, annotation: `工具分發 #${i + 1}` },
      { node: "tool_exec", annotation: "subprocess 執行中..." },
      { node: "tool_result", message: { role: "tool_result", content: `[執行結果 ${i + 1}] output here...` }, annotation: "結果回傳至 messages" },
      { node: "llm_call", annotation: "LLM 再次思考..." },
      { node: "stop_check", annotation: i < iterations - 1 ? "stop_reason = tool_use → 繼續" : "stop_reason = end_turn → 退出迴圈" },
    );
  }

  steps.push(
    { node: "output", message: { role: "assistant", content: "分析完成！共發現 3 個模組，目錄結構清晰。Analysis complete! Found 3 modules with clean structure." }, annotation: "LLM 最終輸出" }
  );

  return steps;
}

// --- Main Playground Page ---
export default function PlaygroundPage() {
  const shouldReduceMotion = useReducedMotion();

  // Parameters
  const [maxIter, setMaxIter] = useState(2);
  const [toolCount, setToolCount] = useState(2);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(true);

  // Simulation state
  const [scenario] = useState(() => buildScenario(3, 3));
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeNode, setActiveNode] = useState<LoopNodeId | null>(null);
  const [speed, setSpeed] = useState(1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const msgScrollRef = useRef<HTMLDivElement>(null);

  const displayScenario = buildScenario(maxIter, toolCount);
  const totalSteps = displayScenario.length;

  function clearTimer() {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  }

  function stepForward() {
    setCurrentStep(prev => {
      const next = prev + 1;
      if (next >= totalSteps) { setIsPlaying(false); return prev; }

      const step = displayScenario[next];
      setActiveNode(step.node);
      if (step.message) {
        setMessages(msgs => [...msgs, {
          id: `${next}`,
          role: step.message!.role,
          content: step.message!.content,
          toolName: step.message!.toolName,
          expanded: false,
        }]);
      }
      return next;
    });
  }

  function reset() {
    clearTimer();
    setIsPlaying(false);
    setCurrentStep(-1);
    setMessages([]);
    setActiveNode(null);
  }

  function toggleExpand(id: string) {
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, expanded: !m.expanded } : m));
  }

  useEffect(() => {
    if (isPlaying && currentStep < totalSteps - 1) {
      timerRef.current = setTimeout(stepForward, 1200 / speed);
    } else if (currentStep >= totalSteps - 1) {
      setIsPlaying(false);
    }
    return clearTimer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentStep, speed, totalSteps]);

  // Auto-scroll messages
  useEffect(() => {
    if (msgScrollRef.current) {
      msgScrollRef.current.scrollTo({ top: msgScrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages.length]);

  const ROLE_COLORS: Record<MessageRole, string> = {
    user: "#3B82F6",
    assistant: "#10B981",
    tool_call: "#8B5CF6",
    tool_result: "#F59E0B",
  };

  const ROLE_LABELS: Record<MessageRole, string> = {
    user: "USER",
    assistant: "ASSISTANT",
    tool_call: "TOOL CALL",
    tool_result: "TOOL RESULT",
  };

  // Circle layout
  const CIRCLE_R = 180;
  const CENTER = 240;
  const SVG_SIZE = CENTER * 2;

  const mainNodes = LOOP_NODES.filter(n => n.id !== "output");

  return (
    <div className="flex flex-col gap-0">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Playground — Agent Loop 視覺化 / Agent Loop Visualizer
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          互動式模擬 Agent Loop 的運作過程，調整參數觀察行為變化。
          / Interactively simulate the Agent Loop, adjust parameters to observe behavior.
        </p>
      </div>

      {/* Parameter control panel */}
      <div className="mb-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-6 py-4">
        <div className="flex flex-wrap items-center gap-6 overflow-x-auto">
          {/* Max iterations */}
          <div className="flex min-w-[160px] items-center gap-3">
            <label className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
              最大迭代 / Max Iter
            </label>
            <input
              type="range" min={1} max={3} step={1} value={maxIter}
              onChange={e => { reset(); setMaxIter(Number(e.target.value)); }}
              className="h-1 flex-1 cursor-pointer accent-blue-500"
              aria-label="最大迭代次數"
            />
            <span className="w-6 text-center text-sm font-semibold">{maxIter}</span>
          </div>

          {/* Tool count */}
          <div className="flex min-w-[160px] items-center gap-3">
            <label className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
              工具數量 / Tools
            </label>
            <input
              type="range" min={1} max={3} step={1} value={toolCount}
              onChange={e => { reset(); setToolCount(Number(e.target.value)); }}
              className="h-1 flex-1 cursor-pointer accent-blue-500"
              aria-label="工具數量"
            />
            <span className="w-6 text-center text-sm font-semibold">{toolCount}</span>
          </div>

          {/* Speed */}
          <div className="flex min-w-[160px] items-center gap-3">
            <label className="text-xs text-zinc-500 dark:text-zinc-400 shrink-0">
              速度 / Speed
            </label>
            <input
              type="range" min={0.5} max={4} step={0.5} value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
              className="h-1 flex-1 cursor-pointer accent-blue-500"
              aria-label="播放速度"
            />
            <span className="w-8 text-center text-sm font-semibold">{speed}x</span>
          </div>

          {/* Toggles */}
          <div className="flex items-center gap-4 ml-auto">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">標註 / Annot</span>
              <button
                role="switch"
                aria-checked={showAnnotations}
                onClick={() => setShowAnnotations(!showAnnotations)}
                className={cn(
                  "relative h-[22px] w-10 rounded-full transition-colors duration-200",
                  showAnnotations ? "bg-blue-500" : "bg-zinc-300 dark:bg-zinc-600"
                )}
              >
                <span className={cn(
                  "absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow transition-transform duration-200",
                  showAnnotations ? "translate-x-[19px]" : "translate-x-0.5"
                )} />
              </button>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">自動 / Auto</span>
              <button
                role="switch"
                aria-checked={autoPlay}
                onClick={() => setAutoPlay(!autoPlay)}
                className={cn(
                  "relative h-[22px] w-10 rounded-full transition-colors duration-200",
                  autoPlay ? "bg-blue-500" : "bg-zinc-300 dark:bg-zinc-600"
                )}
              >
                <span className={cn(
                  "absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow transition-transform duration-200",
                  autoPlay ? "translate-x-[19px]" : "translate-x-0.5"
                )} />
              </button>
            </label>
          </div>
        </div>
      </div>

      {/* Main visualization area */}
      <div className="mb-6 overflow-hidden rounded-xl border border-[var(--color-border)]">
        {/* Play controls */}
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3">
          {isPlaying ? (
            <button
              onClick={() => setIsPlaying(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
              aria-label="暫停"
            >
              <Pause size={16} />
            </button>
          ) : (
            <button
              onClick={() => { if (currentStep >= totalSteps - 1) reset(); setIsPlaying(true); }}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900"
              aria-label="播放"
            >
              <Play size={16} />
            </button>
          )}
          <button
            onClick={stepForward}
            disabled={currentStep >= totalSteps - 1}
            className="flex h-9 items-center gap-1.5 rounded-lg border border-[var(--color-border)] px-3 text-sm transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:hover:bg-zinc-800"
            aria-label="單步"
          >
            單步 / Step
          </button>
          <button
            onClick={reset}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="重置"
          >
            <RotateCcw size={16} />
          </button>
          <span className="ml-auto text-xs tabular-nums text-[var(--color-text-secondary)]">
            {Math.max(0, currentStep + 1)} / {totalSteps} 步
          </span>
        </div>

        {/* Circle visualization */}
        <div className="flex items-center justify-center py-8 bg-[var(--color-bg)]">
          <div className="relative" style={{ width: SVG_SIZE, height: SVG_SIZE, maxWidth: "100%" }}>
            <svg
              viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
              className="absolute inset-0 w-full h-full"
              aria-hidden="true"
            >
              {/* Circle path */}
              <circle
                cx={CENTER} cy={CENTER} r={CIRCLE_R}
                fill="none" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="4 4"
              />

              {/* Arrows between nodes */}
              {mainNodes.map((node, i) => {
                const next = mainNodes[(i + 1) % mainNodes.length];
                const a1 = (node.angle * Math.PI) / 180;
                const a2 = (next.angle * Math.PI) / 180;
                const x1 = CENTER + CIRCLE_R * Math.cos(a1);
                const y1 = CENTER + CIRCLE_R * Math.sin(a1);
                const x2 = CENTER + CIRCLE_R * Math.cos(a2);
                const y2 = CENTER + CIRCLE_R * Math.sin(a2);
                const mx = (x1 + x2) / 2;
                const my = (y1 + y2) / 2;
                const dx = x2 - x1;
                const dy = y2 - y1;
                const len = Math.sqrt(dx * dx + dy * dy);
                const nx = -dy / len * 20;
                const ny = dx / len * 20;

                const isActive = activeNode === next.id;
                return (
                  <path
                    key={node.id}
                    d={`M${x1},${y1} Q${mx + nx},${my + ny} ${x2},${y2}`}
                    fill="none"
                    stroke={isActive ? "#3B82F6" : "var(--color-border)"}
                    strokeWidth={isActive ? 2 : 1}
                    strokeDasharray={isActive ? "0" : "4 4"}
                    markerEnd="url(#arrowhead)"
                    style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
                  />
                );
              })}

              {/* Arrow marker */}
              <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <polygon points="0 0, 8 3, 0 6" fill="#9CA3AF" />
                </marker>
              </defs>
            </svg>

            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">Agent</p>
                <p className="text-sm text-zinc-500">Loop</p>
              </div>
            </div>

            {/* Nodes */}
            {mainNodes.map((node) => {
              const angle = (node.angle * Math.PI) / 180;
              const x = CENTER + CIRCLE_R * Math.cos(angle);
              const y = CENTER + CIRCLE_R * Math.sin(angle);
              const isActive = activeNode === node.id;
              const Icon = node.icon;

              return (
                <motion.div
                  key={node.id}
                  animate={isActive && !shouldReduceMotion ? {
                    scale: 1.15,
                  } : { scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute"
                  style={{
                    left: x - 28,
                    top: y - 28,
                    width: 56,
                    height: 56,
                  }}
                >
                  <div
                    className={cn(
                      "flex h-full w-full flex-col items-center justify-center rounded-full text-white transition-all duration-300",
                      isActive ? "shadow-lg ring-4 ring-blue-400/30" : "shadow-sm"
                    )}
                    style={{ backgroundColor: isActive ? node.color : `${node.color}88` }}
                    title={node.label}
                  >
                    <Icon size={16} />
                  </div>
                </motion.div>
              );
            })}

            {/* Node labels (outside circle) */}
            {mainNodes.map((node) => {
              const angle = (node.angle * Math.PI) / 180;
              const labelR = CIRCLE_R + 50;
              const x = CENTER + labelR * Math.cos(angle);
              const y = CENTER + labelR * Math.sin(angle);
              const isActive = activeNode === node.id;

              return (
                <div
                  key={`label-${node.id}`}
                  className="absolute pointer-events-none"
                  style={{
                    left: x - 48,
                    top: y - 18,
                    width: 96,
                    textAlign: "center",
                  }}
                >
                  <span className={cn(
                    "text-[10px] font-medium leading-tight",
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-500 dark:text-zinc-400"
                  )}>
                    {node.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Current step annotation */}
        <AnimatePresence mode="wait">
          {showAnnotations && currentStep >= 0 && currentStep < totalSteps && (
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2.5"
            >
              <p className="text-center text-sm text-[var(--color-text-secondary)]">
                <span className="font-mono text-blue-500">
                  {displayScenario[currentStep]?.node}
                </span>
                {" → "}
                {displayScenario[currentStep]?.annotation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Message stack */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            訊息流 / Message Stream
          </p>
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            aria-label="清除訊息"
          >
            <Trash2 size={12} />
            清除 / Clear
          </button>
        </div>

        {/* Messages */}
        <div
          ref={msgScrollRef}
          className="flex max-h-72 min-h-[80px] flex-col gap-2 overflow-y-auto p-3"
        >
          {messages.length === 0 && (
            <p className="py-6 text-center text-sm text-[var(--color-text-secondary)]">
              按「播放」或「單步」開始模擬 / Press Play or Step to start
            </p>
          )}
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)]"
                style={{ borderLeftWidth: 4, borderLeftColor: ROLE_COLORS[msg.role] }}
              >
                {/* Collapsed header */}
                <button
                  onClick={() => toggleExpand(msg.id)}
                  className="flex w-full items-center justify-between px-3 py-2.5 text-left"
                  aria-expanded={msg.expanded}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold uppercase"
                      style={{ color: ROLE_COLORS[msg.role] }}
                    >
                      {ROLE_LABELS[msg.role]}
                      {msg.toolName && (
                        <span className="ml-1.5 font-mono text-zinc-400">
                          · {msg.toolName}
                        </span>
                      )}
                    </span>
                    <span className="max-w-xs truncate text-xs text-zinc-600 dark:text-zinc-400">
                      {msg.content}
                    </span>
                  </div>
                  {msg.expanded ? (
                    <ChevronUp size={14} className="shrink-0 text-zinc-400" />
                  ) : (
                    <ChevronDown size={14} className="shrink-0 text-zinc-400" />
                  )}
                </button>

                {/* Expanded body */}
                <AnimatePresence>
                  {msg.expanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <div className="border-t border-[var(--color-border)] px-3 py-2.5">
                        <p className="text-sm text-[var(--color-text)]">{msg.content}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Stats */}
        {messages.length > 0 && (
          <div className="border-t border-[var(--color-border)] px-4 py-2">
            <p className="text-xs text-zinc-400">
              共 {messages.length} 則訊息 / {messages.length} messages in context
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
