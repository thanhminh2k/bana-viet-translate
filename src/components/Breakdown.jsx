import { Check, Copy, Languages } from "lucide-react";
import { FONT_SERIF } from "../constants";

export function Breakdown({ analysis, onReplace, copied, onCopy }) {
  const { segments, draft, words } = analysis;
  const multi = words.length > 1;
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-2">
        <Languages size={14} />
        <span>{multi ? "Dịch từng từ" : "Có phải bạn muốn tìm"}</span>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {segments.map((s, i) => {
          const found = s.entries.length > 0;
          const totalMeanings = s.entries.reduce((n, e) => n + e.meanings.length, 0);
          return (
            <div
              key={i}
              className={`rounded-lg border bg-white px-3 py-2 ${
                found ? "border-teal-200" : "border-dashed border-stone-300"
              } ${s.loose ? "opacity-50" : ""}`}
            >
              <div className="text-[11px] text-stone-400">
                {s.text}
                {s.loose && " (loại từ)"}
              </div>
              <div
                className={
                  found
                    ? "text-[15px] font-semibold text-stone-800"
                    : "text-[13px] italic font-normal text-stone-400"
                }
                style={found ? FONT_SERIF : undefined}
              >
                {found ? s.entries[0].meanings[0] : "chưa có trong từ điển"}
              </div>
              {s.entries.length > 1 && (
                <div className="text-[11px] text-stone-400">
                  khớp: {s.entries.map((e) => e.display).join(", ")}
                </div>
              )}
              {found && totalMeanings > 1 && (
                <div className="text-[11px] text-stone-400">+{totalMeanings - 1} nghĩa khác</div>
              )}
              {!found && s.suggestions.length > 0 && (
                <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-stone-400">
                  <span>có phải:</span>
                  {s.suggestions.map((sug) => (
                    <button
                      key={sug.key}
                      onClick={() => onReplace(s.start, s.len, sug.key)}
                      className="rounded bg-teal-50 px-1.5 py-0.5 font-semibold text-teal-700 hover:bg-teal-100"
                    >
                      {sug.display}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {multi && (
        <>
          <div className="mt-2.5 flex items-start justify-between gap-2">
            <div className="text-sm text-stone-700">
              <span className="text-stone-400">Tạm dịch: </span>
              <span className="font-semibold" style={FONT_SERIF}>
                {draft}
              </span>
            </div>
            <button
              onClick={onCopy}
              aria-label="Chép bản ghép"
              title="Chép bản ghép"
              className="shrink-0 rounded-md p-1 text-stone-400 hover:bg-white hover:text-teal-600"
            >
              {copied ? <Check size={16} className="text-teal-600" /> : <Copy size={16} />}
            </button>
          </div>
          <div className="mt-1 text-[11px] leading-snug text-stone-400">
            Ngữ pháp Bahnar có thể khác so với bản dịch.
          </div>
        </>
      )}
    </div>
  );
}
