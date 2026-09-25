import { DIR_LABEL } from "../constants";
import { ResultCard } from "./ResultCard";

export default function SavedWordbook({ savedEntries, toggleFavorite, openEntry }) {
  if (savedEntries.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border-2 border-dashed border-amber-200 bg-white/60 p-8 text-center text-sm leading-relaxed text-stone-500">
        Sổ từ đang trống. Ở tab Tra cứu, bấm ngôi sao cạnh một mục từ để lưu vào đây. Các từ đã lưu có
        thể dùng để luyện tập.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex flex-col gap-2.5">
        {savedEntries.map((f, i) => (
          <ResultCard
            key={f.dir + f.key}
            g={f.g}
            accent={i % 3}
            terms={[]}
            saved
            tag={DIR_LABEL[f.dir]}
            onToggle={() => toggleFavorite(f.dir, f.key)}
            onOpen={() => openEntry(f.dir, f.g.display)}
          />
        ))}
      </div>
    </div>
  );
}
