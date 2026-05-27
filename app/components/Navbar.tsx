"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FiMenu, FiX } from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";

export type Page = "home" | "test" | "custom-test" | "leaderboard" | "guide" | "about";
const LINKS: { id: Page; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "test", label: "Test" },
  { id: "custom-test", label: "Custom Test" },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "guide", label: "Guide" },
  { id: "about", label: "About" },
];

function NavLink({
  link,
  current,
  onSelect,
  layoutId = "nav-pill",
}: {
  link: (typeof LINKS)[number];
  current: Page;
  onSelect: (p: Page) => void;
  layoutId?: string;
}) {
  const active = current === link.id;
  return (
    <motion.button
      onClick={() => onSelect(link.id)}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={`relative w-full md:w-auto text-left md:text-center px-3 py-2.5 md:py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active ? "text-violet-500 dark:text-violet-300" : "text-muted hover:text-foreground"
      }`}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-lg bg-violet-500/15 border border-violet-500/25"
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      <span className="relative z-10">{link.label}</span>
    </motion.button>
  );
}

export default function Navbar({ current, onNav }: { current: Page; onNav: (p: Page) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [current]);

  const handleNav = (p: Page) => {
    onNav(p);
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 nav-bar border-b backdrop-blur-xl">
      <div className="relative flex items-center justify-between px-4 sm:px-6 py-3.5 max-w-5xl mx-auto gap-3">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => handleNav("home")}
          className="flex items-center gap-2 text-[17px] font-semibold text-foreground"
        >
          <span className="relative w-9 h-9 rounded-xl bg-white border border-border flex items-center justify-center overflow-hidden shadow-sm shrink-0">
            <Image src="/logo.png" alt="" width={28} height={28} className="object-contain" priority />
          </span>
          Web<span className="text-violet-500 dark:text-violet-400">Type</span>
        </motion.button>

        <div className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <NavLink key={l.id} link={l} current={current} onSelect={handleNav} />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/40 dark:bg-black/50 md:hidden"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="md:hidden absolute left-0 right-0 top-full z-50 border-b border-border bg-surface/95 backdrop-blur-md px-4 py-2 shadow-xl"
            >
              <div className="flex flex-col gap-0.5 pb-2">
                {LINKS.map((l) => (
                  <NavLink
                    key={l.id}
                    link={l}
                    current={current}
                    onSelect={handleNav}
                    layoutId="nav-pill-mobile"
                  />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
