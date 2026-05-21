import type { Difficulty } from "../lib/types";

const styles: Record<Difficulty, string> = {
  easy:   "bg-green-400/10 text-green-400 border border-green-400/25",
  medium: "bg-amber-400/10 text-amber-400 border border-amber-400/25",
  hard:   "bg-red-400/10  text-red-400  border border-red-400/25",
};

export default function DiffBadge({ diff }: { diff: Difficulty }) {
  return (
    <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${styles[diff]}`}>
      {diff}
    </span>
  );
}
