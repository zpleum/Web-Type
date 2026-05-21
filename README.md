# CSSType — CSS Typing Speed Test

Modern, fast, and beautiful CSS typing speed test built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind CSS 4**, and **Framer Motion**.

## ✨ Features

- ⚡ **Real-time stats** — WPM, CPM, accuracy update every 100ms
- 🎯 **Char-level feedback** — Green for correct, red for wrong
- 🎲 **45 CSS snippets** — 15 easy, 15 medium, 15 hard
- 📊 **Local leaderboard** — Top 10 scores saved to localStorage
- 🎭 **Smooth animations** — Framer Motion throughout
- 📱 **Fully responsive** — Desktop, tablet, mobile
- 🌙 **Dark theme** — Beautiful UI with Tailwind CSS

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000) to play!

## 🎮 How It Works

1. Choose difficulty (Easy, Medium, or Hard)
2. Get 5 random CSS snippets
3. Type each one correctly
4. Real-time WPM/CPM/accuracy tracking
5. See your ranking and save to leaderboard

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion v12
- **Fonts**: Inter + JetBrains Mono (Google Fonts)
- **Storage**: localStorage (no backend needed)

## 📊 Scoring

- **WPM** = (correct characters ÷ 5) ÷ minutes
- **CPM** = correct characters ÷ minutes
- **Accuracy** = (correct ÷ total) × 100

## 🏆 Difficulty Levels

### Easy (15 snippets)
Single CSS properties like `color: red;`, `font-size: 16px;`

### Medium (15 snippets)
Multiple declarations, flexbox, grid, transitions

### Hard (15 snippets)
@media queries, @keyframes, complex selectors, gradients

## 📝 Component Structure

```
app/
├── page.tsx                 # Main app state & routing
├── layout.tsx              # Root layout
├── globals.css             # Minimal CSS (keyframes only)
├── lib/
│   └── snippets.ts         # All snippet data & utilities
└── components/
    ├── Navbar.tsx          # Top navigation with layoutId
    ├── HomePage.tsx        # Landing page with diff selection
    ├── TestPage.tsx        # Main typing test logic
    ├── LeaderboardPage.tsx  # Top 10 scores display
    ├── GuidePage.tsx       # Reference & tips
    ├── AboutPage.tsx       # Info page
    ├── StatCard.tsx        # Animated stat display (useSpring)
    ├── SnippetDisplay.tsx   # Live snippet rendering
    └── DiffBadge.tsx       # Difficulty badge component
```

## 🎨 Design Features

- **Framer Motion animations** on every interaction
- **Spring physics** for stat updates (useSpring)
- **Layout animation** for navbar active state (layoutId)
- **Stagger animations** for lists
- **Smooth page transitions** with AnimatePresence
- **Tailwind utilities** for all styling (no raw CSS except keyframes)

## 💾 localStorage Structure

```javascript
// Leaderboard entries stored as:
[
  { wpm: 85, acc: 98, time: 30, diff: "easy", date: "21/5/2567" },
  // ... up to 10 entries, sorted by WPM desc
]
```

## 🔧 Development

- Linting: `npm run lint`
- Type check: `tsc --noEmit`
- Format: `npx prettier --write .`

## 📄 License

MIT — Feel free to use, modify, and distribute!

---

**Built with ❤️ for CSS developers** 🎨
