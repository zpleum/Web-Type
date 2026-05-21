"use client";
import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

const ACCENTS: Record<string, { value: string; border: string }> = {
  WPM: { value: "text-violet-400", border: "border-violet-500/20" },
  CPM: { value: "text-cyan-400", border: "border-cyan-500/20" },
  Accuracy: { value: "text-emerald-400", border: "border-emerald-500/20" },
  Time: { value: "text-amber-400", border: "border-amber-500/20" },
};

export default function StatCard({ label, value, unit }: { label: string; value: number; unit?: string }) {
  const spring = useSpring(value, { stiffness: 100, damping: 18 });
  const display = useTransform(spring, (v) => Math.round(v).toString());
  const accent = ACCENTS[label] ?? { value: "text-foreground", border: "border-border" };

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`card-glass rounded-xl p-3.5 sm:p-4 border ${accent.border}`}
    >
      <p className="section-label mb-2">{label}</p>
      <p className={`text-2xl sm:text-3xl font-bold tabular-nums leading-none ${accent.value}`}>
        <motion.span>{display}</motion.span>
        {unit && <span className="text-sm text-muted font-normal ml-0.5">{unit}</span>}
      </p>
    </motion.div>
  );
}
