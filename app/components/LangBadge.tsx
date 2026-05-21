import type { Language } from "../lib/types";

const styles: Record<Language, string> = {
  css: "text-violet-500 dark:text-violet-400 bg-violet-500/10 border-violet-500/25",
  html: "text-orange-500 dark:text-orange-400 bg-orange-500/10 border-orange-500/25",
  js: "text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/25",
  react: "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/25",
  tailwind: "text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/25",
  vue: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  express: "text-slate-600 dark:text-slate-300 bg-slate-500/10 border-slate-500/25",
  next: "text-zinc-700 dark:text-zinc-300 bg-zinc-500/10 border-zinc-500/25",
};

const labels: Record<Language, string> = {
  css: "CSS",
  html: "HTML",
  js: "JS",
  react: "React",
  tailwind: "TW",
  vue: "Vue",
  express: "EXP",
  next: "Next",
};

export default function LangBadge({ lang }: { lang: Language }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide border ${styles[lang]}`}>
      {labels[lang]}
    </span>
  );
}
