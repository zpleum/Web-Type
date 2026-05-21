# ⌨️ WebType — Web Typing Speed Test

Master the web by typing it. **WebType** is a minimalistic, high-performance web-based typing sandbox tailored specifically for developers. Sharpen your frontend and backend muscle memory by typing real production-ready syntax across 8 different web ecosystems. 

Built from the ground up using the latest bleeding-edge web stack: **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Framer Motion v12**.

---

## ✨ Features

* 🚀 **8 Web Languages & Frameworks** — Practice with real syntax ranging from frontend layouts to complex backend route architectures.
* ⚡ **Real-Time Stats Engine** — Live WPM, CPM, and accuracy updates every 100ms driven by physics-based spring animations (`useSpring`).
* 🎯 **Character-Level Feedback** — High-contrast inline validation (Green for correct, red for error) with responsive active cursor tracking.
* 📊 **Local Leaderboard** — Seamless state persistence using `localStorage` to save and sort your top 10 historical runs filtered by language and difficulty.
* 🎭 **Fluid Micro-Interactions** — Smooth layout transitions, button physics, and staggered menu renders powered entirely by Framer Motion.
* 🌙 **Zero-Flicker Dark Mode** — Native high-accessibility theme toggle utilizing Tailwind v4 modern theme variables with blocking inline injection script to prevent hydration flashing.

---

## 🚀 Quick Start

```bash
# Clone the repository and install all required dependencies
npm install

# Spin up the local web development server
npm run dev

# Build and execute the optimized production bundle
npm run build
npm start

```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) inside your browser to start typing!

---

## 🎮 How It Works

```
[ Select Language ] ➔ [ Select Difficulty ] ➔ [ Type 5 Live Snippets ] ➔ [ Check Leaderboard Ranking ]

```

1. **Pick your Stack:** Choose one of the 8 supported web technologies.
2. **Choose the Complexity:** Select your difficulty tier. The engine will randomly pull 5 code blocks matching your selection.
3. **Execute:** The countdown and stats triggers immediately on your very first keystroke. Type carefully!
4. **Claim your Rank:** If your speed and accuracy are high enough, your run gets saved into the local machine leaderboard.

---

## 📚 Supported Languages

The typing pool contains strict, authentic snippet structures mapping modern web development practices:

* **🎨 CSS** — Stylesheets, layout alignments, advanced grid utilities, and animation configurations.
* **🌐 HTML** — Document structure, form layouts, embedded parameters, and semantic markers.
* **💛 JS** — Functional logic, ES6 array methods, object operations, and loop controls.
* **⚛️ React** — Component states, properties, lifecycle handling, and modern React Hooks.
* **🍃 Tailwind** — Dense utility class strings for rapid responsive template designs.
* **🟢 Vue** — Conditional directives, reactive states, and Composition API syntax.
* **🚂 Express** — Server middleware routing, controllers, and RESTful API endpoints.
* **⚡ Next.js** — Server Components, API route handlers, and file-system App Router configurations.

---

## 🏆 Difficulty Breakdown

* **🟢 Easy** — Short single-line properties, simple assignments, or basic method invocations. (e.g., `color: red;`, `margin: 10px;`)
* **🟡 Medium** — Multi-property style rules, intermediate functions, structural grid alignments, and responsive transitions.
* **🔴 Hard** — Long-form complex syntax arrays, including nesting selectors, responsive `@media` queries, fluid fluid `@keyframes` timelines, and asynchronous route logic.

---

## 📊 Scoring Metrics

The engine evaluates your inputs based on international typing standards:

$$WPM = \frac{\text{Correct Characters} \div 5}{\text{Time Spent in Minutes}}$$

$$CPM = \frac{\text{Correct Characters}}{\text{Time Spent in Minutes}}$$

$$\text{Accuracy (\%)} = \left( \frac{\text{Correct Characters}}{\text{Total Typed Characters}} \right) \times 100$$

---

## 📝 Directory Layout

```text
app/
├── page.tsx                  # App core state router (Main controller wrapper)
├── layout.tsx                # Root layout, HTML skeleton, font optimization & metadata
├── globals.css              # Minimal global rules, resets, and custom animation keyframes
├── lib/
│   ├── theme.ts             # Theme script blocking logic ensuring flash-free hydration
│   └── snippets.ts          # Complete static dataset encompassing all 8 typing pools
└── components/
    ├── Navbar.tsx            # Sticky navigation deck with active-pill shared layoutId tracks
    ├── HomePage.tsx          # Dynamic configuration landing screen for stack & diff selection
    ├── TestPage.tsx          # Game engine, processing key triggers, timers, and array validation
    ├── LeaderboardPage.tsx    # Clean scores view filtered by local storage arrays
    ├── GuidePage.tsx         # User manual, formatting instructions, and shortcut keys
    ├── AboutPage.tsx         # Project background, repository notes, and profile links
    ├── StatCard.tsx          # High-speed reactive tracking counters utilizing useSpring
    ├── SnippetDisplay.tsx     # Syntax highlighted terminal window simulating terminal inputs
    └── ThemeToggle.tsx       # Smooth theme switching control component

```

---

## 💾 Storage Layer Schema

Leaderboard data structures are safely retained client-side inside the browser sandbox using JSON parsing hooks:

```json
[
  {
    "wpm": 92,
    "acc": 99,
    "time": 25,
    "lang": "nextjs",
    "diff": "hard",
    "date": "21/5/2026"
  }
]

```

---

## 🔧 Quality & Production Scripts

Run quality assertion suites locally before submitting pull requests or production deployments:

* **Static Linters:** `npm run lint`
* **TypeScript Compilation Check:** `tsc --noEmit`
* **Code Formatting Enforcement:** `npx prettier --write .`

---

## 📄 License

This repository is distributed under the **MIT License** — You are fully free to use, modify, share, and scale this project for your own educational or commercial platforms.

---

**Built with ❤️ for web developers who love coding at terminal speed.** ⚡🎨
