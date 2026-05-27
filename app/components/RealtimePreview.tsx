"use client";

import { useTheme } from "./ThemeProvider";
import { FiPlay, FiTerminal, FiEye } from "react-icons/fi";
import { useEffect, useState, useRef } from "react";

interface Props {
  typed: string;
  lang: string;
}

export default function RealtimePreview({ typed, lang }: Props) {
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";
  const [iframeHeight, setIframeHeight] = useState(130);
  const linterWarning = useRef<string | null>(null);

  // Simple real-time parenthesis & brace bracket balance linter
  const checkBrackets = (code: string): string | null => {
    const stack: string[] = [];
    const pairs: Record<string, string> = { "}": "{", ")": "(", "]": "[" };
    for (let char of code) {
      if (["{", "(", "["].includes(char)) {
        stack.push(char);
      } else if (["}", ")", "]"].includes(char)) {
        if (stack.length === 0 || stack[stack.length - 1] !== pairs[char]) {
          return `Unbalanced closer '${char}' detected.`;
        }
        stack.pop();
      }
    }
    if (stack.length > 0) {
      const open = stack[stack.length - 1];
      const names: Record<string, string> = { "{": "curly brace '{'", "(": "parenthesis '('", "[": "bracket '['" };
      return `Waiting for closing '${open === "{" ? "}" : open === "(" ? ")" : "]"}' for ${names[open] || open}.`;
    }
    return null;
  };

  linterWarning.current = checkBrackets(typed);

  const isHtmlOrCss = ["html", "css", "tailwind"].includes(lang);

  // Build the dynamic Iframe source doc
  const getIframeSrcDoc = () => {
    let styleBlock = "";
    let bodyContent = "";

    if (lang === "css") {
      styleBlock = `
        /* User's live typed CSS styling rules */
        ${typed}
        
        /* Base preview element fallback styles */
        .preview-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          box-sizing: border-box;
        }
        .card {
          background: ${isDarkMode ? "rgba(255,255,255,0.03)" : "#ffffff"};
          border: 1px solid ${isDarkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"};
          border-radius: 16px;
          padding: 20px;
          max-width: 280px;
          width: 100%;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          font-family: system-ui, -apple-system, sans-serif;
          transition: all 0.3s ease;
        }
        .badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: #6d5fd4;
          color: white;
          padding: 4px 10px;
          border-radius: 9999px;
          margin-bottom: 12px;
        }
        h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 700;
          color: ${isDarkMode ? "#fafafa" : "#18181b"};
        }
        p {
          margin: 0 0 16px 0;
          font-size: 13px;
          color: ${isDarkMode ? "#a1a1aa" : "#71717a"};
          line-height: 1.5;
        }
        .btn {
          display: inline-block;
          width: 100%;
          text-align: center;
          background: ${isDarkMode ? "#8b7cf0" : "#6d5fd4"};
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
      `;
      bodyContent = `
        <div class="preview-wrapper">
          <div class="card">
            <span class="badge">Live CSS</span>
            <h3>Interactive Card</h3>
            <p>Your typed CSS styles are injected dynamically into this element. Style .card, .badge, .btn, h3, or p!</p>
            <button class="btn">Button Element</button>
          </div>
        </div>
      `;
    } else {
      // html or tailwind
      styleBlock = `
        body {
          font-family: system-ui, -apple-system, sans-serif;
          color: ${isDarkMode ? "#fafafa" : "#18181b"};
          background: transparent;
          margin: 0;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }
        .badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          background: #6d5fd4;
          color: white;
          padding: 3px 8px;
          border-radius: 9999px;
        }
        .card {
          background: ${isDarkMode ? "#1a1a1e" : "#f0f0f3"};
          border: 1px solid ${isDarkMode ? "#2c2c35" : "#e4e4e8"};
          padding: 16px;
          border-radius: 12px;
          max-width: 320px;
          width: 100%;
        }
      `;
      bodyContent = typed || `<span style="color: #71717a; font-size: 13px; font-style: italic;">Start typing code to view real-time HTML render...</span>`;
    }

    const tailwindCdn = lang === "tailwind" ? `<script src="https://cdn.tailwindcss.com"></script>` : "";

    return `
      <!DOCTYPE html>
      <html style="overflow: hidden;"> <head>
          <meta charset="UTF-8">
          ${tailwindCdn}
          <style>
            html, body {
              background: transparent !important;
              overflow: hidden !important;
              height: auto !important;
            }
            ${styleBlock}
          </style>
        </head>
        <body>
          ${bodyContent}
        </body>
      </html>
    `;
  };

  // Generate simulated console terminal logs for JS frameworks
  const getSimulatedLogs = () => {
    const logs = [];
    const safeTyped = typed.trim();

    if (!safeTyped) {
      return [
        `<span class="text-muted/60">Waiting for compiler... Start typing to launch live dev-server shell.</span>`
      ];
    }

    // Header simulated server information
    logs.push(`<span class="text-blue-400 font-semibold">[DevServer]</span> Starting sandbox session for Lang: <span class="text-violet-300 font-semibold">${lang.toUpperCase()}</span>`);
    logs.push(`<span class="text-green-400 font-semibold">[Webpack]</span> Live compilation started...`);

    // Analyse typed content for simulated logs
    if (linterWarning.current) {
      logs.push(`<span class="text-amber-400 font-semibold">[Linter]</span> ${linterWarning.current}`);
    } else {
      logs.push(`<span class="text-emerald-400 font-semibold">[Linter]</span> Syntax checks completed. 0 warnings.`);
    }

    if (lang === "js" || lang === "react") {
      logs.push(`<span class="text-cyan-400">[Runtime]</span> Mounting dynamic React components...`);
      if (safeTyped.includes("useState")) {
        logs.push(`<span class="text-pink-400">[Hook]</span> useState state variable successfully registered.`);
      }
      if (safeTyped.includes("useEffect")) {
        logs.push(`<span class="text-pink-400">[Hook]</span> useEffect hook initialized (monitoring dependencies).`);
      }
      if (safeTyped.includes("export default")) {
        logs.push(`<span class="text-green-400">[Render]</span> Exported module matched: &lt;Component /&gt; mounted successfully.`);
      }
    } else if (lang === "vue") {
      logs.push(`<span class="text-emerald-400">[Vue-Compiler]</span> Parsing Vue Single File Component (SFC)...`);
      if (safeTyped.includes("ref") || safeTyped.includes("reactive")) {
        logs.push(`<span class="text-emerald-400">[Vue-Reactive]</span> Initialized vue composition variables.`);
      }
      logs.push(`<span class="text-green-400">[Vue-Renderer]</span> Mounted component on #app selector.`);
    } else if (lang === "express" || lang === "next") {
      logs.push(`<span class="text-amber-400">[Node.js]</span> Executing micro-service bundle...`);
      if (safeTyped.includes("require") || safeTyped.includes("import")) {
        logs.push(`<span class="text-zinc-400">[Module]</span> Imported framework libraries.`);
      }
      if (safeTyped.includes("listen") || safeTyped.includes("port")) {
        logs.push(`<span class="text-emerald-400 font-bold">[Express]</span> Server running on http://localhost:3000`);
      }
      if (safeTyped.includes("get(") || safeTyped.includes("post(")) {
        logs.push(`<span class="text-violet-400">[Router]</span> Registered service endpoints.`);
      }
    }

    logs.push(`<span class="text-zinc-500">----------------------------------------------------</span>`);
    
    // Console log evaluator simulation
    if (safeTyped.includes("console.log")) {
      const match = safeTyped.match(/console\.log\(([^)]*)\)/);
      if (match && match[1]) {
        const rawContent = match[1].trim();
        logs.push(`<span class="text-green-400 font-bold">$ node runner.js</span>`);
        logs.push(`<span class="text-white font-semibold">[Console Output]</span> ${rawContent}`);
      } else {
        logs.push(`<span class="text-white font-semibold">[Console Output]</span> (empty console)`);
      }
    } else {
      logs.push(`<span class="text-zinc-400 font-semibold">[Ready]</span> Listening for live console inputs...`);
    }

    return logs;
  };

  return (
    <div className="card-glass border border-border/60 rounded-xl overflow-hidden mt-6 w-full max-w-2xl mx-auto shadow-lg transition-all duration-300">
      {/* Tab bar header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-[var(--code-header)] select-none">
        <div className="flex items-center gap-2">
          {isHtmlOrCss ? (
            <FiEye className="w-4 h-4 text-violet-400 animate-pulse" />
          ) : (
            <FiTerminal className="w-4 h-4 text-emerald-400" />
          )}
          <span className="text-[11px] font-bold text-muted tracking-widest uppercase">
            {isHtmlOrCss ? "Real-time Live Preview" : "Developer Console Shell"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[10px] font-medium text-emerald-500 font-mono tracking-wider">LIVE</span>
        </div>
      </div>

      {/* Frame content */}
      <div className="p-4 bg-surface-2/30">
        {isHtmlOrCss ? (
          <div className="relative border border-border/50 rounded-xl overflow-hidden bg-surface-2/30 shadow-inner flex items-center justify-center min-h-[140px] w-full">
            <iframe
              title="Live HTML/CSS Preview Sandbox"
              srcDoc={getIframeSrcDoc()}
              scrolling="no"
              className="w-full bg-transparent border-0 overflow-hidden block transition-all"
              style={{ height: `${iframeHeight}px` }}
              onLoad={(e) => {
                try {
                  const iframe = e.currentTarget;
                  const doc = iframe.contentDocument || iframe.contentWindow?.document;
                  if (doc) {
                    const body = doc.body;
                    const scrollHeight = body.scrollHeight || 130;
                    setIframeHeight(Math.min(300, Math.max(130, scrollHeight)));
                  }
                } catch (_) {
                  setIframeHeight(130);
                }
              }}
            />
          </div>
        ) : (
          /* Simulated dev terminal box */
          <div className="bg-zinc-950 font-mono text-[11px] leading-relaxed p-4 rounded-xl shadow-inner border border-zinc-800 text-zinc-300 w-full min-h-[140px] flex flex-col justify-between overflow-x-auto">
            <div className="space-y-1">
              {getSimulatedLogs().map((log, idx) => (
                <div key={idx} dangerouslySetInnerHTML={{ __html: log }} />
              ))}
            </div>
            <div className="flex items-center gap-1 mt-3 text-[10px] text-zinc-600 border-t border-zinc-900 pt-2 shrink-0 select-none">
              <FiPlay className="w-3 h-3 text-zinc-600" />
              <span>DevServer virtual shell v1.0.4 — compiles in real time</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}