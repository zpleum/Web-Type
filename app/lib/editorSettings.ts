export interface EditorSettings {
  autoCloseTags: boolean;
  autoCloseQuotes: boolean;
  autoCloseBrackets: boolean;
  autoIndent: boolean;
  blindLinesDefault: boolean;
}

export const EDITOR_SETTINGS_KEY = "webtype-editor-settings";

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  autoCloseTags: true,
  autoCloseQuotes: true,
  autoCloseBrackets: true,
  autoIndent: true,
  blindLinesDefault: false,
};

export function loadEditorSettings(): EditorSettings {
  if (typeof window === "undefined") return { ...DEFAULT_EDITOR_SETTINGS };
  try {
    const raw = localStorage.getItem(EDITOR_SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_EDITOR_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<EditorSettings>;
    return {
      autoCloseTags: parsed.autoCloseTags ?? DEFAULT_EDITOR_SETTINGS.autoCloseTags,
      autoCloseQuotes: parsed.autoCloseQuotes ?? DEFAULT_EDITOR_SETTINGS.autoCloseQuotes,
      autoCloseBrackets: parsed.autoCloseBrackets ?? DEFAULT_EDITOR_SETTINGS.autoCloseBrackets,
      autoIndent: parsed.autoIndent ?? DEFAULT_EDITOR_SETTINGS.autoIndent,
      blindLinesDefault: parsed.blindLinesDefault ?? DEFAULT_EDITOR_SETTINGS.blindLinesDefault,
    };
  } catch {
    return { ...DEFAULT_EDITOR_SETTINGS };
  }
}

export function saveEditorSettings(settings: EditorSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EDITOR_SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}
