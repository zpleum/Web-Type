"use client";
import { motion } from "framer-motion";
import { useState, useEffect, type ReactNode } from "react";
import { FiCircle, FiLayers, FiBarChart2, FiSettings, FiInfo } from "react-icons/fi";
import type { Difficulty, Language } from "../lib/types";
import { SNIPPETS, LANGUAGES, LANG_LABELS_SHORT } from "../lib/snippets";
import DiffBadge from "./DiffBadge";
import LangBadge from "./LangBadge";
import PageHeader from "./PageHeader";
import SegmentedControl from "./SegmentedControl";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

const TIPS_COMMON = [
  { n: "1", title: "Keep your eyes on the screen", desc: "Train touch typing so your fingers learn the key positions naturally." },
  { n: "2", title: "Accuracy before speed", desc: "Aim for 95%+ accuracy first, then increase WPM. Speed is only useful when you type correctly." },
  { n: "3", title: "Start with easy snippets", desc: "Build strong finger memory before moving to harder patterns." },
  { n: "5", title: "Practice in short sessions", desc: "Daily 15–20 minute sessions are better than one long, unfocused typing block." },
];

const TIPS_BY_LANG: Record<Language, { n: string; title: string; desc: string }> = {
  css: {
    n: "4",
    title: "Focus on punctuation",
    desc: "Colons, semicolons, and braces are common error points in CSS. Practice them deliberately.",
  },
  html: {
    n: "4",
    title: "Watch angle brackets and quotes",
    desc: "Opening and closing tags, attribute quotes, and `=` signs are the most common HTML typos.",
  },
  js: {
    n: "4",
    title: "Mind brackets and semicolons",
    desc: "Parentheses, braces, backticks, and semicolons are the usual slip-ups in JavaScript.",
  },
  react: {
    n: "4",
    title: "Watch JSX and braces",
    desc: "Angle brackets, curlies in expressions, and hook parentheses need steady rhythm.",
  },
  tailwind: {
    n: "4",
    title: "Memorize utility patterns",
    desc: "Breakpoints, variants, and slashes in arbitrary values are easy to mistype.",
  },
  vue: {
    n: "4",
    title: "Directives and doubles",
    desc: "v- prefixes, mustaches, and script setup punctuation need consistent flow.",
  },
  express: {
    n: "4",
    title: "Chain middleware carefully",
    desc: "req, res, next, and nested quotes in routes are common typo sources.",
  },
  next: {
    n: "4",
    title: "Server imports and strings",
    desc: "next/server helpers, quoted segments, and async route signatures add length.",
  },
};

const INFO_BY_LANG: Record<Language, { icon: ReactNode; title: string; desc: string; border: string }[]> = {
  css: [
    { icon: <FiCircle className="w-5 h-5" />, title: "Easy Level", desc: "Short property rules like color, font-size, margin — great for building confidence.", border: "border-green-400/20" },
    { icon: <FiLayers className="w-5 h-5" />, title: "Medium Level", desc: "Multi-property declarations, flexbox, and transitions — a solid intermediate challenge.", border: "border-amber-400/20" },
    { icon: <FiSettings className="w-5 h-5" />, title: "Hard Level", desc: "Media queries, keyframes, and complex selectors — for advanced typers.", border: "border-red-400/20" },
  ],
  html: [
    { icon: <FiCircle className="w-5 h-5" />, title: "Easy Level", desc: "Basic tags like div, p, img, and simple attributes — great for building confidence.", border: "border-green-400/20" },
    { icon: <FiLayers className="w-5 h-5" />, title: "Medium Level", desc: "Forms, links, media tags, and multiple attributes — a solid intermediate challenge.", border: "border-amber-400/20" },
    { icon: <FiSettings className="w-5 h-5" />, title: "Hard Level", desc: "DOCTYPE, semantic markup, SVG, and long attribute lists — for advanced typers.", border: "border-red-400/20" },
  ],
  js: [
    { icon: <FiCircle className="w-5 h-5" />, title: "Easy Level", desc: "Variables, loops, and console output — build core JS typing rhythm.", border: "border-green-400/20" },
    { icon: <FiLayers className="w-5 h-5" />, title: "Medium Level", desc: "DOM methods, arrow functions, promises, and modules.", border: "border-amber-400/20" },
    { icon: <FiSettings className="w-5 h-5" />, title: "Hard Level", desc: "async/await, TypeScript, and multi-line patterns — for advanced typers.", border: "border-red-400/20" },
  ],
  react: [
    { icon: <FiCircle className="w-5 h-5" />, title: "Easy Level", desc: "JSX tags, props, and useState — fundamentals for React typing.", border: "border-green-400/20" },
    { icon: <FiLayers className="w-5 h-5" />, title: "Medium Level", desc: "Hooks, events, Next.js, and animation props.", border: "border-amber-400/20" },
    { icon: <FiSettings className="w-5 h-5" />, title: "Hard Level", desc: "Server components, forms, and data-fetching patterns.", border: "border-red-400/20" },
  ],
  tailwind: [
    { icon: <FiCircle className="w-5 h-5" />, title: "Easy Level", desc: "Layout, spacing, typography, and color utilities.", border: "border-green-400/20" },
    { icon: <FiLayers className="w-5 h-5" />, title: "Medium Level", desc: "Responsive, hover/focus, and gradient class strings.", border: "border-amber-400/20" },
    { icon: <FiSettings className="w-5 h-5" />, title: "Hard Level", desc: "Arbitrary values, data attributes, and Tailwind v4 features.", border: "border-red-400/20" },
  ],
  vue: [
    { icon: <FiCircle className="w-5 h-5" />, title: "Easy Level", desc: "Template tags, ref, and v-model basics.", border: "border-green-400/20" },
    { icon: <FiLayers className="w-5 h-5" />, title: "Medium Level", desc: "script setup, router, and Pinia store patterns.", border: "border-amber-400/20" },
    { icon: <FiSettings className="w-5 h-5" />, title: "Hard Level", desc: "Nuxt composables, generics, and scoped async setup.", border: "border-red-400/20" },
  ],
  express: [
    { icon: <FiCircle className="w-5 h-5" />, title: "Easy Level", desc: "app.get/post, req.body, and res.json responses.", border: "border-green-400/20" },
    { icon: <FiLayers className="w-5 h-5" />, title: "Medium Level", desc: "Routers, auth middleware, ORM, and uploads.", border: "border-amber-400/20" },
    { icon: <FiSettings className="w-5 h-5" />, title: "Hard Level", desc: "Typed handlers, rate limits, and production shutdown.", border: "border-red-400/20" },
  ],
  next: [
    { icon: <FiCircle className="w-5 h-5" />, title: "Easy Level", desc: "App Router handlers, NextResponse, and navigation helpers.", border: "border-green-400/20" },
    { icon: <FiLayers className="w-5 h-5" />, title: "Medium Level", desc: "Server actions, middleware, cache, and auth.", border: "border-amber-400/20" },
    { icon: <FiSettings className="w-5 h-5" />, title: "Hard Level", desc: "Edge routes, webhooks, streaming, and idempotent APIs.", border: "border-red-400/20" },
  ],
};

export default function GuidePage({ initLang = "css" }: { initLang?: Language }) {
  const [activeLang, setActiveLang] = useState<Language>(initLang);

  useEffect(() => {
    setActiveLang(initLang);
  }, [initLang]);
  const [active, setActive] = useState<Difficulty>("easy");
  const DIFFS: Difficulty[] = ["easy", "medium", "hard"];
  const tips = [...TIPS_COMMON.slice(0, 3), TIPS_BY_LANG[activeLang], TIPS_COMMON[3]];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <motion.div variants={item}>
        <PageHeader
          title="Reference guide"
          description="Browse snippets and tips before your test. Switch language and difficulty below."
        />
      </motion.div>

      <motion.div variants={item} className="card-glass rounded-2xl p-3 sm:p-4 mb-8">
        <p className="section-label mb-2">Language</p>
        <SegmentedControl
          options={LANGUAGES.map((l) => ({ id: l.id, label: LANG_LABELS_SHORT[l.id] }))}
          value={activeLang}
          onChange={(id) => {
            setActiveLang(id);
            setActive("easy");
          }}
          layoutId="guide-lang"
          variant="grid"
        />
      </motion.div>

      <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {[
          ...INFO_BY_LANG[activeLang],
          { icon: <FiBarChart2 className="w-5 h-5" />, title: "Scoring", desc: "WPM measures speed from correct chars; accuracy tracks precise typing.", border: "border-violet-400/20" },
        ].map((c) => (
          <motion.div key={c.title} variants={item} className={`card-glass border ${c.border} rounded-xl p-4`}>
            <div className="flex items-center justify-center mb-3 text-violet-400">{c.icon}</div>
            <p className="text-sm font-semibold text-white mb-1">{c.title}</p>
            <p className="text-xs text-muted leading-relaxed">{c.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={item} className="mb-3">
        <p className="text-sm font-semibold text-white flex items-center gap-2">
          <FiInfo className="w-4 h-4" /> Tips for improving
        </p>
      </motion.div>
      <div className="card-glass rounded-2xl divide-y divide-white/5 mb-8 overflow-hidden">
        {tips.map((t, i) => (
          <motion.div
            key={`${activeLang}-${t.n}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 px-5 py-4"
          >
            <span className="w-6 h-6 rounded-full bg-violet-500/15 border border-violet-500/25 flex items-center justify-center text-xs font-bold text-violet-400 flex-shrink-0 mt-0.5">
              {t.n}
            </span>
            <div>
              <p className="text-sm font-semibold text-white">{t.title}</p>
              <p className="text-sm text-muted mt-0.5">{t.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={item} className="mb-3 flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm font-semibold text-white">Snippet Reference</p>
        <div className="flex gap-1.5">
          {DIFFS.map((d) => (
            <motion.button
              key={d}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActive(d)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                active === d ? "bg-surface-3 text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {d}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div
        key={`${activeLang}-${active}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-glass rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-2/50 gap-2">
          <span className="text-sm font-medium text-foreground">
            {active.charAt(0).toUpperCase() + active.slice(1)} {activeLang.toUpperCase()} snippets
          </span>
          <div className="flex items-center gap-2">
            <LangBadge lang={activeLang} />
            <DiffBadge diff={active} />
          </div>
        </div>

        <div className="p-3 flex flex-col gap-2 max-h-[420px] overflow-y-auto">
          {SNIPPETS[activeLang][active].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.3) }}
              className="font-mono text-sm text-muted hover:text-foreground px-3 py-2.5 bg-surface-2/50 hover:bg-surface-2 border border-border rounded-lg transition-colors cursor-default"
            >
              {s}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
