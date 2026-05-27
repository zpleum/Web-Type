export interface Template {
  id: string;
  name: string;
  content: string;
}

export const CUSTOM_TEMPLATES: Template[] = [
  {
    id: "dropdown-css",
    name: "Dropdown CSS",
    content: `.dd {
    position: relative;
    cursor: default;
    text-align: center;
}

.ddc {
    width: 90%;
    position: absolute;
    opacity: 0;
    background-color: rgba(128, 0, 0, 0.3);
    padding: 20px;
    border-radius: 20px;
    gap: 8px;
    display: flex;
    flex-direction: column;
}

.ddc a {
    color: white !important;
    text-decoration: none;
}

.dd:hover .ddc {
    opacity: 1;
}

.ddc li {
    list-style: none;
}

@media (max-width: 768px) {
    .ddc {
        width: 100%;
    }
}`,
  },
  {
    id: "dropdown-html",
    name: "Dropdown HTML",
    content: `<ul class="dd">
    MENU
    <ul class="ddc">
        <li><a href="cre.html">Creative</a></li>
        <li><a href="cod.html">Coding</a></li>
        <li><a href="lab.html">Lab</a></li>
        <li><a href="proj.html">Project</a></li>
        <li><a href="ler.html">Resources</a></li>
    </ul>
</ul>`,
  },
  {
    id: "slider-css",
    name: "Slider CSS",
    content: `.sd {
    width: 100%;
    overflow: hidden;
}

.sd2 {
    width: 300%;
    display: flex;
    animation: slide 10s infinite;
}

@keyframes slide {
    0%, 25% {
        transform: translateX(0);
    }
    30%, 55% {
        transform: translateX(-33.33%);
    }
    60%, 85% {
        transform: translateX(-66.66%);
    }
    90%, 100% {
        transform: translateX(0);
    }
}

.sdi {
    width: 33.33%;
    object-fit: cover;
}`,
  },
  {
    id: "slider-html",
    name: "Slider HTML",
    content: `<div class="sd">
    <div class="sd2">
        <img style="margin-top:115px; margin-bottom:60px;" src="assets/menu.png" width="100%" class="sdi" />
        <img style="margin-top:115px; margin-bottom:60px;" src="assets/menu2.png" width="100%" class="sdi" />
        <img style="margin-top:115px; margin-bottom:60px;" src="assets/menu3.png" width="100%" class="sdi" />
    </div>
</div>`,
  },
];

export function parseCustomText(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.replace(/\r$/, "").trimEnd()) // strip CR + trailing spaces, keep leading indent
    .filter((line) => line.trim().length > 0);        // remove truly blank lines
}

export function saveCustomText(text: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("customWordsText", text);
  }
}

export function loadCustomText(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("customWordsText") || "";
  }
  return "";
}

export function detectLanguage(text: string, templateId?: string): "css" | "html" | "js" {
  if (templateId) {
    const tid = templateId.toLowerCase();
    if (tid.includes("css")) return "css";
    if (tid.includes("html")) return "html";
    if (tid.includes("js") || tid.includes("javascript") || tid.includes("ts") || tid.includes("typescript")) return "js";
  }
  const trimmed = text.trim();
  if (trimmed.startsWith("<")) return "html";
  if (trimmed.includes("{") && (trimmed.includes(".") || trimmed.includes("#") || trimmed.includes(":") || trimmed.includes("@"))) {
    return "css";
  }
  return "js";
}
