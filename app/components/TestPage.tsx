"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { FiCircle, FiCheckCircle, FiClock, FiArrowRight, FiRefreshCcw } from "react-icons/fi";
import { MdOutlineLeaderboard } from "react-icons/md";
import type { Difficulty, Language } from "../lib/types";
import { SNIPPETS, LANGUAGES, LANG_LABELS, LANG_LABELS_SHORT, shuffle, getRank } from "../lib/snippets";
import { pushLeaderboardEntry, formatDuration } from "../lib/leaderboard";
import { loadEditorSettings, saveEditorSettings, type EditorSettings } from "../lib/editorSettings";
import { processTypingInput } from "../lib/editorAssist";
import StatCard from "./StatCard";
import EditorAssistSettings from "./EditorAssistSettings";
import SnippetDisplay from "./SnippetDisplay";
import RealtimePreview from "./RealtimePreview";
import DiffBadge from "./DiffBadge";
import LangBadge from "./LangBadge";
import SegmentedControl from "./SegmentedControl";
import PageHeader from "./PageHeader";
import type { Page } from "./Navbar";

const SNIPPET_COUNT = 5;

function calcStats(typed: string, text: string, elapsedMs: number) {
  const secs = Math.max(elapsedMs / 1000, 0.5);
  const correct = [...typed].filter((c, i) => c === text[i]).length;
  const cpm = secs > 0 ? Math.round((correct / secs) * 60) : 0;
  const wpm = Math.round(cpm / 5);
  const acc = typed.length > 0 ? Math.max(0, Math.round((correct / typed.length) * 100)) : 100;
  return { wpm, cpm, acc, secs };
}

const LANG_ACCENT: Record<Language, string> = {
  css: "ring-violet-500/25 shadow-violet-500/5",
  html: "ring-orange-500/25 shadow-orange-500/5",
  js: "ring-yellow-500/25 shadow-yellow-500/5",
  react: "ring-cyan-500/25 shadow-cyan-500/5",
  tailwind: "ring-teal-500/25 shadow-teal-500/5",
  vue: "ring-emerald-500/25 shadow-emerald-500/5",
  express: "ring-slate-500/25 shadow-slate-500/5",
  next: "ring-zinc-500/25 shadow-zinc-500/5",
};

const PROGRESS_BAR: Record<Language, string> = {
  css: "bg-violet-500",
  html: "bg-orange-500",
  js: "bg-yellow-500",
  react: "bg-cyan-500",
  tailwind: "bg-teal-500",
  vue: "bg-emerald-500",
  express: "bg-slate-500",
  next: "bg-zinc-400",
};

const INPUT_FOCUS: Record<Language, string> = {
  css: "focus:ring-violet-500/25 focus:border-violet-500/40",
  html: "focus:ring-orange-500/25 focus:border-orange-500/40",
  js: "focus:ring-yellow-500/25 focus:border-yellow-500/40",
  react: "focus:ring-cyan-500/25 focus:border-cyan-500/40",
  tailwind: "focus:ring-teal-500/25 focus:border-teal-500/40",
  vue: "focus:ring-emerald-500/25 focus:border-emerald-500/40",
  express: "focus:ring-slate-500/25 focus:border-slate-500/40",
  next: "focus:ring-zinc-500/25 focus:border-zinc-500/40",
};

const DIFF_OPTIONS = [
  { id: "easy" as Difficulty, label: "Easy", icon: <FiCircle className="w-3 h-3 text-emerald-400" /> },
  { id: "medium" as Difficulty, label: "Medium", icon: <FiCircle className="w-3 h-3 text-amber-400" /> },
  { id: "hard" as Difficulty, label: "Hard", icon: <FiCircle className="w-3 h-3 text-rose-400" /> },
];

export default function TestPage({
  initLang,
  initDiff,
  onNav,
}: {
  initLang: Language;
  initDiff: Difficulty;
  onNav: (p: Page) => void;
}) {
  const [lang, setLang] = useState<Language>(initLang);
  const [diff, setDiff] = useState<Difficulty>(initDiff);

  useEffect(() => {
    setLang(initLang);
    setDiff(initDiff);
  }, [initLang, initDiff]);
  const [snippets, setSnippets] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [results, setResults] = useState<{ wpm: number; acc: number; secs: number }[]>([]);
  const [sessionDone, setSessionDone] = useState(false);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(() => loadEditorSettings());

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const assistSuffixRef = useRef("");
  const pendingCursorRef = useRef<number | null>(null);

  const currentText = snippets[idx] ?? "";
  const stats = calcStats(typed, currentText, elapsed);
  const errorCount = [...typed].filter((c, i) => c !== currentText[i]).length;

  const focusInput = useCallback(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 600);
  }, []);

  const initSession = useCallback((l: Language, d: Difficulty) => {
    setSnippets(shuffle(SNIPPETS[l][d]).slice(0, SNIPPET_COUNT));
    setIdx(0); setTyped(""); setElapsed(0);
    setStarted(false); setDone(false);
    setResults([]); setSessionDone(false);
    setWaitingForNext(false);
    assistSuffixRef.current = "";
    clearInterval(timerRef.current!);
    focusInput();
  }, [focusInput]);

  useEffect(() => { initSession(lang, diff); }, [lang, diff, initSession]);

  const finishSnippet = useCallback(() => {
    clearInterval(timerRef.current!);
    const elapsed2 = started ? (Date.now() - startRef.current) : 0;
    setElapsed(elapsed2);
    setDone(true);
    setWaitingForNext(true);
    const s = calcStats(typed, currentText, elapsed2);
    setResults((r) => [...r, { wpm: s.wpm, acc: s.acc, secs: s.secs }]);
  }, [typed, currentText, started]);

  const advance = useCallback(() => {
    if (idx >= SNIPPET_COUNT - 1) {
      setSessionDone(true);
      setWaitingForNext(false);
    } else {
      setIdx((i) => i + 1);
      setTyped(""); setElapsed(0);
      setStarted(false); setDone(false);
      setWaitingForNext(false);
      clearInterval(timerRef.current!);
      focusInput();
    }
  }, [idx, focusInput]);

  useEffect(() => {
    if (!done) return;
    const timer = setTimeout(() => {
      advance();
    }, 1200);
    return () => clearTimeout(timer);
  }, [done, advance]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        waitingForNext &&
        e.code === "Space" &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLInputElement)
      ) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [waitingForNext, advance]);

  useEffect(() => {
    if (done) return;
    if (typed.length >= currentText.length && currentText.length > 0 && typed === currentText) {
      finishSnippet();
    }
  }, [typed, currentText, done, finishSnippet]);

  useLayoutEffect(() => {
    const pos = pendingCursorRef.current;
    if (pos === null || !inputRef.current) return;
    pendingCursorRef.current = null;
    const el = inputRef.current;
    el.setSelectionRange(pos, pos);
  }, [typed]);

  useEffect(() => {
    if (!done && !sessionDone && currentText.length > 0) {
      focusInput();
    }
  }, [idx, done, sessionDone, currentText, focusInput]);

  const handleEditorSettingsChange = (next: EditorSettings) => {
    setEditorSettings(next);
    saveEditorSettings(next);
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (done) return;
    const raw = e.target.value;
    const selStart = e.target.selectionStart;
    const { value: val, assistSuffix, cursor } = processTypingInput(
      typed,
      raw,
      currentText,
      editorSettings,
      lang,
      assistSuffixRef.current,
    );
    assistSuffixRef.current = assistSuffix;
    if (cursor !== undefined) {
      pendingCursorRef.current = cursor;
    } else if (raw.length < typed.length && selStart !== null) {
      pendingCursorRef.current = selStart;
    }
    if (!started && val.length > 0) {
      setStarted(true);
      startRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(Date.now() - startRef.current);
      }, 100);
    }
    setTyped(val);
  };

  const handleTextAreaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const val = el.value;
      const start = el.selectionStart;
      const end = el.selectionEnd;

      const targetRest = currentText.slice(start);
      let ws = "";
      let i = 0;
      while (i < targetRest.length && (targetRest[i] === " " || targetRest[i] === "\t")) {
        ws += targetRest[i];
        i++;
      }

      const insertText = ws.length > 0 ? ws : "    ";
      const newVal = val.slice(0, start) + insertText + val.slice(end);

      if (!started && newVal.length > 0) {
        setStarted(true);
        startRef.current = Date.now();
        timerRef.current = setInterval(() => {
          setElapsed(Date.now() - startRef.current);
        }, 100);
      }

      setTyped(newVal);
      pendingCursorRef.current = start + insertText.length;
    }
  };

  const handlePasteAttempt = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  const progress = currentText.length > 0 ? (typed.length / currentText.length) * 100 : 0;
  const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const avgWpm = avg(results.map((r) => r.wpm));
  const avgAcc = avg(results.map((r) => r.acc));
  const totalTime = Math.round(results.reduce((a, b) => a + b.secs, 0));
  const rank = getRank(avgWpm, diff);

  useEffect(() => {
    if (!sessionDone || results.length === 0) return;
    pushLeaderboardEntry({
      wpm: avgWpm,
      acc: avgAcc,
      time: totalTime,
      diff,
      lang,
      snippetStats: results.map((r) => ({ wpm: r.wpm, acc: r.acc, secs: r.secs })),
    });
  }, [sessionDone]); // eslint-disable-line react-hooks/exhaustive-deps

  const langOptions = LANGUAGES.map((l) => ({
    id: l.id,
    label: LANG_LABELS_SHORT[l.id],
  }));

  const sidebarClass = "space-y-3 lg:sticky lg:top-24 lg:self-start";

  const leftSidebar = (
    <aside className={sidebarClass}>
      <div className="card-glass rounded-2xl p-3 space-y-3">
        <div>
          <p className="section-label mb-2">Language</p>
          <SegmentedControl
            options={langOptions}
            value={lang}
            onChange={setLang}
            layoutId="test-lang"
            variant="grid2"
          />
        </div>
        <div>
          <p className="section-label mb-2">Difficulty</p>
          <SegmentedControl
            options={DIFF_OPTIONS}
            value={diff}
            onChange={setDiff}
            layoutId="test-diff"
            variant="stack"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
          <LangBadge lang={lang} />
          <DiffBadge diff={diff} />
        </div>
      </div>
    </aside>
  );

  const rightSidebar = (
    <aside className={sidebarClass}>
      {!sessionDone && (
        <div className="card-glass rounded-2xl p-3">
          <p className="section-label mb-2">Session</p>
          <div className="flex gap-1.5" aria-label="Session progress">
            {Array.from({ length: SNIPPET_COUNT }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                  i < idx ? "bg-emerald-500/80" : i === idx ? "bg-violet-500" : "bg-surface-2"
                }`}
              />
            ))}
          </div>
          <p className="text-[11px] text-muted mt-2 tabular-nums">
            Snippet {idx + 1} / {SNIPPET_COUNT}
          </p>
        </div>
      )}

      <div className="card-glass rounded-2xl p-3">
        <p className="section-label mb-2">Live stats</p>
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="WPM" value={stats.wpm} />
          <StatCard label="CPM" value={stats.cpm} />
          <StatCard label="Accuracy" value={stats.acc} unit="%" />
          <StatCard label="Time" value={Math.round(elapsed / 1000)} unit="s" />
        </div>
      </div>

      {!sessionDone && (
        <EditorAssistSettings
          settings={editorSettings}
          onChange={handleEditorSettingsChange}
          lang={lang}
        />
      )}
    </aside>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <PageHeader
        title="Typing test"
        description={`Type ${LANG_LABELS[lang]} snippets exactly as shown. Timer starts on your first keystroke.`}
      />

      <div className="mt-6 flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(180px,200px)_minmax(0,1fr)_minmax(180px,200px)] lg:gap-5 xl:gap-6">
        <div className="order-1 lg:order-2 min-w-0 flex flex-col items-center">
          <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!sessionDone ? (
          <motion.div
            key={`snippet-${idx}`}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`card-glass rounded-2xl p-4 sm:p-6 mb-4 ring-1 ${LANG_ACCENT[lang]}`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted">
                Snippet <span className="text-foreground tabular-nums">{idx + 1}</span>
                <span className="text-muted"> / {SNIPPET_COUNT}</span>
              </span>
              <motion.div
                animate={
                  done
                    ? { backgroundColor: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.3)" }
                    : started
                      ? { backgroundColor: "rgba(139,124,240,0.12)", borderColor: "rgba(139,124,240,0.3)" }
                      : {}
                }
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border border-border"
              >
                {done ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-400">
                    <FiCheckCircle className="w-3.5 h-3.5" />
                    Complete
                  </span>
                ) : started ? (
                  <span className="inline-flex items-center gap-1.5 text-violet-300">
                    <FiClock className="w-3.5 h-3.5" />
                    Typing
                  </span>
                ) : (
                  <span className="text-muted">Ready</span>
                )}
              </motion.div>
            </div>

            <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden mb-5">
              <motion.div
                className={`h-full rounded-full ${PROGRESS_BAR[lang]}`}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            <SnippetDisplay text={currentText} typed={typed} />

            <textarea
              ref={inputRef}
              value={typed}
              onChange={handleInput}
              onKeyDown={handleTextAreaKeyDown}
              onPaste={handlePasteAttempt}
              onCopy={handlePasteAttempt}
              onCut={handlePasteAttempt}
              disabled={done}
              placeholder="Start typing here…"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              className={`w-full font-mono text-sm p-4 input-field rounded-xl placeholder:text-muted resize-none min-h-[100px] leading-relaxed transition-all outline-none focus:ring-2 disabled:opacity-40 ${INPUT_FOCUS[lang]}`}
            />

            <RealtimePreview typed={typed} lang={lang} />

            <AnimatePresence>
              {done && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-violet-400 text-center mt-2 font-medium"
                >
                  Press <kbd className="px-2 py-0.5 rounded-md bg-surface-2 border border-border font-mono text-xs text-foreground">Space</kbd> or wait to advance
                </motion.p>
              )}
            </AnimatePresence>

            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => { if (done) advance(); else { finishSnippet(); setTimeout(advance, 150); } }}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
              >
                <FiArrowRight className="w-4 h-4" />
                Next
                <span className="hidden sm:inline text-violet-300/60 text-xs font-normal ml-0.5">[Space]</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => initSession(lang, diff)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-foreground text-sm font-medium transition-colors border border-border"
              >
                <FiRefreshCcw className="w-4 h-4" />
                Reset
              </motion.button>
              <span className="ml-auto text-xs text-muted tabular-nums">
                Errors <span className="text-rose-400 font-semibold">{errorCount}</span>
              </span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {sessionDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="card-glass rounded-2xl p-5 sm:p-7"
          >
            <div className="flex items-center gap-3 mb-5">
              <motion.div
                initial={{ rotate: -20, scale: 0 }} animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-lg sm:text-xl"
              >
                <FiCheckCircle className="w-5 h-5 text-amber-400" />
              </motion.div>
              <div>
                <p className="text-sm sm:text-base font-semibold text-foreground">Session Complete!</p>
                <p className="text-xs sm:text-sm text-muted">{rank.msg}</p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium mb-5 ${rank.bg}`}
            >
              <rank.icon className="w-4 h-4" />
              <span className={rank.color}>{rank.label}</span>
              <LangBadge lang={lang} />
              <DiffBadge diff={diff} />
            </motion.div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
              {[{ label: "Avg WPM", value: avgWpm, unit: "" }, { label: "Avg Accuracy", value: avgAcc, unit: "%" }, { label: "Total Time", value: formatDuration(totalTime), unit: "" }].map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="bg-surface-2/60 border border-border rounded-xl p-3 sm:p-4 text-center"
                >
                  <p className="text-2xl sm:text-3xl font-bold text-violet-400 tabular-nums">{m.value}{m.unit}</p>
                  <p className="text-xs text-muted mt-1">{m.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-surface-2/30 border border-border rounded-xl p-4 sm:p-5 mb-5">
              <p className="text-sm font-semibold text-foreground mb-3">Detailed Analysis</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  { label: "Peak WPM", value: results.length > 0 ? Math.max(...results.map(r => r.wpm)) : 0 },
                  { label: "Min WPM", value: results.length > 0 ? Math.min(...results.map(r => r.wpm)) : 0 },
                  { label: "Best Accuracy", value: results.length > 0 ? Math.max(...results.map(r => r.acc)) : 0, unit: "%" },
                  { label: "Consistency", value: results.length > 1 ? Math.round(100 - Math.sqrt(results.reduce((acc, r) => acc + Math.pow(r.wpm - avgWpm, 2), 0) / results.length)) : 100, unit: "%" },
                  { label: "Total Errors", value: results.length > 0 ? Math.max(0, Math.round(results.reduce((sum, r) => sum + typed.length * (100 - r.acc) / 100, 0) / results.length)) : 0 },
                  { label: "Snippets", value: results.length },
                ].map((m, i) => (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + i * 0.05 }}
                    className="bg-surface-3/40 rounded-lg p-2 text-center"
                  >
                    <p className="text-muted">{m.label}</p>
                    <p className="font-semibold text-foreground tabular-nums">{m.value}{m.unit || ""}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 🌟 แสดง RealtimePreview ในหน้า Session Complete อ้างอิงคำขอเดิม */}
            <div className="mt-4 pt-4 border-t border-border mb-5">
              <p className="text-xs font-semibold text-muted mb-2">Final Code Output Preview</p>
              <div className="p-1 rounded-xl bg-surface-1/50">
                <RealtimePreview typed={typed} lang={lang} />
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => initSession(lang, diff)}
                className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
              >
                <FiRefreshCcw className="w-4 h-4" />
                Play again
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => onNav("leaderboard")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-2 border border-border text-foreground font-semibold text-sm hover:bg-surface-3 transition-colors"
              >
                <MdOutlineLeaderboard className="w-4 h-4" />
                Leaderboard
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
          </div>
        </div>

        <div className="order-2 lg:order-1 grid grid-cols-2 gap-3 lg:contents">
          <div className="lg:order-1">{leftSidebar}</div>
          <div className="lg:order-3">{rightSidebar}</div>
        </div>
      </div>
    </div>
  );
}