"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { FiCheck, FiPlay, FiBookOpen, FiCircle, FiCode, FiZap } from "react-icons/fi";
import type { Difficulty, Language } from "../lib/types";
import { LANGUAGES, LANG_LABELS, LANG_LABELS_SHORT } from "../lib/snippets";
import { Page } from "./Navbar";

const DIFFS_BY_LANG: Record<Language, { id: Difficulty; label: string; desc: string; color: string; ring: string; dot: string }[]> = {
  css: [
    { id: "easy", label: "Easy", desc: "Short declarations — color, margin, flex.", color: "text-emerald-400", ring: "ring-emerald-500/40", dot: "text-emerald-400" },
    { id: "medium", label: "Medium", desc: "Multi-property rules, grid, transitions.", color: "text-amber-400", ring: "ring-amber-500/40", dot: "text-amber-400" },
    { id: "hard", label: "Hard", desc: "@media, keyframes, complex selectors.", color: "text-rose-400", ring: "ring-rose-500/40", dot: "text-rose-400" },
  ],
  html: [
    { id: "easy", label: "Easy", desc: "Basic tags — div, p, img, attributes.", color: "text-emerald-400", ring: "ring-emerald-500/40", dot: "text-emerald-400" },
    { id: "medium", label: "Medium", desc: "Forms, links, media, multi-attribute tags.", color: "text-amber-400", ring: "ring-amber-500/40", dot: "text-amber-400" },
    { id: "hard", label: "Hard", desc: "DOCTYPE, semantic markup, SVG.", color: "text-rose-400", ring: "ring-rose-500/40", dot: "text-rose-400" },
  ],
  js: [
    { id: "easy", label: "Easy", desc: "Variables, loops, console.log, and simple expressions.", color: "text-emerald-400", ring: "ring-emerald-500/40", dot: "text-emerald-400" },
    { id: "medium", label: "Medium", desc: "DOM APIs, arrow functions, promises, and fetch.", color: "text-amber-400", ring: "ring-amber-500/40", dot: "text-amber-400" },
    { id: "hard", label: "Hard", desc: "async/await, TypeScript types, and complex patterns.", color: "text-rose-400", ring: "ring-rose-500/40", dot: "text-rose-400" },
  ],
  react: [
    { id: "easy", label: "Easy", desc: "JSX elements, props, and basic hooks like useState.", color: "text-emerald-400", ring: "ring-emerald-500/40", dot: "text-emerald-400" },
    { id: "medium", label: "Medium", desc: "Components, events, Next.js imports, and Framer Motion.", color: "text-amber-400", ring: "ring-amber-500/40", dot: "text-amber-400" },
    { id: "hard", label: "Hard", desc: "Server components, forms, TanStack Query, and advanced hooks.", color: "text-rose-400", ring: "ring-rose-500/40", dot: "text-rose-400" },
  ],
  tailwind: [
    { id: "easy", label: "Easy", desc: "Core utilities — flex, spacing, typography, colors.", color: "text-emerald-400", ring: "ring-emerald-500/40", dot: "text-emerald-400" },
    { id: "medium", label: "Medium", desc: "Responsive prefixes, variants, gradients, and states.", color: "text-amber-400", ring: "ring-amber-500/40", dot: "text-amber-400" },
    { id: "hard", label: "Hard", desc: "Arbitrary values, container queries, and v4 syntax.", color: "text-rose-400", ring: "ring-rose-500/40", dot: "text-rose-400" },
  ],
  vue: [
    { id: "easy", label: "Easy", desc: "Templates, ref, v-model, and basic directives.", color: "text-emerald-400", ring: "ring-emerald-500/40", dot: "text-emerald-400" },
    { id: "medium", label: "Medium", desc: "script setup, Pinia, Vue Router, and composables.", color: "text-amber-400", ring: "ring-amber-500/40", dot: "text-amber-400" },
    { id: "hard", label: "Hard", desc: "Nuxt, generics, async setup, and advanced patterns.", color: "text-rose-400", ring: "ring-rose-500/40", dot: "text-rose-400" },
  ],
  express: [
    { id: "easy", label: "Easy", desc: "Routes, req/res, middleware, and JSON responses.", color: "text-emerald-400", ring: "ring-emerald-500/40", dot: "text-emerald-400" },
    { id: "medium", label: "Medium", desc: "Routers, auth, validation, Prisma, and WebSockets.", color: "text-amber-400", ring: "ring-amber-500/40", dot: "text-amber-400" },
    { id: "hard", label: "Hard", desc: "Error handlers, rate limits, OpenAPI, and production ops.", color: "text-rose-400", ring: "ring-rose-500/40", dot: "text-rose-400" },
  ],
  next: [
    { id: "easy", label: "Easy", desc: "Route handlers, NextResponse, cookies, and redirects.", color: "text-emerald-400", ring: "ring-emerald-500/40", dot: "text-emerald-400" },
    { id: "medium", label: "Medium", desc: "Server actions, middleware, cache, and auth.", color: "text-amber-400", ring: "ring-amber-500/40", dot: "text-amber-400" },
    { id: "hard", label: "Hard", desc: "Edge runtime, webhooks, streaming, and typed APIs.", color: "text-rose-400", ring: "ring-rose-500/40", dot: "text-rose-400" },
  ],
};

const LANG_STYLES: Record<Language, { active: string; idle: string; glow: string }> = {
  css: {
    active: "bg-violet-500/15 border-violet-500/50 text-violet-200 shadow-lg shadow-violet-500/10",
    idle: "border-border text-muted hover:border-violet-500/30 hover:bg-violet-500/5",
    glow: "from-violet-500/20",
  },
  html: {
    active: "bg-orange-500/15 border-orange-500/50 text-orange-700 dark:text-orange-200 shadow-lg shadow-orange-500/10",
    idle: "border-border text-muted hover:border-orange-500/30 hover:bg-orange-500/5",
    glow: "from-orange-500/20",
  },
  js: {
    active: "bg-yellow-500/15 border-yellow-500/50 text-yellow-800 dark:text-yellow-200 shadow-lg shadow-yellow-500/10",
    idle: "border-border text-muted hover:border-yellow-500/30 hover:bg-yellow-500/5",
    glow: "from-yellow-500/20",
  },
  react: {
    active: "bg-cyan-500/15 border-cyan-500/50 text-cyan-800 dark:text-cyan-200 shadow-lg shadow-cyan-500/10",
    idle: "border-border text-muted hover:border-cyan-500/30 hover:bg-cyan-500/5",
    glow: "from-cyan-500/20",
  },
  tailwind: {
    active: "bg-teal-500/15 border-teal-500/50 text-teal-800 dark:text-teal-200 shadow-lg shadow-teal-500/10",
    idle: "border-border text-muted hover:border-teal-500/30 hover:bg-teal-500/5",
    glow: "from-teal-500/20",
  },
  vue: {
    active: "bg-emerald-500/15 border-emerald-500/50 text-emerald-800 dark:text-emerald-200 shadow-lg shadow-emerald-500/10",
    idle: "border-border text-muted hover:border-emerald-500/30 hover:bg-emerald-500/5",
    glow: "from-emerald-500/20",
  },
  express: {
    active: "bg-slate-500/15 border-slate-500/50 text-slate-800 dark:text-slate-200 shadow-lg shadow-slate-500/10",
    idle: "border-border text-muted hover:border-slate-500/30 hover:bg-slate-500/5",
    glow: "from-slate-500/20",
  },
  next: {
    active: "bg-zinc-500/15 border-zinc-500/50 text-zinc-800 dark:text-zinc-200 shadow-lg shadow-zinc-500/10",
    idle: "border-border text-muted hover:border-zinc-500/30 hover:bg-zinc-500/5",
    glow: "from-zinc-500/20",
  },
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function HomePage({
  onStart,
}: {
  onStart: (lang: Language, diff: Difficulty, nav: Page) => void;
}) {
  const [selectedLang, setSelectedLang] = useState<Language>("css");
  const [selected, setSelected] = useState<Difficulty>("easy");
  const diffs = DIFFS_BY_LANG[selectedLang];
  const langLabel = LANG_LABELS[selectedLang];
  const diffLabel = selected.charAt(0).toUpperCase() + selected.slice(1);

  const handleLangChange = (lang: Language) => {
    setSelectedLang(lang);
    setSelected("easy");
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20"
    >
      <motion.div variants={item} className="text-center mb-12 sm:mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold leading-[1.1] tracking-tight mb-4">
          <span className="bg-gradient-to-br from-foreground via-foreground/90 to-violet-500 dark:to-violet-300 bg-clip-text text-transparent">
            Master the web
          </span>
          <br />
          <span className="text-muted text-3xl sm:text-4xl font-semibold">by typing it</span>
        </h1>
        <p className="text-muted text-base sm:text-lg max-w-md mx-auto leading-relaxed">
          Practice 8 web languages — from CSS and Vue to Express and Next.js backend routes.
        </p>
      </motion.div>

      <motion.div variants={item} className="card-glass rounded-2xl p-5 sm:p-6 mb-8">
        <p className="section-label mb-3">Language</p>
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {LANGUAGES.map((l) => (
            <motion.button
              key={l.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleLangChange(l.id)}
              title={l.label}
              className={`flex items-center justify-center gap-1 min-w-0 px-2 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border text-[11px] sm:text-sm font-semibold transition-all truncate ${
                selectedLang === l.id ? LANG_STYLES[l.id].active : LANG_STYLES[l.id].idle
              }`}
            >
              <FiCode className="w-3 h-3 shrink-0 hidden sm:block sm:w-4 sm:h-4" />
              <span className="truncate">{LANG_LABELS_SHORT[l.id]}</span>
            </motion.button>
          ))}
        </div>

        <p className="section-label mt-8 mb-4">Difficulty</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {diffs.map((d) => (
            <motion.button
              key={d.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(d.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                selected === d.id
                  ? `bg-surface-2 ring-2 ${d.ring} border-transparent`
                  : "bg-surface/50 border-border hover:border-border/80"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`flex items-center gap-2 text-sm font-bold ${d.color}`}>
                  <FiCircle className={`w-3.5 h-3.5 ${d.dot}`} />
                  {d.label}
                </span>
                {selected === d.id && (
                  <motion.span layoutId="diff-check" className="text-violet-400">
                    <FiCheck className="w-4 h-4" />
                  </motion.span>
                )}
              </div>
              <p className="text-xs text-muted leading-relaxed">{d.desc}</p>
            </motion.button>
          ))}
        </div>

        <div className={`mt-6 px-3 sm:px-4 py-3 rounded-xl bg-gradient-to-r ${LANG_STYLES[selectedLang].glow} to-transparent border border-border`}>
          <p className="text-xs sm:text-sm text-muted text-center sm:text-left">
            Ready: <span className="text-foreground font-semibold">{langLabel}</span>
            <span className="opacity-40 mx-1.5">·</span>
            <span className="text-foreground font-semibold">{diffLabel}</span>
            <span className="opacity-40 mx-1.5">·</span>
            <span>5 snippets</span>
          </p>
        </div>
      </motion.div>

      <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStart(selectedLang, selected, "test")}
          className="btn-primary flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold transition-all"
        >
          <FiPlay className="w-4 h-4" />
          Start typing
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStart(selectedLang, selected, "guide")}
          className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-surface-2 hover:bg-surface-3 text-foreground font-medium border border-border transition-colors"
        >
          <FiBookOpen className="w-4 h-4" />
          View guide
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
