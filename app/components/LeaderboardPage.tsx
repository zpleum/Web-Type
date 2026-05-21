"use client";
import { FiTrash2, FiBarChart2 } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { LeaderboardEntry } from "../lib/types";
import { loadLeaderboard, clearLeaderboard, formatDuration, formatEntryWhen } from "../lib/leaderboard";
import DiffBadge from "./DiffBadge";
import LangBadge from "./LangBadge";
import PageHeader from "./PageHeader";

const medalColor = ["text-amber-500 dark:text-amber-400", "text-muted", "text-amber-700 dark:text-amber-600"];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const row = { hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } };

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [page, setPage] = useState(1);
  const ENTRIES_PER_PAGE = 10;
  const pageCount = Math.ceil(entries.length / ENTRIES_PER_PAGE) || 1;
  const pagedEntries = entries.slice((page - 1) * ENTRIES_PER_PAGE, page * ENTRIES_PER_PAGE);

  useEffect(() => {
    setEntries(loadLeaderboard());
    setPage(1);
  }, []);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const clear = () => {
    if (confirm("Clear all leaderboard entries?")) {
      clearLeaderboard();
      setEntries([]);
      setPage(1);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <PageHeader
        title="Leaderboard"
        description="Your top 50 sessions saved in this browser. Ranked by WPM — includes session time and when you played."
        action={
          entries.length > 0 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={clear}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-rose-400 border border-rose-500/30 hover:bg-rose-500/10 transition-colors shrink-0"
            >
              <FiTrash2 className="w-4 h-4" />
              Clear all
            </motion.button>
          ) : undefined
        }
      />

      <AnimatePresence mode="wait">
        {entries.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-20 card-glass rounded-2xl"
          >
            <div className="w-14 h-14 rounded-2xl bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4">
              <FiBarChart2 className="w-7 h-7 text-muted" />
            </div>
            <p className="text-muted text-sm">
              No leaderboard entries yet.
              <br />
              Complete a test to save your score.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="table"
            variants={container}
            initial="hidden"
            animate="show"
            className="card-glass rounded-2xl overflow-hidden"
          >
            <div className="hidden sm:grid sm:grid-cols-7 gap-3 px-5 py-3 border-b border-border text-[11px] font-medium text-muted uppercase tracking-widest">
              <span>Rank</span>
              <span>WPM</span>
              <span>Accuracy</span>
              <span>Time</span>
              <span>Lang</span>
              <span>Level</span>
              <span>Played</span>
            </div>
            {pagedEntries.map((e, i) => {
              const rank = (page - 1) * ENTRIES_PER_PAGE + i + 1;
              const duration = formatDuration(e.time);
              const played = formatEntryWhen(e);
              return (
                <motion.div
                  key={`${page}-${i}-${e.completedAt ?? e.date}-${e.wpm}`}
                  variants={row}
                  className="px-5 py-4 border-b border-border last:border-0 hover:bg-surface-2 transition-colors"
                >
                  {/* Mobile */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-lg font-bold ${rank <= 3 ? medalColor[rank - 1] : "text-muted/70"}`}>
                        {rank <= 3 ? rank : `#${rank}`}
                      </span>
                      <span className="text-xs text-muted">{played}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted mb-0.5">WPM</p>
                        <p className="text-xl font-bold text-violet-400 tabular-nums">{e.wpm}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted mb-0.5">Accuracy</p>
                        <p className="font-semibold text-green-400">{e.acc}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted mb-0.5">Time</p>
                        <p className="font-semibold text-foreground tabular-nums">{duration}</p>
                      </div>
                      <div className="flex flex-wrap items-end gap-2">
                        <LangBadge lang={e.lang} />
                        <DiffBadge diff={e.diff} />
                      </div>
                    </div>
                  </div>

                  {/* Desktop */}
                  <div className="hidden sm:grid sm:grid-cols-7 gap-3 items-center">
                    <span className={`text-lg font-bold ${rank <= 3 ? medalColor[rank - 1] : "text-muted/70"}`}>
                      {rank <= 3 ? rank : `#${rank}`}
                    </span>
                    <span className="text-xl font-bold text-violet-400 tabular-nums">{e.wpm}</span>
                    <span className="text-green-400 font-semibold">{e.acc}%</span>
                    <span className="text-foreground font-medium tabular-nums">{duration}</span>
                    <LangBadge lang={e.lang} />
                    <DiffBadge diff={e.diff} />
                    <span className="text-xs text-muted">{played}</span>
                  </div>
                </motion.div>
              );
            })}
            {pageCount >= 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 bg-surface-2/80">
                <span className="text-xs text-muted">
                  Showing {pagedEntries.length} of {entries.length} saved scores
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="px-3 py-1 rounded-lg text-xs font-medium border border-border text-foreground disabled:text-muted/70 disabled:border-border disabled:cursor-not-allowed hover:bg-surface-2 transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: pageCount }, (_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setPage(index + 1)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        page === index + 1
                          ? "bg-violet-500/15 border-violet-500/30 text-foreground"
                          : "border-border text-foreground hover:bg-surface-2"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={page === pageCount}
                    onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
                    className="px-3 py-1 rounded-lg text-xs font-medium border border-border text-foreground disabled:text-muted/70 disabled:border-border disabled:cursor-not-allowed hover:bg-surface-2 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
