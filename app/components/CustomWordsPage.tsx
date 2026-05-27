"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { FiCheckCircle, FiClock, FiRefreshCcw, FiDownload, FiArrowRight } from "react-icons/fi";
import { CUSTOM_TEMPLATES, parseCustomText, saveCustomText, loadCustomText, detectLanguage, type Template } from "../lib/customTemplates";
import { formatDuration, pushLeaderboardEntry } from "../lib/leaderboard";
import { loadEditorSettings, saveEditorSettings, type EditorSettings } from "../lib/editorSettings";
import { processTypingInput } from "../lib/editorAssist";
import StatCard from "./StatCard";
import EditorAssistSettings from "./EditorAssistSettings";
import SnippetDisplay from "./SnippetDisplay";
import PageHeader from "./PageHeader";
import type { Page } from "./Navbar";

function calcStats(typed: string, text: string, elapsedMs: number) {
  // Use a time floor of 0.5 seconds to avoid unrealistic speed spikes on very short typing tests
  const secs = Math.max(elapsedMs / 1000, 0.5);
  const correct = [...typed].filter((c, i) => c === text[i]).length;
  const cpm = secs > 0 ? Math.round((correct / secs) * 60) : 0;
  const wpm = Math.round(cpm / 5);
  const acc = typed.length > 0 ? Math.max(0, Math.round((correct / typed.length) * 100)) : 100;
  return { wpm, cpm, acc, secs };
}

export default function CustomWordsPage({ onNav }: { onNav: (p: Page) => void }) {
  const [mode, setMode] = useState<"setup" | "typing" | "done">("setup");
  const [customText, setCustomText] = useState<string>(loadCustomText());
  const [lines, setLines] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [sessionStats, setSessionStats] = useState<{ wpm: number; acc: number; secs: number; errors: number }[]>([]);
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(() => loadEditorSettings());

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const assistSuffixRef = useRef("");
  const pendingCursorRef = useRef<number | null>(null);

  const currentText = lines[currentIdx] ?? "";
  const stats = calcStats(typed, currentText, elapsed);
  const errorCount = [...typed].filter((c, i) => c !== currentText[i]).length;
  const computedLang = detectLanguage(customText);

  const focusInput = useCallback(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 300);
  }, []);

  const loadTemplate = (template: Template) => {
    setCustomText(template.content);
    saveCustomText(template.content);
  };

  const startSession = useCallback(() => {
    const parsedLines = parseCustomText(customText);
    if (parsedLines.length === 0) return;
    setLines(parsedLines);
    setCurrentIdx(0);
    setTyped("");
    setElapsed(0);
    setStarted(false);
    setSessionStats([]);
    assistSuffixRef.current = "";
    clearInterval(timerRef.current!);
    setMode("typing");
    focusInput();
  }, [customText, focusInput]);

  const finishLine = useCallback(() => {
    clearInterval(timerRef.current!);
    const elapsed2 = Date.now() - startRef.current;
    setElapsed(elapsed2);
    const s = calcStats(typed, currentText, elapsed2);
    const err = [...typed].filter((c, i) => c !== currentText[i]).length;
    setSessionStats((prev) => [...prev, { wpm: s.wpm, acc: s.acc, secs: s.secs, errors: err }]);

    if (currentIdx >= lines.length - 1) {
      setMode("done");
    } else {
      setTimeout(() => {
        setCurrentIdx((i) => i + 1);
        setTyped("");
        setElapsed(0);
        setStarted(false);
        focusInput();
      }, 800);
    }
  }, [typed, currentText, currentIdx, lines.length, focusInput]);

  useEffect(() => {
    if (mode !== "typing" || started === false) return;
    if (typed.length >= currentText.length && currentText.length > 0 && typed === currentText) {
      finishLine();
    }
  }, [typed, currentText, started, mode, finishLine]);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const raw = e.target.value;
    const selStart = e.target.selectionStart;
    const { value: val, assistSuffix, cursor } = processTypingInput(
      typed,
      raw,
      currentText,
      editorSettings,
      computedLang,
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

  useLayoutEffect(() => {
    const pos = pendingCursorRef.current;
    if (pos === null || !inputRef.current) return;
    pendingCursorRef.current = null;
    const el = inputRef.current;
    el.setSelectionRange(pos, pos);
  }, [typed]);

  const handleTextAreaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const val = el.value;
      const start = el.selectionStart;
      const end = el.selectionEnd;

      // Find the expected whitespace in the target text at the cursor position
      const targetRest = currentText.slice(start);
      let ws = "";
      let i = 0;
      while (i < targetRest.length && (targetRest[i] === " " || targetRest[i] === "\t")) {
        ws += targetRest[i];
        i++;
      }

      // If target has indentation space/tab, insert it. Otherwise insert 4 spaces.
      const insertText = ws.length > 0 ? ws : "    ";
      const newVal = val.slice(0, start) + insertText + val.slice(end);

      // Start timer if first keystroke
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

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
  };

  const handleEditorSettingsChange = (next: EditorSettings) => {
    setEditorSettings(next);
    saveEditorSettings(next);
  };

  // Results calculation
  const avgWpm = sessionStats.length > 0 ? Math.round(sessionStats.reduce((a, b) => a + b.wpm, 0) / sessionStats.length) : 0;
  const avgAcc = sessionStats.length > 0 ? Math.round(sessionStats.reduce((a, b) => a + b.acc, 0) / sessionStats.length) : 0;
  const totalErrors = sessionStats.reduce((a, b) => a + b.errors, 0);
  const totalTime = Math.round(sessionStats.reduce((a, b) => a + b.secs, 0));

  useEffect(() => {
    if (mode !== "done" || sessionStats.length === 0) return;
    pushLeaderboardEntry({
      wpm: avgWpm,
      acc: avgAcc,
      time: totalTime,
      diff: "easy",
      lang: computedLang,
      isCustom: true,
      customTitle: "Custom Words",
      snippetStats: sessionStats.map((s) => ({ wpm: s.wpm, acc: s.acc, secs: s.secs })),
    });
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <PageHeader
        title="Custom Words"
        description="Paste or select a template, then type each line. Hit Finished when complete."
      />

      <AnimatePresence mode="wait">
        {mode === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {/* Templates */}
            <div className="card-glass rounded-2xl p-5 sm:p-6">
              <p className="section-label mb-4">Templates</p>
              <div className="space-y-2">
                {CUSTOM_TEMPLATES.map((template) => (
                  <motion.button
                    key={template.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => loadTemplate(template)}
                    className="w-full flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-2 hover:bg-surface-3 border border-border transition-colors text-left text-sm font-medium"
                  >
                    <FiDownload className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    {template.name}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Text Input */}
            <div className="card-glass rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
              <div>
                <p className="section-label mb-4">Paste Custom Text</p>
                <textarea
                  value={customText}
                  onChange={(e) => {
                    setCustomText(e.target.value);
                    saveCustomText(e.target.value);
                  }}
                  placeholder="Paste your custom words or text here (one line per line)..."
                  className="w-full font-mono text-sm p-4 input-field rounded-xl placeholder:text-muted resize-none min-h-[200px] leading-relaxed transition-all outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500/40 border border-border"
                />
                <p className="text-xs text-muted mt-3">
                  <span className="font-semibold text-foreground">{parseCustomText(customText).length}</span> lines detected
                </p>
                {customText.trim().length > 0 && parseCustomText(customText).join("\n").length < 3 && (
                  <p className="text-xs text-rose-400 mt-1">
                    Custom text must be at least 3 characters long.
                  </p>
                )}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startSession}
                disabled={parseCustomText(customText).length === 0 || parseCustomText(customText).join("\n").length < 3}
                className="btn-primary w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 mt-5"
              >
                <FiArrowRight className="w-4 h-4" />
                Start Typing
              </motion.button>
            </div>
          </motion.div>
        )}

        {mode === "typing" && (
          <motion.div
            key="typing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5"
          >
            {/* Main typing area */}
            <div className="lg:col-span-2 space-y-4">
              <div className="card-glass rounded-2xl p-4 sm:p-6 ring-1 ring-violet-500/25">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-muted">
                    Line <span className="text-foreground font-semibold">{currentIdx + 1}</span>
                    <span className="text-muted"> / {lines.length}</span>
                  </span>
                  <motion.div
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border border-border"
                    animate={
                      typed === currentText && typed.length > 0
                        ? { backgroundColor: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.3)" }
                        : started
                          ? { backgroundColor: "rgba(139,124,240,0.12)", borderColor: "rgba(139,124,240,0.3)" }
                          : {}
                    }
                  >
                    {typed === currentText && typed.length > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-emerald-400">
                        <FiCheckCircle className="w-3.5 h-3.5" />
                        Done
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
                    className="h-full rounded-full bg-violet-500"
                    animate={{ width: `${currentText.length > 0 ? (typed.length / currentText.length) * 100 : 0}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>

                <SnippetDisplay text={currentText} typed={typed} />

                <textarea
                  ref={inputRef}
                  value={typed}
                  onChange={handleInput}
                  onKeyDown={handleTextAreaKeyDown}
                  onPaste={handlePaste}
                  onCopy={handlePaste}
                  onCut={handlePaste}
                  placeholder="Start typing here…"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className="w-full font-mono text-sm p-4 input-field rounded-xl placeholder:text-muted resize-none min-h-[100px] leading-relaxed transition-all outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500/40 border border-border mt-4"
                />

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <span className="text-xs text-muted">
                    Errors <span className="text-rose-400 font-semibold">{errorCount}</span>
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setMode("setup");
                      clearInterval(timerRef.current!);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-foreground text-sm font-medium transition-colors border border-border"
                  >
                    <FiRefreshCcw className="w-4 h-4" />
                    Reset
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Stats Sidebar */}
            <aside className="space-y-3">
              <div className="card-glass rounded-2xl p-3">
                <p className="section-label mb-2">Live stats</p>
                <div className="grid grid-cols-2 gap-2">
                  <StatCard label="WPM" value={stats.wpm} />
                  <StatCard label="CPM" value={stats.cpm} />
                  <StatCard label="Accuracy" value={stats.acc} unit="%" />
                  <StatCard label="Time" value={Math.round(elapsed / 1000)} unit="s" />
                </div>
              </div>
              <EditorAssistSettings
                settings={editorSettings}
                onChange={handleEditorSettingsChange}
                lang={computedLang}
              />
            </aside>
          </motion.div>
        )}

        {mode === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="mt-6"
          >
            <div className="card-glass rounded-2xl p-5 sm:p-7">
              <div className="flex items-center gap-3 mb-5">
                <motion.div
                  initial={{ rotate: -20, scale: 0 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-lg sm:text-xl"
                >
                  <FiCheckCircle className="w-5 h-5 text-amber-400" />
                </motion.div>
                <div>
                  <p className="text-sm sm:text-base font-semibold text-foreground">Custom Test Complete!</p>
                  <p className="text-xs sm:text-sm text-muted">Great job typing all the lines</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-6">
                {[
                  { label: "Avg WPM", value: avgWpm, unit: "" },
                  { label: "Avg Accuracy", value: avgAcc, unit: "%" },
                  { label: "Total Time", value: formatDuration(totalTime), unit: "" },
                ].map((m, i) => (
                  <motion.div
                    key={m.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="bg-surface-2/60 border border-border rounded-xl p-3 sm:p-4 text-center"
                  >
                    <p className="text-2xl sm:text-3xl font-bold text-violet-400 tabular-nums">{m.value}{m.unit}</p>
                    <p className="text-xs text-muted mt-1">{m.label}</p>
                  </motion.div>
                ))}
              </div>

              <div className="bg-surface-2/30 border border-border rounded-xl p-4 sm:p-5 mb-6">
                <p className="text-sm font-semibold text-foreground mb-3">Breakdown</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: "Total Lines", value: sessionStats.length },
                    { label: "Total Errors", value: totalErrors },
                    { label: "Peak WPM", value: sessionStats.length > 0 ? Math.max(...sessionStats.map((s) => s.wpm)) : 0 },
                    { label: "Best Accuracy", value: sessionStats.length > 0 ? Math.max(...sessionStats.map((s) => s.acc)) : 0, unit: "%" },
                  ].map((m, i) => (
                    <motion.div
                      key={m.label}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35 + i * 0.05 }}
                      className="bg-surface-3/40 rounded-lg p-2 text-center"
                    >
                      <p className="text-muted">{m.label}</p>
                      <p className="font-semibold text-foreground tabular-nums">{m.value}{m.unit || ""}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setMode("setup")}
                  className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm"
                >
                  <FiRefreshCcw className="w-4 h-4" />
                  Try Again
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onNav("home")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-surface-2 border border-border text-foreground font-semibold text-sm hover:bg-surface-3 transition-colors"
                >
                  Home
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
