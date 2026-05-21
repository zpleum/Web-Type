export const LANGUAGE_IDS = [
  "css",
  "html",
  "js",
  "react",
  "tailwind",
  "vue",
  "express",
  "next",
] as const;

export type Language = (typeof LANGUAGE_IDS)[number];

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && (LANGUAGE_IDS as readonly string[]).includes(value);
}
export type Difficulty = "easy" | "medium" | "hard";

export interface LeaderboardEntry {
  wpm: number;
  acc: number;
  /** Total session duration in seconds */
  time: number;
  diff: Difficulty;
  lang: Language;
  /** Locale date string (legacy display) */
  date: string;
  /** ISO timestamp when the session was saved */
  completedAt?: string;
}
