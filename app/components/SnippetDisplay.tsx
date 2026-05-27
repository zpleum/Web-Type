"use client";
import { motion } from "framer-motion";
import { FiCode } from "react-icons/fi";

interface Props {
  text: string;
  typed: string;
}

export default function SnippetDisplay({ text, typed }: Props) {
  const progress = text.length > 0 ? Math.round((typed.length / text.length) * 100) : 0;

  // Build per-line data with global character indices
  const rawLines = text.split("\n");
  let cur = 0;
  const lines = rawLines.map((content) => {
    const start = cur;
    const newlineIdx = start + content.length; // index of the \n character
    cur = newlineIdx + 1;                      // next line starts after \n
    return { content, start, newlineIdx };
  });

  /** Render a single visible character at global index `idx`. */
  const renderChar = (char: string, idx: number) => {
    const ch = char === " " ? "\u00A0" : char;
    if (idx < typed.length) {
      const correct = typed[idx] === char;
      return (
        <motion.span
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.03 }}
          className={
            correct
              ? "text-emerald-500 dark:text-emerald-400"
              : "text-red-500 dark:text-red-400 bg-red-500/15 rounded-sm"
          }
        >
          {ch}
        </motion.span>
      );
    }
    if (idx === typed.length) {
      return (
        <span key={idx} className="cursor-blink text-muted">
          {ch}
        </span>
      );
    }
    return (
      <span key={idx} className="text-[var(--snippet-pending)]">
        {ch}
      </span>
    );
  };

  /**
   * Render the ↵ newline indicator at the end of a line.
   * – cursor here  → blinking ↵
   * – typed correctly → nothing (the visual line-break is enough)
   * – typed incorrectly → red ↵
   * – future → nothing
   */
  const renderNewlineIndicator = (nlIdx: number, isLastLine: boolean) => {
    if (isLastLine) return null;
    if (nlIdx < typed.length) {
      if (typed[nlIdx] === "\n") return null; // correct → invisible
      return (
        <span className="text-red-500 dark:text-red-400 bg-red-500/15 rounded-sm text-[10px] align-middle ml-0.5">
          ↵
        </span>
      );
    }
    if (nlIdx === typed.length) {
      return (
        <span className="cursor-blink text-muted/60 text-[10px] align-middle ml-0.5">
          ↵
        </span>
      );
    }
    return null; // future — line-break is visual
  };

  return (
    <div className="code-panel rounded-xl overflow-hidden mb-4">
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-[var(--code-header)]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          <span className="ml-2 flex items-center gap-1.5 text-[11px] font-medium text-muted">
            <FiCode className="w-3 h-3" />
            Target snippet
          </span>
        </div>
        <span className="text-[10px] font-medium text-muted tabular-nums">{progress}%</span>
      </div>

      {/* Code body — gutter + content side-by-side */}
      <div className="flex font-mono text-[13px] sm:text-[14px] leading-relaxed tracking-wide select-none min-h-[80px]">

        {/* ── Line-number gutter (VS Code style) ── */}
        <div className="flex-none border-r border-border/40 bg-[var(--code-header)]/40 py-4 pl-3 pr-3 text-right">
          {lines.map((line, i) => {
            // Highlight the line number where the cursor currently sits
            const isActive =
              typed.length >= line.start && typed.length <= line.newlineIdx;
            return (
              <div
                key={i}
                className={`leading-relaxed text-[13px] sm:text-[14px] tabular-nums transition-colors duration-150 ${
                  isActive
                    ? "text-foreground/80 font-semibold"
                    : "text-muted/40"
                }`}
              >
                {i + 1}
              </div>
            );
          })}
        </div>

        {/* ── Code content ── */}
        <div className="flex-1 min-w-0 overflow-x-auto py-4 px-4">
          {lines.map((line, lineIdx) => (
            <div key={lineIdx} className="leading-relaxed whitespace-pre">
              {/* Characters on this line */}
              {line.content.split("").map((char, charIdx) =>
                renderChar(char, line.start + charIdx)
              )}
              {/* ↵ indicator at end of line (not shown for last line) */}
              {renderNewlineIndicator(line.newlineIdx, lineIdx === lines.length - 1)}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
