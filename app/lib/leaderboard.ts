import type { Language, LeaderboardEntry } from "./types";
import { isLanguage } from "./types";
import { LANG_LABELS } from "./snippets";

export const LB_KEY = "webtype-lb";
const LEGACY_LB_KEY = "csstype-lb";

function normalizeEntry(raw: Record<string, unknown>): LeaderboardEntry | null {
  if (typeof raw.wpm !== "number" || typeof raw.acc !== "number" || typeof raw.time !== "number") {
    return null;
  }
  const diff = raw.diff;
  if (diff !== "easy" && diff !== "medium" && diff !== "hard") return null;
  const lang = isLanguage(raw.lang) ? raw.lang : "css";

  let snippetStats: { wpm: number; acc: number; secs: number }[] | undefined = undefined;
  if (Array.isArray(raw.snippetStats)) {
    snippetStats = raw.snippetStats.map((item) => {
      const w = typeof item?.wpm === "number" ? item.wpm : 0;
      const a = typeof item?.acc === "number" ? item.acc : 100;
      const s = typeof item?.secs === "number" ? item.secs : 0;
      return { wpm: w, acc: a, secs: s };
    });
  }

  return {
    wpm: raw.wpm,
    acc: raw.acc,
    time: raw.time,
    diff,
    lang,
    date: typeof raw.date === "string" ? raw.date : new Date().toLocaleDateString("th-TH"),
    completedAt: typeof raw.completedAt === "string" ? raw.completedAt : undefined,
    snippetStats,
    isCustom: typeof raw.isCustom === "boolean" ? raw.isCustom : undefined,
    customTitle: typeof raw.customTitle === "string" ? raw.customTitle : undefined,
  };
}

/** Session duration, e.g. 45s or 1:05 */
export function formatDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem === 0 ? `${m}m` : `${m}:${String(rem).padStart(2, "0")}`;
}

/** When the score was saved (date + clock time) */
export function formatEntryWhen(entry: LeaderboardEntry): string {
  if (entry.completedAt) {
    const d = new Date(entry.completedAt);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
    }
  }
  return entry.date;
}

export function loadLeaderboard(): LeaderboardEntry[] {
  if (typeof window === "undefined") return [];
  try {
    let raw = localStorage.getItem(LB_KEY);
    if (!raw) {
      const legacy = localStorage.getItem(LEGACY_LB_KEY);
      if (legacy) {
        raw = legacy;
        localStorage.setItem(LB_KEY, legacy);
        localStorage.removeItem(LEGACY_LB_KEY);
      }
    }
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((e) => normalizeEntry(e as Record<string, unknown>))
      .filter((e): e is LeaderboardEntry => e !== null);
  } catch {
    return [];
  }
}

export function saveLeaderboard(entries: LeaderboardEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LB_KEY, JSON.stringify(entries));
  } catch {
    /* ignore quota errors */
  }
}

export function pushLeaderboardEntry(
  entry: Omit<LeaderboardEntry, "date" | "completedAt"> & { date?: string; completedAt?: string },
): void {
  const lb = loadLeaderboard();
  const now = new Date();
  lb.push({
    ...entry,
    date: entry.date ?? now.toLocaleDateString("th-TH"),
    completedAt: entry.completedAt ?? now.toISOString(),
  });
  // Sort by date completedAt descending to keep the 200 most recent games
  lb.sort((a, b) => {
    const timeA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
    const timeB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
    return timeB - timeA;
  });
  lb.splice(200); // Keep up to 200 most recent games
  saveLeaderboard(lb);
}

export function clearLeaderboard(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LB_KEY);
  localStorage.removeItem(LEGACY_LB_KEY);
}

export function langLabel(lang: Language): string {
  return LANG_LABELS[lang];
}
