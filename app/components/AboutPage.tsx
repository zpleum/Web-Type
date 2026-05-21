"use client";
import { FiZap, FiTarget, FiLayers, FiBarChart2, FiShuffle, FiSmartphone, FiSettings, FiPlay, FiCode } from "react-icons/fi";
import { motion } from "framer-motion";
import PageHeader from "./PageHeader";

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const FEATURES = [
  { icon: <FiZap className="w-6 h-6" />, title: "Real-time stats", desc: "WPM, CPM, and accuracy update live as you type." },
  { icon: <FiTarget className="w-6 h-6" />, title: "Character feedback", desc: "Correct chars are highlighted instantly so you can see mistakes clearly." },
  { icon: <FiBarChart2 className="w-6 h-6" />, title: "Local leaderboard", desc: "Top 50 scores are saved locally in your browser, tagged by language." },
  { icon: <FiCode className="w-6 h-6" />, title: "Eight languages", desc: "CSS, HTML, JS, React, Tailwind, Vue, Express.js, and Next.js backend routes." },
  { icon: <FiLayers className="w-6 h-6" />, title: "Three difficulty levels", desc: "Easy, Medium, and Hard snippets for every skill level." },
  { icon: <FiShuffle className="w-6 h-6" />, title: "Random snippets", desc: "Each session shuffles 5 snippets so practice stays fresh." },
  { icon: <FiSmartphone className="w-6 h-6" />, title: "Responsive design", desc: "Optimized for desktop, tablet, and mobile screens." },
];

export default function AboutPage() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16"
    >
      <motion.div variants={item} className="mb-10">
        <PageHeader
          title="About WebType"
          description="A web typing trainer for developers — from markup and utilities to Vue, Express APIs, and Next.js server routes."
        />
      </motion.div>

      <motion.div variants={container} className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
        {FEATURES.map((f, i) => (
          <motion.div
            key={i}
            variants={item}
            className="card-glass rounded-xl p-4 hover:border-border transition-colors"
          >
            <div className="flex items-center justify-center mb-3 text-violet-400">{f.icon}</div>
            <p className="text-sm font-semibold text-white mb-1">{f.title}</p>
            <p className="text-xs text-muted">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={item} className="mb-8">
        <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
          <FiSettings className="w-5 h-5" /> Built with
        </h3>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Next.js 16", color: "bg-surface-2 border-border" },
            { name: "React 19", color: "bg-cyan-500/10 border-cyan-500/25 text-cyan-300" },
            { name: "TypeScript", color: "bg-blue-500/10 border-blue-500/25 text-blue-300" },
            { name: "Tailwind CSS 4", color: "bg-cyan-500/10 border-cyan-500/25 text-cyan-300" },
            { name: "Framer Motion", color: "bg-pink-500/10 border-pink-500/25 text-pink-300" },
          ].map((t) => (
            <motion.span
              key={t.name}
              whileHover={{ scale: 1.05 }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${t.color}`}
            >
              {t.name}
            </motion.span>
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={item}
        className="card-glass rounded-2xl p-6 mb-8 bg-gradient-to-br from-violet-500/8 to-transparent"
      >
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <FiPlay className="w-5 h-5" /> How it works
        </h3>
        <div className="space-y-3">
          {[
            "1. Choose a language: CSS, HTML, JS, React, Tailwind, Vue, Express.js, or Next.js.",
            "2. Pick a difficulty level: Easy, Medium, or Hard.",
            "3. Five random snippets will be generated for that language.",
            "4. Type each snippet exactly, character by character.",
            "5. The timer starts on your first keystroke.",
            "6. Complete 5 snippets to save your session score locally.",
          ].map((step, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.05 }}
              className="text-sm text-foreground"
            >
              {step}
            </motion.p>
          ))}
        </div>
      </motion.div>

      <motion.div variants={item} className="text-center">
        <p className="text-muted text-sm">Built for web developers and ready for your next typing challenge.</p>
      </motion.div>
    </motion.div>
  );
}
