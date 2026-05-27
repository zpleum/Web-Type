import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "../app/lib/snippets");

const EXTRA = {
  css: {
    easy: [
      "color: #333;", "color: inherit;", "color: currentColor;", "background: red;", "background-size: cover;",
      "background-position: center;", "margin: 0;", "margin-top: 8px;", "margin-bottom: 16px;", "padding: 0;",
      "padding-top: 1rem;", "padding-left: 2rem;", "width: auto;", "height: 100%;", "min-width: 0;",
      "max-height: 100vh;", "display: inline;", "display: none;", "visibility: visible;", "opacity: 1;",
      "font-size: 1rem;", "font-size: 0.875rem;", "font-weight: 400;", "font-weight: 700;", "line-height: 1.25;",
      "text-align: left;", "text-align: right;", "text-decoration: underline;", "text-transform: capitalize;",
      "letter-spacing: 0.05em;", "word-wrap: break-word;", "overflow: visible;", "overflow: scroll;",
      "position: static;", "position: fixed;", "position: sticky;", "top: 0;", "left: 0;", "right: auto;",
      "z-index: 1;", "z-index: 50;", "float: none;", "clear: left;", "box-sizing: content-box;",
      "border: 1px solid #000;", "border-radius: 4px;", "border-top: none;", "outline: 2px solid blue;",
      "box-shadow: 0 1px 2px rgba(0,0,0,0.1);", "cursor: default;", "cursor: not-allowed;", "user-select: text;",
      "pointer-events: auto;", "resize: both;", "object-fit: contain;", "object-position: center;",
      "list-style: disc;", "list-style-position: inside;", "vertical-align: top;", "white-space: pre;",
      "flex: 1;", "flex-shrink: 1;", "flex-basis: auto;", "align-self: center;", "justify-self: start;",
      "gap: 8px;", "row-gap: 12px;", "column-gap: 16px;", "order: 0;", "flex-direction: row;",
      "align-content: center;", "place-content: start;", "grid-template-columns: 1fr;", "grid-template-rows: auto;",
      "grid-column: 1;", "grid-row: 1;", "aspect-ratio: 1;", "scroll-behavior: auto;", "scroll-snap-type: none;",
      "isolation: auto;", "mix-blend-mode: normal;", "filter: none;", "transform: none;", "transition: 0.2s;",
      "animation: none;", "content: normal;", "quotes: none;", "tab-size: 4;", "hyphens: none;",
    ],
    medium: [
      "display: flex; flex-direction: row; gap: 1rem;", "display: grid; grid-template-columns: repeat(2, 1fr);",
      "margin: 1rem 2rem; padding: 0.5rem 1rem;", "font: 500 1rem/1.5 system-ui, sans-serif;",
      "background: linear-gradient(180deg, #fff, #eee);", "border: 2px solid var(--border, #ccc);",
      "border-radius: 0.5rem 1rem;", "box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);",
      "transform: translateY(-2px);", "transform: rotate(45deg);", "filter: blur(2px);",
      "transition: color 0.2s, background 0.2s;", "animation: slide 0.4s ease-out;",
      "overflow: hidden; text-overflow: ellipsis;", "white-space: nowrap; max-width: 20ch;",
      "position: relative; z-index: 2;", "inset: 0;", "width: min(100%, 640px);",
      "height: clamp(200px, 40vh, 600px);", "aspect-ratio: 16/9; object-fit: cover;",
      "grid-auto-flow: column; grid-auto-columns: 120px;", "flex: 1 1 200px; align-items: stretch;",
      "justify-content: flex-end; place-items: end;", "scroll-snap-type: y proximity;",
      "overscroll-behavior: auto;", "touch-action: pan-x;", "user-select: all;",
      "caret-color: auto;", "accent-color: auto;", "color-scheme: light dark;",
      "contain: layout style;", "content-visibility: hidden;", "will-change: auto;",
      "mask-size: cover;", "clip-path: inset(0);", "shape-margin: 1rem;",
      "column-width: 200px;", "break-inside: avoid;", "orphans: 3; widows: 3;",
      "text-indent: 1em hanging;", "word-spacing: 0.25em;", "letter-spacing: 0.1em;",
      "font-variant: small-caps;", "font-stretch: condensed;", "text-decoration-thickness: 2px;",
      "outline-offset: 2px;", "border-inline: 1px solid;", "margin-block: 1rem;",
      "padding-inline: 1.5rem;", "inset-block: 0;", "block-size: auto; inline-size: 100%;",
    ],
    hard: [
      "@media (min-width: 1024px) { .sidebar { width: 280px; } }",
      "@media (hover: hover) { .btn:hover { opacity: 0.9; } }",
      "@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }",
      ":is(h1, h2, h3):where(:not([class])) { margin-block: 0 0.5em; }",
      ":where(ul, ol) { padding-inline-start: 1.5rem; }",
      ".grid > *:nth-child(3n) { grid-column: span 2; }",
      "a[href^='https://']::after { content: ' ↗'; font-size: 0.85em; }",
      "input:user-invalid { border-color: #ef4444; }",
      "::placeholder { color: #9ca3af; opacity: 1; }",
      "@layer reset, base, components, utilities;",
      "@layer components { .card { padding: 1rem; border-radius: 0.75rem; } }",
      "@property --angle { syntax: '<angle>'; inherits: false; initial-value: 0deg; }",
      "background: conic-gradient(from var(--angle), red, yellow, lime, aqua, blue, magenta, red);",
      "animation: spin 4s linear infinite; @keyframes spin { to { --angle: 360deg; } }",
      "grid-template-columns: subgrid; grid-column: 1 / -1;",
      "container-type: size; @container (min-height: 400px) { .hero { min-height: 50cqh; } }",
      "view-transition-name: hero-image; ::view-transition-old(hero-image) { animation: fade-out 0.3s; }",
      "scroll-timeline: --section-scroll y; animation-timeline: --section-scroll;",
      "position: fixed; position-area: block-end span-inline-end;",
      "color: color-mix(in oklch, var(--fg) 85%, var(--bg));",
      "background-color: light-dark(#fff, #111);", "border-color: color-mix(in srgb, canvasText 20%, transparent);",
      "filter: url(#noise) contrast(120%);", "clip-path: path('M0,0 H100 V100 Z');",
      "mask-composite: intersect; mask-mode: alpha;", "shape-outside: margin-box;",
      "text-wrap: balance; text-wrap: pretty;", "initial-letter: 3 2;",
      "font-variation-settings: 'wght' 650, 'opsz' 32;", "font-optical-sizing: auto;",
      "text-decoration: underline dotted from-font;", "hyphenate-limit-chars: 6 3 2;",
      "overflow: clip; scrollbar-gutter: stable both-edges;",
      "overscroll-behavior-block: contain;", "scroll-margin-block: 4rem;",
      ":has(> img) { display: grid; place-items: center; }",
      ":not(.skip-link):focus-visible { outline: 2px solid Highlight;",
    ],
  },
  html: {
    easy: [
      "<main></main>", "<nav></nav>", "<section></section>", "<article></article>",
      "<p class=\"text\"></p>", "<div id=\"root\"></div>", "<span class=\"badge\">New</span>",
      "<a href=\"/\">Home</a>", "<a href=\"/about\">About</a>", "<img src=\"/logo.svg\" alt=\"\">",
      "<button type=\"button\">Save</button>", "<button disabled>Wait</button>",
      "<input type=\"text\" name=\"q\">", "<input type=\"number\" min=\"0\">",
      "<input type=\"date\">", "<input type=\"file\" accept=\"image/*\">",
      "<textarea rows=\"4\" cols=\"40\"></textarea>", "<select name=\"size\"><option>S</option></select>",
      "<label for=\"email\">Email</label>", "<form action=\"/api\" method=\"post\"></form>",
      "<table border=\"1\"></table>", "<thead><tr><th>Name</th></tr></thead>",
      "<tbody><tr><td>Ada</td></tr></tbody>", "<ul><li>One</li></ul>", "<ol start=\"1\"><li>First</li></ol>",
      "<dl><dt>CPU</dt><dd>Central unit</dd></dl>", "<h3>Section</h3>", "<h4>Sub</h4>",
      "<hr class=\"divider\">", "<br aria-hidden=\"true\">", "<strong>Important</strong>",
      "<em>emphasis</em>", "<code>npm install</code>", "<pre><code></code></pre>",
      "<blockquote cite=\"\">Quote</blockquote>", "<figure><img alt=\"\"><figcaption></figcaption></figure>",
      "<video controls src=\"\"></video>", "<audio controls src=\"\"></audio>",
      "<source type=\"video/mp4\" src=\"\">", "<iframe title=\"\" src=\"\"></iframe>",
      "<canvas width=\"300\" height=\"150\"></canvas>", "<svg viewBox=\"0 0 24 24\"></svg>",
      "<link rel=\"icon\" href=\"/favicon.ico\">", "<meta charset=\"UTF-8\">",
      "<meta name=\"description\" content=\"\">", "<title>App</title>", "<style>body{margin:0}</style>",
      "<script defer src=\"/app.js\"></script>", "<noscript>Enable JS</noscript>",
      "<template id=\"tpl\"></template>", "<slot name=\"icon\"></slot>", "<details><summary>FAQ</summary></details>",
      "<dialog open></dialog>", "<meter min=\"0\" max=\"100\" value=\"60\"></meter>",
      "<progress max=\"100\" value=\"25\"></progress>", "<output for=\"range\"></output>",
      "<fieldset><legend>Account</legend></fieldset>", "<datalist id=\"colors\"></datalist>",
      "<optgroup label=\"Group\"></optgroup>", "<colgroup span=\"2\"></colgroup>",
      "<caption>Scores</caption>", "<wbr>", "<!-- TODO: fix -->",
    ],
    medium: [
      "<input type=\"search\" placeholder=\"Search\" autocomplete=\"off\">",
      "<input type=\"tel\" pattern=\"[0-9]{10}\">", "<input type=\"url\" required>",
      "<button type=\"submit\" formaction=\"/save\">Submit</button>",
      "<a href=\"mailto:support@example.com\">Email us</a>", "<a href=\"tel:+15551234\">Call</a>",
      "<a download href=\"/file.pdf\">Download</a>", "<a target=\"_blank\" rel=\"noopener\">External</a>",
      "<img srcset=\"a.jpg 1x, b.jpg 2x\" sizes=\"100vw\" alt=\"\">",
      "<picture><source media=\"(min-width:800px)\" srcset=\"\"><img alt=\"\"></picture>",
      "<video poster=\"thumb.jpg\" preload=\"metadata\"></video>",
      "<form enctype=\"multipart/form-data\" method=\"POST\"></form>",
      "<label><input type=\"checkbox\" name=\"agree\"> I agree</label>",
      "<select multiple name=\"tags\"></select>", "<textarea maxlength=\"500\"></textarea>",
      "<table role=\"grid\"><thead></thead><tbody></tbody></table>",
      "<th scope=\"col\" abbr=\"Id\">ID</th>", "<td colspan=\"2\" rowspan=\"1\">Cell</td>",
      "<nav aria-label=\"Primary\"><ul><li><a href=\"/\">Home</a></li></ul></nav>",
      "<button aria-expanded=\"false\" aria-controls=\"menu\">Menu</button>",
      "<div role=\"alert\" aria-live=\"polite\"></div>", "<span aria-hidden=\"true\">*</span>",
      "<main id=\"content\" tabindex=\"-1\"></main>", "<section aria-labelledby=\"h-features\"></section>",
      "<article itemscope itemtype=\"https://schema.org/Article\"></article>",
      "<meta property=\"og:title\" content=\"\">", "<meta name=\"twitter:card\" content=\"summary\">",
      "<link rel=\"canonical\" href=\"https://example.com/page\">",
      "<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">",
      "<script type=\"module\" src=\"/main.js\"></script>",
      "<style>@media (min-width:768px){.nav{display:flex}}</style>",
      "<svg aria-hidden=\"true\" focusable=\"false\"><use href=\"#icon\"></use></svg>",
      "<iframe sandbox=\"allow-scripts\" loading=\"lazy\"></iframe>",
      "<object data=\"file.pdf\" type=\"application/pdf\"></object>",
      "<map name=\"map\"><area shape=\"rect\" coords=\"\" href=\"\"></map>",
    ],
    hard: [
      "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"UTF-8\"><title>Doc</title></head><body></body></html>",
      "<input list=\"ids\" name=\"id\"><datalist id=\"ids\"><option value=\"a1\"></option></datalist>",
      "<form><input type=\"hidden\" name=\"_token\" value=\"\"><button formaction=\"/draft\" formmethod=\"post\">Draft</button></form>",
      "<dialog id=\"modal\"><form method=\"dialog\"><button>Close</button></form></dialog>",
      "<details name=\"acc\"><summary>One</summary><p>A</p></details>",
      "<template shadowrootmode=\"open\"><style>:host{display:block}</style><slot></slot></template>",
      "<custom-element data-version=\"2\"><span slot=\"label\">Label</span></custom-element>",
      "<math xmlns=\"http://www.w3.org/1998/Math/MathML\"><mi>x</mi></math>",
      "<table><caption>Data</caption><colgroup><col span=\"2\"></colgroup><thead><tr><th scope=\"col\">X</th></tr></thead></table>",
      "<video controls muted playsinline loop><source src=\"a.webm\" type=\"video/webm\"></video>",
      "<picture><source type=\"image/avif\" srcset=\"hero.avif\"><img width=\"1200\" height=\"630\" alt=\"Hero\"></picture>",
      "<a href=\"/search?q=test&amp;page=2\">Results</a>", "<a href=\"?tab=settings#billing\">Billing</a>",
      "<meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'self'\">",
      "<link rel=\"alternate\" hreflang=\"th\" href=\"/th/\">", "<link rel=\"manifest\" href=\"/manifest.webmanifest\">",
      "<script type=\"importmap\">{\"imports\":{\"vue\":\"/vue.js\"}}</script>",
      "<svg viewBox=\"0 0 100 100\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"50\" cy=\"50\" r=\"40\"/></svg>",
      "<form novalidate><input required minlength=\"3\" aria-describedby=\"err\"><span id=\"err\" role=\"alert\"></span></form>",
      "<nav><ol><li><a href=\"/\">Home</a></li><li aria-current=\"page\">Settings</li></ol></nav>",
      "<fieldset disabled><legend>Shipping</legend><input name=\"zip\" autocomplete=\"postal-code\"></fieldset>",
      "<iframe srcdoc=\"<p>Hi</p>\" title=\"Preview\" referrerpolicy=\"no-referrer\"></iframe>",
      "<object type=\"image/svg+xml\" data=\"chart.svg\" width=\"400\" height=\"300\"></object>",
      "<table><tbody><tr><td headers=\"h1 h2\" id=\"c1\">Value</td></tr></tbody></table>",
      "<button popovertarget=\"tip\" popovertargetaction=\"toggle\">?</button><div id=\"tip\" popover>Help</div>",
    ],
  },
  js: {
    easy: [
      "let n = 0;", "const pi = 3.14;", "var legacy = true;", "x = 1 + 2;", "a && b;", "a || b;", "!flag;",
      "if (x) return;", "else return 0;", "for (const x of arr) {}", "for (let i = 0; i < n; i++) {}",
      "while (n--) {}", "do {} while (false);", "switch (k) { case 1: break; }", "default: break;",
      "break;", "continue;", "return;", "throw new Error('fail');", "try {} catch (e) { console.error(e); }",
      "finally {}", "function add(a, b) { return a + b; }", "const sub = (a, b) => a - b;",
      "const fn = function() {};", "class Point {}", "new Point()", "extends Array", "super();",
      "this.x = 0;", "static id = 1;", "get area() {}", "set value(v) { this._v = v; }",
      "import x from './x';", "export { x };", "export default fn;", "console.log(data);",
      "console.warn('warn');", "console.error(err);", "debugger;", "typeof x === 'number'",
      "Array.isArray(x)", "x instanceof Date", "null", "undefined", "NaN", "Infinity",
      "Object.keys(o)", "Object.values(o)", "Object.entries(o)", "JSON.parse(s)", "JSON.stringify(o)",
      "Math.random()", "Math.floor(x)", "Date.now()", "new Date()", "setTimeout(fn, 0);",
      "clearTimeout(id);", "setInterval(tick, 1000);", "clearInterval(id);", "Promise.resolve(1)",
      "async function run() {}", "await p;", "fetch(url)", "localStorage.getItem('k')",
      "sessionStorage.setItem('k', '1');", "document.querySelector('.a')", "el.textContent = '';",
      "el.classList.add('on');", "el.addEventListener('click', fn);", "event.preventDefault();",
      "window.location.href = '/';", "navigator.userAgent", "crypto.getRandomValues(buf);",
    ],
    medium: [
      "const [a, b] = [1, 2];", "const { id, name } = user;", "const copy = { ...obj, id: 2 };",
      "const list = [...a, ...b];", "const tpl = `hi ${name}`;", "String.raw`line\\n`;",
      "arr.map(x => x * 2)", "arr.filter(Boolean)", "arr.reduce((s, x) => s + x, 0)",
      "arr.find(x => x.id === id)", "arr.some(x => x.ok)", "arr.every(x => x > 0)",
      "arr.flatMap(x => x.items)", "arr.at(-1)", "arr.toSorted((a,b) => a - b)",
      "new Map([[k,v]])", "map.get(k)", "new Set(list)", "set.has(x)",
      "Object.assign({}, defaults, opts)", "Object.freeze(obj)", "structuredClone(obj)",
      "Symbol('id')", "Symbol.for('app')", "WeakMap", "WeakSet", "Proxy target {}",
      "Reflect.get(obj, 'k')", "new Error('msg', { cause: err })", "Error.captureStackTrace(err)",
      "Promise.all([a,b])", "Promise.race([a,b])", "Promise.allSettled(tasks)",
      "new Promise((res, rej) => {})", "async function* gen() { yield 1; }",
      "for await (const x of stream) {}", "AbortController", "signal.aborted",
      "Intl.NumberFormat('en').format(n)", "Intl.DateTimeFormat().format(d)",
      "queueMicrotask(() => {})", "requestAnimationFrame(draw)", "performance.now()",
      "import { readFile } from 'node:fs/promises';", "import.meta.url", "process.env.NODE_ENV",
      "Buffer.from(s, 'utf8')", "URL.createObjectURL(blob)", "URL.revokeObjectURL(u)",
      "new URL('/path', base)", "btoa(s)", "atob(s)", "encodeURIComponent(s)",
    ],
    hard: [
      "const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };",
      "const throttle = (fn, ms) => { let last = 0; return (...a) => { const n = Date.now(); if (n - last >= ms) { last = n; fn(...a); } }; };",
      "function* range(n) { for (let i = 0; i < n; i++) yield i; }",
      "const memoize = (fn) => { const c = new Map(); return (k) => c.has(k) ? c.get(k) : c.set(k, fn(k)).get(k); };",
      "class Emitter { #h = new Map(); on(e, fn) { (this.#h.get(e) ?? this.#h.set(e, []).get(e)).push(fn); } emit(e, d) { this.#h.get(e)?.forEach(fn => fn(d)); } }",
      "const deepMerge = (a, b) => ({ ...a, ...Object.fromEntries(Object.entries(b).map(([k,v]) => [k, v && typeof v === 'object' ? deepMerge(a[k], v) : v])) });",
      "await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });",
      "const res = await fetch(url, { signal: AbortSignal.timeout(5000) }); if (!res.ok) throw new Error(res.statusText);",
      "const ws = new WebSocket(url); ws.onmessage = (e) => onMsg(JSON.parse(e.data));",
      "const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });",
      "const channel = new MessageChannel(); port1.postMessage({ type: 'init' }, [ transferable ]);",
      "Object.groupBy(items, (i) => i.category)", "Map.groupBy(items, (i) => i.type)",
      "const cmp = new Intl.Collator('en', { sensitivity: 'base' }).compare;",
      "Temporal.Now.instant().toString()", "using disposer = acquire();",
      "import { Worker, isMainThread, parentPort } from 'node:worker_threads';",
      "const ac = new AbortController(); fetch(url, { signal: ac.signal }); ac.abort();",
      "const stream = ReadableStream.from(async function* () { yield chunk; }());",
      "await Bun.write(path, data);", "Deno.readTextFileSync(path);",
    ],
  },
  react: { easy: [], medium: [], hard: [] },
  tailwind: { easy: [], medium: [], hard: [] },
  vue: { easy: [], medium: [], hard: [] },
  express: { easy: [], medium: [], hard: [] },
  next: { easy: [], medium: [], hard: [] },
};

// Fill react, vue, express, next, tailwind extras inline below
Object.assign(EXTRA.react, {
  easy: [
    "import React from 'react';", "export default function App() { return <div />; }",
    "<button onClick={() => setOpen(true)}>Open</button>", "<input value={text} onChange={onChange} />",
    "const [count, setCount] = useState(0);", "useEffect(() => {}, []);", "useRef(null);",
    "<div className=\"flex gap-2\">", "<p className=\"text-sm text-muted\">", "{items.map(i => <li key={i.id} />)}",
    "{show && <Modal onClose={() => setShow(false)} />}", "<Link href=\"/about\">About</Link>",
    "children", "props.title", "spread {...rest}", "<Component as=\"section\" />",
  ],
  medium: [
    "\"use client\";", "import { useState, useEffect } from 'react';",
    "const onClick = (e: React.MouseEvent<HTMLButtonElement>) => { e.preventDefault(); };",
    "useMemo(() => compute(a, b), [a, b]);", "useCallback(() => action(id), [id]);",
    "forwardRef<HTMLInputElement, Props>(function Input(props, ref) { return <input ref={ref} {...props} />; })",
    "<Suspense fallback={<Spinner />}><Page /></Suspense>", "dynamic(() => import('./Chart'), { ssr: false })",
  ],
  hard: [
    "export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <View id={id} />; }",
    "const { data } = useQuery({ queryKey: ['post', id], queryFn: () => fetchPost(id) });",
    "export function Providers({ children }: { children: React.ReactNode }) { return <QueryClientProvider client={qc}>{children}</QueryClientProvider>; }",
  ],
});

Object.assign(EXTRA.vue, {
  easy: [
    "const count = ref(0);", "<template><div /></template>", "v-if=\"ok\"", "v-for=\"n in 10\" :key=\"n\"",
    "@click=\"submit\"", "v-model=\"email\"", "import { ref, computed } from 'vue';", "defineProps<{ id: string }>()",
  ],
  medium: [
    "<script setup lang=\"ts\">", "const emit = defineEmits<{ save: [id: string] }>();", "watchEffect(() => {});",
    "const route = useRoute();", "router.push({ name: 'home' });", "defineAsyncComponent(() => import('./Modal.vue'))",
  ],
  hard: [
    "const { data } = await useAsyncData('users', () => $fetch('/api/users'));", "definePageMeta({ layout: 'admin' });",
    "export default defineNuxtConfig({ modules: ['@nuxtjs/tailwindcss'] });",
  ],
});

Object.assign(EXTRA.express, {
  easy: [
    "app.get('/api/health', (req, res) => res.json({ ok: true }));", "app.use(express.json());",
    "const { id } = req.params;", "res.status(404).json({ error: 'Not found' });", "next();",
  ],
  medium: [
    "router.use(authMiddleware);", "app.use('/api/v1', apiRouter);",
    "app.use((err, req, res, next) => { res.status(500).json({ message: err.message }); });",
    "const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);",
  ],
  hard: [
    "export function createApp() { const app = express(); app.set('trust proxy', 1); return app; }",
    "app.post('/webhook', express.raw({ type: 'application/json' }), verifySignature, handler);",
  ],
});

Object.assign(EXTRA.next, {
  easy: [
    "export async function GET() { return NextResponse.json({ ok: true }); }",
    "const data = await request.json();", "redirect('/login');", "cookies().get('session');",
  ],
  medium: [
    "export async function POST(req: Request) { const body = await req.json(); return NextResponse.json(body, { status: 201 }); }",
    "export const revalidate = 60;", "'use server';", "revalidatePath('/blog');",
  ],
  hard: [
    "export async function GET(request: NextRequest) { const token = request.headers.get('authorization'); if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }",
    "export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; return { title: slug }; }",
  ],
});

Object.assign(EXTRA.tailwind, {
  easy: [
    "inline-flex", "items-center", "justify-center", "rounded-md", "px-3", "py-1.5", "text-sm", "font-medium",
    "border-border", "bg-background", "text-foreground", "shadow-sm", "ring-1", "ring-border",
    "hover:bg-muted", "focus-visible:outline-none", "disabled:pointer-events-none", "sr-only",
  ],
  medium: [
    "md:flex", "lg:grid-cols-3", "sm:px-6", "max-w-prose", "mx-auto", "space-y-4",
    "divide-y", "divide-border", "from-primary", "to-primary/60", "bg-gradient-to-r",
  ],
  hard: [
    "@[40rem]:flex",
    "data-[state=open]:animate-in", 
    "has-[:focus-visible]:ring-2",
    "grid-cols-[repeat(auto-fill,minmax(12rem,1fr))]", 
    "text-[length:var(--step-0)]",
  ],
});

function mergeSnippets(file, extras) {
  const path = join(dir, `${file}.ts`);
  let src = readFileSync(path, "utf8");
  for (const diff of ["easy", "medium", "hard"]) {
    const items = extras[diff];
    if (!items?.length) continue;
    const block = items.map((s) => `    ${JSON.stringify(s)},`).join("\n");
    const re = new RegExp(`(${diff}:\\s*\\[[\\s\\S]*?)(\\n  ],)`, "m");
    if (!re.test(src)) {
      console.warn(`skip ${file} ${diff}`);
      continue;
    }
    src = src.replace(re, `$1\n${block}$2`);
  }
  writeFileSync(path, src);
  console.log(`updated ${file}.ts`);
}

for (const [file, extras] of Object.entries(EXTRA)) {
  mergeSnippets(file, extras);
}

console.log("done");
