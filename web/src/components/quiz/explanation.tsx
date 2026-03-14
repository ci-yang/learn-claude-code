"use client";

interface ExplanationProps {
  text: string;
}

export function Explanation({ text }: ExplanationProps) {
  // Simple markdown-like rendering for code blocks and bold text
  const renderLine = (line: string, lineIndex: number) => {
    // Code block line (inside ``` block)
    if (line.startsWith("    ") || line.startsWith("\t")) {
      return (
        <span key={lineIndex} className="block font-mono text-xs text-zinc-300">
          {line}
        </span>
      );
    }

    // Render inline code and bold
    const parts = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return (
      <span key={lineIndex} className="block">
        {parts.map((part, i) => {
          if (part.startsWith("`") && part.endsWith("`")) {
            return (
              <code
                key={i}
                className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-pink-300"
              >
                {part.slice(1, -1)}
              </code>
            );
          }
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={i} className="font-semibold text-white">
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  const lines = text.split("\n");
  const blocks: React.ReactNode[] = [];
  let codeLines: string[] = [];
  let inCodeBlock = false;
  let blockIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        blocks.push(
          <pre
            key={blockIndex++}
            className="my-2 overflow-x-auto rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-xs leading-relaxed"
          >
            <code className="text-zinc-300">{codeLines.join("\n")}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
    } else if (inCodeBlock) {
      codeLines.push(line);
    } else if (line.trim() === "") {
      blocks.push(<br key={blockIndex++} />);
    } else {
      blocks.push(
        <p key={blockIndex++} className="text-sm leading-relaxed text-zinc-300">
          {renderLine(line, 0)}
        </p>
      );
    }
  }

  return (
    <div className="rounded-lg border border-blue-500/30 bg-blue-950/20 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-blue-400 text-sm font-semibold">解說</span>
      </div>
      <div className="space-y-1">{blocks}</div>
    </div>
  );
}
