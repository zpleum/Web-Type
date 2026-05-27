"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Difficulty, Language } from "./lib/types";
import Navbar, { Page } from "./components/Navbar";
import HomePage from "./components/HomePage";
import TestPage from "./components/TestPage";
import CustomTestPage from "./components/CustomTestPage";
import LeaderboardPage from "./components/LeaderboardPage";
import GuidePage from "./components/GuidePage";
import AboutPage from "./components/AboutPage";

export default function Home() {
  const [page, setPage] = useState<Page>("home");
  const [initLang, setInitLang] = useState<Language>("css");
  const [initDiff, setInitDiff] = useState<Difficulty>("easy");

  const handleNav = (p: Page) => setPage(p);
  const handleStart = (lang: Language, diff: Difficulty, nav: Page) => {
    setInitLang(lang);
    setInitDiff(diff);
    setPage(nav);
  };

  return (
    <div className="min-h-screen flex flex-col app-mesh relative">
      <div className="pointer-events-none fixed inset-0 app-grid [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" aria-hidden />
      <Navbar current={page} onNav={handleNav} />

      <main className="flex-1 overflow-y-auto relative z-10">
        <AnimatePresence mode="wait">
          {page === "home" && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <HomePage onStart={handleStart} />
            </motion.div>
          )}
          {page === "test" && (
            <motion.div key="test" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <TestPage initLang={initLang} initDiff={initDiff} onNav={setPage} />
            </motion.div>
          )}
          {page === "custom-test" && (
            <motion.div key="custom-test" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <CustomTestPage onNav={setPage} />
            </motion.div>
          )}
          {page === "leaderboard" && (
            <motion.div key="lb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <LeaderboardPage />
            </motion.div>
          )}
          {page === "guide" && (
            <motion.div key="guide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <GuidePage initLang={initLang} />
            </motion.div>
          )}
          {page === "about" && (
            <motion.div key="about" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
              <AboutPage />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="relative z-10 footer-bar border-t px-6 py-5 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <p>© 2026 Wiraphat Makwong. Licensed under MIT License.</p>

          <div className="flex items-center gap-4">
            <a
              href="https://github.zpleum.site"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
              GitHub
            </a>
            <span className="text-border hidden sm:inline">|</span>
            <a
              href="https://www.zpleum.site"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
              Website
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
