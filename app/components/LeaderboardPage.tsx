"use client";
import { FiTrash2, FiBarChart2, FiChevronDown, FiChevronUp, FiActivity, FiClock, FiAlertTriangle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { LeaderboardEntry } from "../lib/types";
import { loadLeaderboard, clearLeaderboard, formatDuration, formatEntryWhen } from "../lib/leaderboard";
import DiffBadge from "./DiffBadge";
import LangBadge from "./LangBadge";
import PageHeader from "./PageHeader";
import SegmentedControl from "./SegmentedControl";

const medalColor = ["text-amber-500 dark:text-amber-400", "text-muted", "text-amber-700 dark:text-amber-600"];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const row = { hidden: { opacity: 0, x: -16 }, show: { opacity: 1, x: 0 } };

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tab, setTab] = useState<"top" | "recent">("top");
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  
  const ENTRIES_PER_PAGE = 10;

  const processedEntries = [...entries].sort((a, b) => {
    if (tab === "top") {
      return b.wpm - a.wpm; // WPM descending (High Scores)
    } else {
      const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return timeB - timeA; // Date completedAt descending (Recent)
    }
  });

  const pageCount = Math.ceil(processedEntries.length / ENTRIES_PER_PAGE) || 1;
  const pagedEntries = processedEntries.slice((page - 1) * ENTRIES_PER_PAGE, page * ENTRIES_PER_PAGE);

  useEffect(() => {
    setEntries(loadLeaderboard());
    setPage(1);
    setExpandedId(null);
  }, []);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const handleTabChange = (t: "top" | "recent") => {
    setTab(t);
    setPage(1);
    setExpandedId(null);
  };

  const clear = () => {
    setShowConfirmClear(true);
  };

  const handleConfirmClear = () => {
    clearLeaderboard();
    setEntries([]);
    setPage(1);
    setExpandedId(null);
    setShowConfirmClear(false);
  };

  const tabOptions = [
    { id: "top" as const, label: "Top Scores" },
    { id: "recent" as const, label: "Recent History" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <PageHeader
        title="Leaderboard"
        description="Your saved typing sessions in this browser. Click any row to expand detailed speed and accuracy analytics."
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

      {entries.length > 0 && (
        <div className="mb-6 max-w-xs sm:max-w-sm">
          <SegmentedControl
            options={tabOptions}
            value={tab}
            onChange={handleTabChange}
            layoutId="leaderboard-tab"
            variant="grid2"
          />
        </div>
      )}

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
            <div className="hidden sm:grid sm:grid-cols-[50px_70px_90px_80px_90px_90px_1fr_40px] gap-3 px-5 py-3 border-b border-border text-[11px] font-medium text-muted uppercase tracking-widest">
              <span>Rank</span>
              <span>WPM</span>
              <span>Accuracy</span>
              <span>Time</span>
              <span>Lang</span>
              <span>Level</span>
              <span>Played</span>
              <span className="text-right">Info</span>
            </div>
            {pagedEntries.map((e, i) => {
              const rank = (page - 1) * ENTRIES_PER_PAGE + i + 1;
              const duration = formatDuration(e.time);
              const played = formatEntryWhen(e);
              const entryId = e.completedAt || `${e.date}-${e.wpm}-${i}`;
              const isExpanded = expandedId === entryId;

              return (
                <motion.div
                  key={`${page}-${i}-${e.completedAt ?? e.date}-${e.wpm}`}
                  variants={row}
                  onClick={() => setExpandedId(isExpanded ? null : entryId)}
                  className="px-5 py-4 border-b border-border last:border-0 hover:bg-surface-2/70 transition-all cursor-pointer select-none"
                >
                  {/* Mobile */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-lg font-bold ${rank <= 3 ? medalColor[rank - 1] : "text-muted/70"}`}>
                        {rank <= 3 ? rank : `#${rank}`}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted">{played}</span>
                        {isExpanded ? <FiChevronUp className="w-3.5 h-3.5 text-muted" /> : <FiChevronDown className="w-3.5 h-3.5 text-muted" />}
                      </div>
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
                  <div className="hidden sm:grid sm:grid-cols-[50px_70px_90px_80px_90px_90px_1fr_40px] gap-3 items-center">
                    <span className={`text-lg font-bold ${rank <= 3 ? medalColor[rank - 1] : "text-muted/70"}`}>
                      {rank <= 3 ? rank : `#${rank}`}
                    </span>
                    <span className="text-xl font-bold text-violet-400 tabular-nums">{e.wpm}</span>
                    <span className="text-green-400 font-semibold">{e.acc}%</span>
                    <span className="text-foreground font-medium tabular-nums">{duration}</span>
                    <LangBadge lang={e.lang} />
                    <DiffBadge diff={e.diff} />
                    <span className="text-xs text-muted truncate">{played}</span>
                    <span className="text-muted flex justify-end">
                      {isExpanded ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                    </span>
                  </div>

                  {/* Expandable detailed analytics section */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: "auto", opacity: 1, marginTop: 16 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden border-t border-border/50 pt-4 text-xs sm:text-sm"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <div className="space-y-4">
                          {/* Analytics Highlights */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="bg-surface-3/50 border border-border/60 rounded-xl p-2.5 text-center">
                              <p className="text-[10px] uppercase tracking-wider text-muted mb-0.5">Mode</p>
                              <p className="font-semibold text-foreground truncate">
                                {e.isCustom ? e.customTitle || "Custom Test" : "Standard Game"}
                              </p>
                            </div>
                            <div className="bg-surface-3/50 border border-border/60 rounded-xl p-2.5 text-center">
                              <p className="text-[10px] uppercase tracking-wider text-muted mb-0.5">Peak Speed</p>
                              <p className="font-semibold text-violet-400">
                                {e.snippetStats && e.snippetStats.length > 0
                                  ? `${Math.max(...e.snippetStats.map((s) => s.wpm))} WPM`
                                  : `${e.wpm} WPM`}
                              </p>
                            </div>
                            <div className="bg-surface-3/50 border border-border/60 rounded-xl p-2.5 text-center">
                              <p className="text-[10px] uppercase tracking-wider text-muted mb-0.5">Accuracy</p>
                              <p className="font-semibold text-green-400">{e.acc}%</p>
                            </div>
                            <div className="bg-surface-3/50 border border-border/60 rounded-xl p-2.5 text-center">
                              <p className="text-[10px] uppercase tracking-wider text-muted mb-0.5">Avg Time / Item</p>
                              <p className="font-semibold text-foreground">
                                {e.snippetStats && e.snippetStats.length > 0
                                  ? `${(e.time / e.snippetStats.length).toFixed(1)}s`
                                  : duration}
                              </p>
                            </div>
                          </div>

                          {/* Snippet stats chart */}
                          <div>
                            <p className="section-label mb-3 flex items-center gap-1.5 text-muted uppercase tracking-wider text-[10px]">
                              <FiActivity className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                              {e.isCustom ? "Line / Block Breakdown" : "Snippet Breakdown"}
                            </p>
                            {e.snippetStats && e.snippetStats.length > 0 ? (
                              <div className="space-y-3">
                                {e.snippetStats.map((stat, idx) => {
                                  const maxWpm = Math.max(...(e.snippetStats || []).map((s) => s.wpm), 100);
                                  const wpmPercent = Math.min(100, Math.max(8, (stat.wpm / maxWpm) * 100));

                                  return (
                                    <div key={idx} className="bg-surface-2/40 border border-border/40 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-violet-500/20 transition-all">
                                      <div className="flex items-center gap-2 font-medium text-xs sm:text-sm text-foreground/80 shrink-0">
                                        <span className="w-5 h-5 rounded bg-surface-3 border border-border flex items-center justify-center text-[10px] text-muted">
                                          {idx + 1}
                                        </span>
                                        {e.isCustom ? `Line ${idx + 1}` : `Snippet ${idx + 1}`}
                                      </div>

                                      <div className="flex-1 grid grid-cols-2 gap-4">
                                        {/* WPM Progress */}
                                        <div className="space-y-1">
                                          <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-muted">Speed</span>
                                            <span className="font-semibold text-violet-400">{stat.wpm} WPM</span>
                                          </div>
                                          <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                                            <motion.div
                                              initial={{ width: 0 }}
                                              animate={{ width: `${wpmPercent}%` }}
                                              transition={{ duration: 0.4, delay: idx * 0.05 }}
                                              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                                            />
                                          </div>
                                        </div>

                                        {/* Accuracy Progress */}
                                        <div className="space-y-1">
                                          <div className="flex items-center justify-between text-[11px]">
                                            <span className="text-muted">Accuracy</span>
                                            <span className="font-semibold text-green-400">{stat.acc}%</span>
                                          </div>
                                          <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                                            <motion.div
                                              initial={{ width: 0 }}
                                              animate={{ width: `${stat.acc}%` }}
                                              transition={{ duration: 0.4, delay: idx * 0.05 }}
                                              className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      <div className="text-[11px] text-muted flex items-center gap-1 shrink-0 self-end sm:self-center font-medium tabular-nums">
                                        <FiClock className="w-3.5 h-3.5 text-muted/80" />
                                        {stat.secs.toFixed(1)}s
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-4 bg-surface-2/20 border border-dashed border-border rounded-xl text-muted text-xs">
                                Detailed per-item analytics are not available for older legacy records.
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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

      <AnimatePresence>
        {showConfirmClear && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowConfirmClear(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="card-glass w-full max-w-sm rounded-2xl p-6 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4 text-rose-500">
                  <FiAlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Clear Leaderboard?</h3>
                <p className="text-sm text-muted mb-6 leading-relaxed">
                  Are you sure you want to clear all leaderboard entries? This action is permanent and cannot be undone.
                </p>
                <div className="flex items-center gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => setShowConfirmClear(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-surface-2 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmClear}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-xs font-semibold text-white transition-colors cursor-pointer shadow-md shadow-rose-500/10"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
