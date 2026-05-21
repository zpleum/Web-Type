"use client";
import { motion } from "framer-motion";
import { FiCode } from "react-icons/fi";

interface Props {
  text: string;
  typed: string;
}

export default function SnippetDisplay({ text, typed }: Props) {
  const progress = text.length > 0 ? Math.round((typed.length / text.length) * 100) : 0;

  return (
    <div className="code-panel rounded-xl overflow-hidden mb-4">
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
      <div className="font-mono text-[13px] sm:text-[15px] leading-relaxed tracking-wide p-4 sm:p-6 break-all select-none min-h-[80px]">
        {text.split("").map((char, i) => {
          const ch = char === " " ? "\u00A0" : char;
          if (i < typed.length) {
            const correct = typed[i] === char;
            return (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.03 }}
                className={correct ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400 bg-red-500/15 rounded-sm"}
              >
                {ch}
              </motion.span>
            );
          }
          if (i === typed.length) {
            return (
              <span key={i} className="cursor-blink text-muted">
                {ch}
              </span>
            );
          }
          return (
            <span key={i} className="text-[var(--snippet-pending)]">
              {ch}
            </span>
          );
        })}
      </div>
    </div>
  );
}
