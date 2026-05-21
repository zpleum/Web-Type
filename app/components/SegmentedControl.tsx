"use client";
import { motion } from "framer-motion";

type Option<T extends string> = { id: T; label: string; icon?: React.ReactNode };

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  layoutId,
  variant = "inline",
}: {
  options: Option<T>[];
  value: T;
  onChange: (id: T) => void;
  layoutId: string;
  /** inline: row · grid: 4 columns · grid2: 2 columns · stack: vertical list */
  variant?: "inline" | "grid" | "grid2" | "stack";
}) {
  const isGrid = variant === "grid";
  const isGrid2 = variant === "grid2";
  const isStack = variant === "stack";

  return (
    <div
      className={
        isStack
          ? "flex flex-col gap-1 p-1.5 rounded-xl bg-surface-2 border border-border w-full"
          : isGrid2
            ? "grid grid-cols-2 gap-1 p-1.5 rounded-xl bg-surface-2 border border-border w-full"
            : isGrid
              ? "grid grid-cols-4 gap-1 p-1.5 rounded-xl bg-surface-2 border border-border w-full"
              : "inline-flex p-1 rounded-xl bg-surface-2 border border-border gap-0.5 flex-wrap"
      }
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            title={opt.label}
            className={`relative flex items-center gap-1 rounded-lg font-medium transition-colors min-w-0 ${
              isStack
                ? "justify-start px-3 py-2 text-xs w-full"
                : isGrid || isGrid2
                  ? "justify-center px-1.5 py-2 text-[11px] sm:text-xs"
                  : "justify-center px-3 py-1.5 text-xs"
            } ${active ? "text-foreground" : "text-muted hover:text-foreground"}`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-lg bg-surface border border-border shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-1 min-w-0 truncate">
              {opt.icon}
              <span className="truncate">{opt.label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
