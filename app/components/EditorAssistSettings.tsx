"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiSettings } from "react-icons/fi";
import type { EditorSettings } from "../lib/editorSettings";
import type { Language } from "../lib/types";

type SettingKey = keyof EditorSettings;

const OPTIONS: { key: SettingKey; label: string; hint: string; htmlOnly?: boolean }[] = [
  {
    key: "autoCloseTags",
    label: "Auto-close tags",
    hint: "Inserts </tag> after > when the snippet expects it (HTML, React & Vue).",
    htmlOnly: true,
  },
  {
    key: "autoCloseQuotes",
    label: "Auto-close quotes",
    hint: 'Adds matching " or \' when expected next.',
  },
  {
    key: "autoCloseBrackets",
    label: "Auto-close brackets",
    hint: "Adds ), ], or } when expected next.",
  },
];

export default function EditorAssistSettings({
  settings,
  onChange,
  lang,
}: {
  settings: EditorSettings;
  onChange: (next: EditorSettings) => void;
  lang: Language;
}) {
  const [open, setOpen] = useState(false);
  const enabledCount = OPTIONS.filter(
    (o) => !(o.htmlOnly && lang !== "html" && lang !== "react" && lang !== "vue") && settings[o.key],
  ).length;

  const toggle = (key: SettingKey) => {
    onChange({ ...settings, [key]: !settings[key] });
  };

  return (
    <div className="mb-4 rounded-xl border border-border bg-surface/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left hover:bg-surface-2 transition-colors"
      >
        <FiSettings className="w-4 h-4 text-violet-500 dark:text-violet-400 shrink-0" />
        <span className="text-xs font-semibold text-foreground">Editor assists</span>
        <span className="text-[10px] text-muted ml-1">
          {enabledCount}/{OPTIONS.length} on
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          className="ml-auto text-muted"
        >
          <FiChevronDown className="w-4 h-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="p-3 flex flex-col gap-1">
              {OPTIONS.map((opt) => {
                const disabled = opt.htmlOnly && lang !== "html" && lang !== "react" && lang !== "vue";
                const on = disabled ? false : settings[opt.key];
                return (
                  <label
                    key={opt.key}
                    className={`flex items-center gap-3 rounded-lg px-2 py-2 transition-colors ${
                      disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-surface-2"
                    }`}
                  >
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      disabled={disabled}
                      onClick={() => !disabled && toggle(opt.key)}
                      className={`relative h-5 w-9 shrink-0 rounded-full border transition-colors ${
                        on ? "bg-violet-600 border-violet-500" : "bg-surface-3 border-border"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                          on ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-foreground block">{opt.label}</span>
                      <span className="text-[11px] text-muted">{opt.hint}</span>
                    </span>
                  </label>
                );
              })}
              <p className="text-[10px] text-muted px-2 pt-1">Saved in your browser · VS Code–style</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
