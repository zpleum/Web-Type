"use client";
import { motion } from "framer-motion";
import { FiCode, FiEye, FiEyeOff } from "react-icons/fi";
import { useRef, useEffect } from "react";

interface Props {
  text: string;
  typed: string;
  blindLines?: boolean[];
  onToggleBlindLine?: (lineIndex: number) => void;
  onSetAllBlind?: (blind: boolean) => void;
}

export default function SnippetDisplay({ text, typed, blindLines = [], onToggleBlindLine, onSetAllBlind }: Props) {
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

  const activeCharRef = useRef<HTMLSpanElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevLineIdxRef = useRef<number>(-1);

  // Find the active line index
  const activeLineIdx = lines.findIndex(
    (line) => typed.length >= line.start && typed.length <= line.newlineIdx
  );

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // 1. If we moved to a new line, auto scroll back to the start (scrollLeft = 0)
    if (activeLineIdx !== prevLineIdxRef.current) {
      container.scrollTo({ left: 0, behavior: "smooth" });
      prevLineIdxRef.current = activeLineIdx;
      return;
    }

    // 2. Otherwise, auto scroll to current word / cursor character
    const activeChar = activeCharRef.current;
    if (!activeChar) return;

    const charRect = activeChar.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Check position of character relative to container viewport
    const relativeLeft = charRect.left - containerRect.left;
    const relativeRight = charRect.right - containerRect.left;
    const padding = 80; // keep 80px space from the edge for readability

    if (relativeRight > containerRect.width - padding) {
      container.scrollTo({
        left: container.scrollLeft + (relativeRight - containerRect.width + padding),
        behavior: "auto"
      });
    } else if (relativeLeft < padding) {
      container.scrollTo({
        left: Math.max(0, container.scrollLeft + relativeLeft - padding),
        behavior: "auto"
      });
    }
  }, [typed.length, activeLineIdx]);

  /** Render a single visible character at global index `idx`. */
  const renderChar = (char: string, idx: number, isBlindLine: boolean) => {
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

    if (isBlindLine) {
      return (
        <span
          key={idx}
          className="inline-block rounded-[2px] bg-surface-2/90 text-transparent shadow-inner shadow-black/10"
        >
          {ch}
        </span>
      );
    }

    if (idx === typed.length) {
      return (
        <span key={idx} ref={activeCharRef} className="cursor-blink text-muted">
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
  const renderNewlineIndicator = (nlIdx: number, isLastLine: boolean, isBlindLine: boolean) => {
    if (isLastLine) return null;
    if (isBlindLine) {
      return (
        <span className="inline-block rounded-[2px] bg-surface-2/90 text-transparent text-[10px] align-middle ml-0.5">
          ↵
        </span>
      );
    }
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            title={blindLines.some(Boolean) ? "Show all lines" : "Blind all lines"}
            onClick={() => onSetAllBlind?.(!blindLines.some(Boolean))}
            className="rounded-md border border-border bg-surface-2 p-1.5 text-muted hover:bg-surface-3 transition-colors"
          >
            {blindLines.some(Boolean) ? <FiEye className="w-3.5 h-3.5" /> : <FiEyeOff className="w-3.5 h-3.5" />}
          </button>
          <span className="text-[10px] font-medium text-muted tabular-nums">{progress}%</span>
        </div>
      </div>

      {/* Code body — gutter + content side-by-side */}
      <div className="flex font-mono text-[13px] sm:text-[14px] leading-relaxed tracking-wide select-none min-h-[80px]">

        {/* ── Line-number gutter (VS Code style) ── */}
        <div className="flex-none border-r border-border/40 bg-[var(--code-header)]/40 py-4 pl-3 pr-3">
          {lines.map((line, i) => {
            const isActive =
              typed.length >= line.start && typed.length <= line.newlineIdx;
            const isBlindLine = blindLines[i] ?? false;
            return (
              <div
                key={i}
                className="flex items-center justify-end gap-2 leading-relaxed text-[13px] sm:text-[14px] tabular-nums transition-colors duration-150"
              >
                <button
                  type="button"
                  title={isBlindLine ? `Show line ${i + 1}` : `Blind line ${i + 1}`}
                  onClick={() => onToggleBlindLine?.(i)}
                  className="shrink-0 p-0 text-muted/70 hover:text-foreground transition-colors"
                  aria-label={isBlindLine ? `Reveal line ${i + 1}` : `Blind line ${i + 1}`}
                >
                  {isBlindLine ? <FiEye className="w-3 h-3" /> : <FiEyeOff className="w-3 h-3" />}
                </button>
                <span className={isActive ? "text-foreground/80 font-semibold" : "text-muted/40"}>
                  {i + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Code content ── */}
        <div ref={scrollContainerRef} className="flex-1 min-w-0 overflow-x-auto py-4 px-4">
          {lines.map((line, lineIdx) => {
            const isBlindLine = blindLines[lineIdx] ?? false;
            return (
              <div key={lineIdx} className="leading-relaxed whitespace-pre">
                {line.content.split("").map((char, charIdx) =>
                  renderChar(char, line.start + charIdx, isBlindLine)
                )}
                {renderNewlineIndicator(line.newlineIdx, lineIdx === lines.length - 1, isBlindLine)}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
