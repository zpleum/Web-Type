"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback, useLayoutEffect } from "react";
import { FiCheckCircle, FiClock, FiArrowRight, FiRefreshCcw } from "react-icons/fi";
import { MdOutlineLeaderboard } from "react-icons/md";
import { CUSTOM_TEMPLATES, parseCustomText, saveCustomText, loadCustomText, detectLanguage, type Template } from "../lib/customTemplates";
import { formatDuration, pushLeaderboardEntry } from "../lib/leaderboard";
import { loadEditorSettings, saveEditorSettings, type EditorSettings } from "../lib/editorSettings";
import { processTypingInput } from "../lib/editorAssist";
import StatCard from "./StatCard";
import EditorAssistSettings from "./EditorAssistSettings";
import SnippetDisplay from "./SnippetDisplay";
import RealtimePreview from "./RealtimePreview";
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

export default function CustomTestPage({ onNav }: { onNav: (p: Page) => void }) {
  const [mode, setMode] = useState<"setup" | "test" | "results">("setup");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [customText, setCustomText] = useState<string>(loadCustomText());
  const [fullText, setFullText] = useState<string>("");
  const [typed, setTyped] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [sessionStats, setSessionStats] = useState<{ wpm: number; acc: number; secs: number } | null>(null);
  const [editorSettings, setEditorSettings] = useState<EditorSettings>(() => loadEditorSettings());

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const assistSuffixRef = useRef("");
  const pendingCursorRef = useRef<number | null>(null);

  const stats = calcStats(typed, fullText, elapsed);
  const errorCount = [...typed].filter((c, i) => c !== fullText[i]).length;
  const computedLang = detectLanguage(customText, selectedTemplate?.id);

  const focusInput = useCallback(() => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 600);
  }, []);

  const loadTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setCustomText(template.content);
    saveCustomText(template.content);
  };

  const initSession = useCallback((text: string) => {
    const lines = parseCustomText(text).join("\n");
    if (lines.length === 0) return;
    
    setFullText(lines);
    setTyped("");
    setElapsed(0);
    setStarted(false);
    setDone(false);
    setSessionStats(null);
    assistSuffixRef.current = "";
    clearInterval(timerRef.current!);
    setMode("test");
    focusInput();
  }, [focusInput]);

  useEffect(() => {
    if (mode !== "test") return;
  }, [mode]);

  const finishTest = useCallback(() => {
    clearInterval(timerRef.current!);
    const elapsed2 = Date.now() - startRef.current;
    setElapsed(elapsed2);
    setDone(true);
    const s = calcStats(typed, fullText, elapsed2);
    setSessionStats({ wpm: s.wpm, acc: s.acc, secs: s.secs });
    setMode("results");
  }, [typed, fullText]);

  useEffect(() => {
    if (done) return;
    if (typed.length >= fullText.length && fullText.length > 0 && typed === fullText) {
      finishTest();
    }
  }, [typed, fullText, done, finishTest]);

  useLayoutEffect(() => {
    const pos = pendingCursorRef.current;
    if (pos === null || !inputRef.current) return;
    pendingCursorRef.current = null;
    const el = inputRef.current;
    el.setSelectionRange(pos, pos);
  }, [typed]);

  useEffect(() => {
    if (!done && fullText.length > 0) {
      focusInput();
    }
  }, [done, fullText, focusInput]);

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
      fullText,
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

  const handleTextAreaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const el = e.currentTarget;
      const val = el.value;
      const start = el.selectionStart;
      const end = el.selectionEnd;

      const targetRest = fullText.slice(start);
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

  const progress = fullText.length > 0 ? (typed.length / fullText.length) * 100 : 0;

  useEffect(() => {
    if (!done || sessionStats === null) return;
    pushLeaderboardEntry({
      wpm: sessionStats.wpm,
      acc: sessionStats.acc,
      time: Math.round(sessionStats.secs),
      diff: "easy",
      lang: computedLang,
      isCustom: true,
      customTitle: selectedTemplate ? `Custom: ${selectedTemplate.name}` : "Custom Test",
      snippetStats: [{ wpm: sessionStats.wpm, acc: sessionStats.acc, secs: sessionStats.secs }],
    });
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  const sidebarClass = "space-y-3 lg:sticky lg:top-24 lg:self-start";

  const leftSidebar = (
    <aside className={sidebarClass}>
      <div className="card-glass rounded-2xl p-3 space-y-3">
        <div>
          <p className="section-label mb-2">Templates</p>
          <div className="space-y-2">
            {CUSTOM_TEMPLATES.map((template) => (
              <motion.button
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => loadTemplate(template)}
                className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                  selectedTemplate?.id === template.id
                    ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                    : "bg-surface-2 border-border hover:bg-surface-3 text-foreground"
                }`}
              >
                {template.name}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );

  const rightSidebar = (
    <aside className={sidebarClass}>
      {!done && (
        <div className="card-glass rounded-2xl p-3">
          <p className="section-label mb-2">Progress</p>
          <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-violet-500"
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-[11px] text-muted mt-2 tabular-nums">
            {typed.length} / {fullText.length} characters
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

      {!done && (
        <EditorAssistSettings
          settings={editorSettings}
          onChange={handleEditorSettingsChange}
          lang={computedLang}
        />
      )}
    </aside>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <PageHeader
        title="Custom Test"
        description="Type custom words or templates. Select one and start typing each line."
      />

      <div className="mt-6 flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(180px,200px)_minmax(0,1fr)_minmax(180px,200px)] lg:gap-5 xl:gap-6">
        {/* Snippet center */}
        <div className="order-1 lg:order-2 min-w-0 flex flex-col items-center">
          <div className="w-full max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              {mode === "setup" && (
                <motion.div
                  key="setup"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="card-glass rounded-2xl p-6 space-y-4"
                >
                  <div>
                    <p className="section-label mb-3">Select Template</p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {CUSTOM_TEMPLATES.map((template) => (
                        <motion.button
                          key={template.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => loadTemplate(template)}
                          className={`px-4 py-3 rounded-lg text-sm font-medium transition-all border ${
                            selectedTemplate?.id === template.id
                              ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                              : "bg-surface-2 border-border hover:bg-surface-3 text-foreground"
                          }`}
                        >
                          {template.name}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="section-label mb-3">Or Paste Custom Text</p>
                    <textarea
                      value={customText}
                      onChange={(e) => {
                        setCustomText(e.target.value);
                        saveCustomText(e.target.value);
                        setSelectedTemplate(null);
                      }}
                      placeholder="Paste your custom words or code (one per line)..."
                      className="w-full font-mono text-sm p-4 input-field rounded-xl placeholder:text-muted resize-none min-h-[150px] leading-relaxed transition-all outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500/40 border border-border"
                    />
                    <p className="text-xs text-muted mt-2">
                      <span className="font-semibold text-foreground">{parseCustomText(customText).length}</span> lines detected (will use first {SNIPPET_COUNT})
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
                    onClick={() => initSession(customText)}
                    disabled={parseCustomText(customText).length === 0 || parseCustomText(customText).join("\n").length < 3}
                    className="btn-primary w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50"
                  >
                    <FiArrowRight className="w-4 h-4" />
                    Start Test
                  </motion.button>
                </motion.div>
              )}

              {mode === "test" && !done && (
                <motion.div
                  key="test-active"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="card-glass rounded-2xl p-4 sm:p-6 mb-4 ring-1 ring-violet-500/25"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-muted">
                      Type all text below
                    </span>
                    <motion.div
                      animate={
                        started
                          ? { backgroundColor: "rgba(139,124,240,0.12)", borderColor: "rgba(139,124,240,0.3)" }
                          : {}
                      }
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border border-border"
                    >
                      {started ? (
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
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>

                  <SnippetDisplay text={fullText} typed={typed} />

                  <textarea
                    ref={inputRef}
                    value={typed}
                    onChange={handleInput}
                    onKeyDown={handleTextAreaKeyDown}
                    onPaste={handlePasteAttempt}
                    onCopy={handlePasteAttempt}
                    onCut={handlePasteAttempt}
                    placeholder="Start typing here…"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    className="w-full font-mono text-sm p-4 input-field rounded-xl placeholder:text-muted resize-none min-h-[200px] leading-relaxed transition-all outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500/40 border border-border mt-4"
                  />

                  {/* แสดง RealtimePreview ในโหมดพิมพ์ทดสอบ */}
                  <RealtimePreview typed={typed} lang={computedLang} />

                  <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setMode("setup");
                        clearInterval(timerRef.current!);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 hover:bg-surface-3 text-foreground text-sm font-medium transition-colors border border-border"
                    >
                      <FiRefreshCcw className="w-4 h-4" />
                      Back
                    </motion.button>
                    <span className="ml-auto text-xs text-muted tabular-nums">
                      Errors <span className="text-rose-400 font-semibold">{errorCount}</span>
                    </span>
                  </div>
                </motion.div>
              )}

              {mode === "results" && sessionStats && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 22 }}
                  className="card-glass rounded-2xl p-5 sm:p-7"
                >
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
                      <p className="text-sm sm:text-base font-semibold text-foreground">Test Complete!</p>
                      <p className="text-xs sm:text-sm text-muted">Great typing practice session</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
                    {[
                      { label: "WPM", value: sessionStats.wpm, unit: "" },
                      { label: "Accuracy", value: sessionStats.acc, unit: "%" },
                      { label: "Time", value: formatDuration(Math.round(sessionStats.secs)), unit: "" },
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

                  <div className="bg-surface-2/30 border border-border rounded-xl p-4 sm:p-5 mb-5">
                    <p className="text-sm font-semibold text-foreground mb-3">Details</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { label: "CPM", value: sessionStats.wpm * 5 },
                        { label: "Characters Typed", value: typed.length },
                        { label: "Total Characters", value: fullText.length },
                        { label: "Errors", value: errorCount },
                      ].map((m, i) => (
                        <motion.div
                          key={m.label}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 + i * 0.05 }}
                          className="bg-surface-3/40 rounded-lg p-2 text-center"
                        >
                          <p className="text-muted">{m.label}</p>
                          <p className="font-semibold text-foreground tabular-nums">{m.value}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* 🌟 เพิ่มส่วนแสดง RealtimePreview ในหน้าสรุปผลสำเร็จ */}
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-xs font-semibold text-muted mb-2">Final Code Output Preview</p>
                    <div className="p-1 rounded-xl bg-surface-1/50">
                      <RealtimePreview typed={typed} lang={computedLang} />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-5">
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

        {/* Sidebars */}
        <div className="order-2 lg:order-1 grid grid-cols-2 gap-3 lg:contents">
          <div className="lg:order-1">{leftSidebar}</div>
          <div className="lg:order-3">{rightSidebar}</div>
        </div>
      </div>
    </div>
  );
}