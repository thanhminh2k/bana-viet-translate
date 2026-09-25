import { Star } from "lucide-react";
import { Highlighted } from "./Highlighted";
import { ACCENT_BORDERS, ACCENT_MARKERS, FONT_SERIF } from "../constants";

export function ResultCard({ g, accent, terms, saved, onToggle, tag, onOpen }) {
  return (
    <div className={`rounded-xl border border-stone-100 bg-white p-3 border-l-4 ${ACCENT_BORDERS[accent]}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-lg font-semibold text-stone-800" style={FONT_SERIF}>
          <Highlighted text={g.display} terms={terms} />
        </div>
        <button
          onClick={onToggle}
          aria-pressed={saved}
          aria-label={saved ? "Bỏ khỏi sổ từ" : "Lưu vào sổ từ"}
          title={saved ? "Bỏ khỏi sổ từ" : "Lưu vào sổ từ"}
          className={`shrink-0 rounded-full p-1 transition-colors ${
            saved ? "text-amber-500" : "text-stone-300 hover:text-amber-400"
          }`}
        >
          <Star size={18} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>
      {tag && <div className="text-[11px] text-stone-400">{tag}</div>}
      <ul className={`mt-1.5 pl-4 list-disc text-[15px] leading-relaxed text-stone-700 ${ACCENT_MARKERS[accent]}`}>
        {g.meanings.map((m, j) => (
          <li key={j}>{m}</li>
        ))}
      </ul>
      {g.examples.slice(0, 2).map((ex, j) => (
        <div key={j} className="mt-1.5 text-xs text-stone-400 italic">
          {ex}
        </div>
      ))}
      {onOpen && (
        <button
          onClick={onOpen}
          className="mt-2 text-xs font-semibold text-teal-600 hover:text-teal-700"
        >
          Tra cứu lại
        </button>
      )}
    </div>
  );
}