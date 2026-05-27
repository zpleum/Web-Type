import type { Language } from "./types";
import type { EditorSettings } from "./editorSettings";

const VOID_TAGS = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

/** Opening → closing for quotes and brackets */
export const PAIR_CLOSERS: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
  '"': '"',
  "'": "'",
};

const CLOSE_TO_OPEN = Object.fromEntries(
  Object.entries(PAIR_CLOSERS).map(([open, close]) => [close, open]),
) as Record<string, string>;

const CLOSING_CHARS = new Set(Object.values(PAIR_CLOSERS));

type Insertion = { index: number; char: string };

/** Where a single character was inserted (works mid-string, not only append). */
function getSingleInsertion(prev: string, next: string): Insertion | null {
  if (next.length !== prev.length + 1) return null;
  let i = 0;
  while (i < prev.length && prev[i] === next[i]) i++;
  if (i >= next.length) return null;
  return { index: i, char: next[i] };
}

/** Insert closer right after the opening character at openIndex. */
function insertCloserAt(typed: string, openIndex: number, closer: string, target: string): string {
  const candidate = typed.slice(0, openIndex + 1) + closer + typed.slice(openIndex + 1);
  if (!target.startsWith(candidate)) return typed;
  return candidate;
}

type ResolveResult = { value: string; cursor?: number };

/**
 * VS Code–style overtype for auto-inserted closers.
 * When assistSuffix is active and the user types its first char at the right spot,
 * move the cursor past it instead of inserting a duplicate.
 * Everything else is allowed through — wrong chars show red, user can backspace.
 */
export function resolveTypingValue(
  prev: string,
  next: string,
  target: string,
  assistSuffix: string,
  ins: Insertion,
): ResolveResult {
  const { index, char: added } = ins;

  // ── assistSuffix overtype ───────────────────────────────────────────────
  // e.g. user typed "{" → assistSuffix = "}", cursor inside the pair.
  // When user now types "}", move the cursor one step past the auto-"}"
  // instead of inserting a second one.
  if (assistSuffix.length > 0 && added === assistSuffix[0]) {
    const suffixStart = prev.length - assistSuffix.length;
    if (index === suffixStart) {
      // Move cursor exactly ONE past this char, not to the absolute end.
      return { value: prev, cursor: suffixStart + 1 };
    }
  }

  // Non-closers are always allowed.
  if (!CLOSING_CHARS.has(added)) return { value: next };

  // ── Duplicate-closer overtype ───────────────────────────────────────────
  // The user typed a closer and the very next char in the current string is
  // the same closer (sitting there from an earlier auto-insert).
  // If the target expects that closer at `index`, move the cursor past it.
  // If the target does NOT expect it yet, allow the char anyway — it will
  // highlight red so the user knows it's wrong, but we never silently drop it.
  if (index < next.length - 1 && next[index + 1] === added) {
    if (target[index] === added) {
      // Target wants this closer here — overtype: consume existing, advance cursor.
      return { value: prev, cursor: index + 1 };
    }
    // Target doesn't want it here yet — let it through (shows red).
    return { value: next };
  }

  return { value: next };
}

/** Backspace: remove auto-inserted closing + its opener when the target does not need that closer yet. */
export function applySmartBackspace(typed: string, target: string): string {
  if (typed.length === 0) return typed;
  if (typed.length >= 2) {
    const last = typed[typed.length - 1];
    const open = CLOSE_TO_OPEN[last];
    if (open && typed[typed.length - 2] === open && target[typed.length - 1] !== last) {
      return typed.slice(0, -2);
    }
  }
  return typed.slice(0, -1);
}

/** Handle Backspace, Ctrl+Backspace, selection delete, etc. */
function processDeletion(prev: string, raw: string, target: string): TypingProcessResult {
  if (raw.length === 0) {
    return { value: "", assistSuffix: "" };
  }

  let prefixLen = 0;
  while (prefixLen < raw.length && prefixLen < prev.length && raw[prefixLen] === prev[prefixLen]) {
    prefixLen++;
  }

  // Trailing delete only (Backspace, Ctrl+Backspace, Delete to end)
  if (prev.startsWith(raw)) {
    const removed = prev.length - raw.length;
    if (removed === 1) {
      const value = applySmartBackspace(prev, target);
      return { value, assistSuffix: "", cursor: value.length };
    }
    return { value: raw, assistSuffix: "", cursor: raw.length };
  }

  // Edit before the suffix — keep browser value, caret at first change
  return { value: raw, assistSuffix: "", cursor: prefixLen };
}

function getTagCloseInsertion(typed: string, target: string): string | null {
  if (!typed.endsWith(">")) return null;
  if (typed.endsWith("/>")) return null;
  if (/<!/.test(typed) || /<!--/.test(typed)) return null;

  const match = typed.match(/<([a-zA-Z][\w-]*)(\s[^>]*)?>$/);
  if (!match) return null;

  const tag = match[1].toLowerCase();
  if (VOID_TAGS.has(tag)) return null;

  const closing = `</${tag}>`;
  const remainder = target.slice(typed.length);
  if (remainder.startsWith(closing)) return closing;

  const closeIdx = remainder.indexOf(closing);
  if (closeIdx === -1) return null;
  if (closeIdx > 0) return null;

  return closing;
}

function supportsTagAssist(lang: Language): boolean {
  return lang === "html" || lang === "react" || lang === "vue";
}

function applyAutoCloseTags(typed: string, target: string, lang: Language): string {
  if (!supportsTagAssist(lang)) return typed;
  const insert = getTagCloseInsertion(typed, target);
  if (!insert) return typed;
  if (!target.startsWith(typed + insert)) return typed;
  return typed + insert;
}

function applyAutoCloseQuotes(typed: string, target: string, ins?: Insertion): string {
  const openIndex = ins ? ins.index : typed.length - 1;
  const ch = ins ? ins.char : typed[typed.length - 1];
  if (ch !== '"' && ch !== "'") return typed;
  return insertCloserAt(typed, openIndex, PAIR_CLOSERS[ch], target);
}

function applyAutoCloseBrackets(typed: string, target: string, ins?: Insertion): string {
  const openIndex = ins ? ins.index : typed.length - 1;
  const ch = ins ? ins.char : typed[typed.length - 1];
  if (ch !== "(" && ch !== "[" && ch !== "{") return typed;
  return insertCloserAt(typed, openIndex, PAIR_CLOSERS[ch], target);
}

function applyAutoIndent(typed: string, target: string, ins?: Insertion): string {
  if (!ins || ins.char !== "\n") return typed;
  const startOfLineIndex = ins.index + 1;
  let indent = "";
  let i = startOfLineIndex;
  while (i < target.length && (target[i] === " " || target[i] === "\t")) {
    indent += target[i];
    i++;
  }
  if (indent.length > 0) {
    const prefixWithIndent = typed.slice(0, startOfLineIndex) + indent;
    if (target.startsWith(prefixWithIndent)) {
      return typed.slice(0, startOfLineIndex) + indent + typed.slice(startOfLineIndex);
    }
  }
  return typed;
}

export function applyEditorAssist(
  typed: string,
  target: string,
  settings: EditorSettings,
  lang: Language,
  ins?: Insertion,
): string {
  let result = typed;

  if (settings.autoCloseTags) {
    result = applyAutoCloseTags(result, target, lang);
  }
  if (settings.autoCloseQuotes) {
    result = applyAutoCloseQuotes(result, target, ins);
  }
  if (settings.autoCloseBrackets) {
    result = applyAutoCloseBrackets(result, target, ins);
  }
  if (settings.autoIndent) {
    result = applyAutoIndent(result, target, ins);
  }

  return result;
}

export type TypingProcessResult = {
  value: string;
  assistSuffix: string;
  /** Caret index after this keystroke (VS Code–style placement inside pairs) */
  cursor?: number;
};

/** Single entry for typing: overtype, assists, and assist suffix tracking. */
export function processTypingInput(
  prev: string,
  raw: string,
  target: string,
  settings: EditorSettings,
  lang: Language,
  assistSuffix: string,
): TypingProcessResult {
  if (raw.length < prev.length) {
    return processDeletion(prev, raw, target);
  }

  const ins = getSingleInsertion(prev, raw);
  if (!ins) {
    return { value: raw, assistSuffix: "" };
  }

  const resolved = resolveTypingValue(prev, raw, target, assistSuffix, ins);
  let val = resolved.value;
  let cursor = resolved.cursor;
  const beforeAssist = val;
  val = applyEditorAssist(val, target, settings, lang, ins);
  const suffix = val.slice(beforeAssist.length);

  // Place caret inside auto-inserted pair (e.g. "(|)") or after auto-indentation on newline
  if (suffix.length > 0 && cursor === undefined) {
    if (ins.char === "\n") {
      cursor = ins.index + 1 + (val.length - beforeAssist.length);
    } else {
      cursor = ins.index + 1;
    }
  }

  return { value: val, assistSuffix: suffix, cursor };
}
