import type { IconType } from "react-icons";
import { FiAward, FiZap, FiStar, FiShield, FiFeather } from "react-icons/fi";
import type { Difficulty, Language } from "../types";
import { CSS_SNIPPETS } from "./css";
import { HTML_SNIPPETS } from "./html";
import { JS_SNIPPETS } from "./js";
import { REACT_SNIPPETS } from "./react";
import { TAILWIND_SNIPPETS } from "./tailwind";
import { VUE_SNIPPETS } from "./vue";
import { EXPRESS_SNIPPETS } from "./express";
import { NEXT_SNIPPETS } from "./next";

export type { Difficulty, Language, LeaderboardEntry } from "../types";
export { CSS_SNIPPETS } from "./css";
export { HTML_SNIPPETS } from "./html";
export { JS_SNIPPETS } from "./js";
export { REACT_SNIPPETS } from "./react";
export { TAILWIND_SNIPPETS } from "./tailwind";
export { VUE_SNIPPETS } from "./vue";
export { EXPRESS_SNIPPETS } from "./express";
export { NEXT_SNIPPETS } from "./next";

export const SNIPPETS: Record<Language, Record<Difficulty, string[]>> = {
  css: CSS_SNIPPETS,
  html: HTML_SNIPPETS,
  js: JS_SNIPPETS,
  react: REACT_SNIPPETS,
  tailwind: TAILWIND_SNIPPETS,
  vue: VUE_SNIPPETS,
  express: EXPRESS_SNIPPETS,
  next: NEXT_SNIPPETS,
};

export const LANGUAGES: { id: Language; label: string }[] = [
  { id: "css", label: "CSS" },
  { id: "html", label: "HTML" },
  { id: "js", label: "JavaScript" },
  { id: "react", label: "React" },
  { id: "tailwind", label: "Tailwind CSS" },
  { id: "vue", label: "Vue" },
  { id: "express", label: "Express.js" },
  { id: "next", label: "Next.js" },
];

export const LANG_LABELS: Record<Language, string> = {
  css: "CSS",
  html: "HTML",
  js: "JavaScript",
  react: "React",
  tailwind: "Tailwind CSS",
  vue: "Vue",
  express: "Express.js",
  next: "Next.js",
};

/** Compact labels for pickers (fits grid / segmented UI) */
export const LANG_LABELS_SHORT: Record<Language, string> = {
  css: "CSS",
  html: "HTML",
  js: "JS",
  react: "React",
  tailwind: "Tailwind",
  vue: "Vue",
  express: "Express",
  next: "Next.js",
};

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface RankInfo {
  icon: IconType;
  label: string;
  msg: string;
  color: string;
  bg: string;
}

export function getRank(wpm: number, diff: Difficulty): RankInfo {
  const thresholds: Record<Difficulty, Array<{ w: number } & RankInfo>> = {
    easy: [
      { w: 80, icon: FiAward, label: "Master Typer", msg: "Fast and accurate — outstanding work.", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/25" },
      { w: 50, icon: FiZap, label: "Pro Typer", msg: "Strong speed and accuracy. Keep the pace going.", color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/25" },
      { w: 0, icon: FiFeather, label: "Keep Going", msg: "Nice start — keep practicing to build muscle memory.", color: "text-green-400", bg: "bg-green-400/10 border-green-400/25" },
    ],
    medium: [
      { w: 60, icon: FiAward, label: "Master Typer", msg: "Excellent work — medium snippets are smooth for you.", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/25" },
      { w: 35, icon: FiZap, label: "Pro Typer", msg: "Very good — you handle medium patterns well.", color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/25" },
      { w: 0, icon: FiFeather, label: "Keep Going", msg: "Medium is tougher — try easy again for more confidence.", color: "text-green-400", bg: "bg-green-400/10 border-green-400/25" },
    ],
    hard: [
      { w: 40, icon: FiAward, label: "Legend", msg: "Legendary typing — hard mode is no match for you.", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/25" },
      { w: 20, icon: FiStar, label: "Expert", msg: "Great effort — hard mode is challenging and you're strong.", color: "text-red-400", bg: "bg-red-400/10 border-red-400/25" },
      { w: 0, icon: FiShield, label: "Challenger", msg: "Hard is tough — keep practicing and you will improve.", color: "text-violet-400", bg: "bg-violet-400/10 border-violet-400/25" },
    ],
  };
  const tiers = thresholds[diff];
  return tiers.find((t) => wpm >= t.w) ?? tiers[tiers.length - 1];
}
