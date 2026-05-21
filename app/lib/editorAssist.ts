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
 * Skip typing a closing char that editor assist already inserted (VS Code overtype).
 * Only applies to ", ', ), ], } — never blocks letters (e.g. the two o's in "footer").
 */
export function resolveTypingValue(
  prev: string,
  next: string,
  target: string,
  assistSuffix: string,
  ins: Insertion,
): ResolveResult {
  const { index, char: added } = ins;

  // User typed an auto-inserted closer at the position where it was inserted
  if (assistSuffix.length > 0 && added === assistSuffix[0]) {
    const suffixStart = prev.length - assistSuffix.length;
    if (index === suffixStart) {
      return { value: prev, cursor: prev.length };
    }
  }

  if (!CLOSING_CHARS.has(added)) return { value: next };

  // Closing char already sits at the insertion point (e.g. auto ")" then user types ")")
  if (index < next.length - 1 && next[index + 1] === added) {
    const nextExpected = target[index];
    if (nextExpected === added) {
      return { value: prev, cursor: index + 2 };
    }
    if (nextExpected !== added) {
      return { value: prev };
    }
  }

  // Append-at-end duplicate closer (legacy path)
  if (index === prev.length && prev.length > 0 && prev[prev.length - 1] === added) {
    const nextExpected = target[prev.length];
    if (nextExpected !== added) {
      return { value: prev };
    }
    return { value: prev, cursor: prev.length };
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

  // Place caret inside auto-inserted pair (e.g. "(|)" or "(|)")
  if (suffix.length > 0 && cursor === undefined) {
    cursor = ins.index + 1;
  }

  return { value: val, assistSuffix: suffix, cursor };
}
