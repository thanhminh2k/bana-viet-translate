import { GraduationCap, Search, Star } from "lucide-react";

export function ModeTabs({ mode, onChange, favoriteCount }) {
  const tabs = [
    ["lookup", "Tra cứu", Search],
    ["quiz", "Luyện tập", GraduationCap],
    ["saved", `Sổ từ (${favoriteCount})`, Star],
  ];

  return (
    <div className="mb-5 flex justify-center">
      <div role="tablist" className="flex rounded-full bg-white/70 p-1 shadow-sm shadow-amber-100">
        {tabs.map(([id, label, Icon]) => (
          <button
            key={id}
            role="tab"
            aria-selected={mode === id}
            onClick={() => onChange(id)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              mode === id
                ? "bg-gradient-to-r from-rose-500 to-amber-400 text-white shadow-md shadow-rose-200"
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
