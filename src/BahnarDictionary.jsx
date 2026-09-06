import { useMemo, useState } from "react";
import { ArrowLeftRight, Search, BookOpenText } from "lucide-react";
import DICT_RAW from "../bana_viet_dict.json";

/* =========================================================================
 * 1) DỮ LIỆU TỪ ĐIỂN
 *    Được import trực tiếp từ file bana_viet_dict.json (đặt cùng thư mục).
 *    Mỗi mục có dạng: { bana, viet, example? }
 * ======================================================================= */

/* =========================================================================
 * 2) STYLE TUỲ BIẾN (phần không thể làm bằng Tailwind thuần)
 *    - Import font
 *    - Dải hoa văn thổ cẩm (repeating-linear-gradient cần CSS thường)
 *    Toàn bộ phần còn lại của giao diện dùng Tailwind utility classes.
 * ======================================================================= */
const FONT_IMPORT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
`;

const WOVEN_BAR_STYLE = {
  backgroundImage:
    "repeating-linear-gradient(-45deg, #fb7185 0px, #fb7185 8px, #2dd4bf 8px, #2dd4bf 16px, #fbbf24 16px, #fbbf24 24px, transparent 24px, transparent 28px)",
};

const FONT_SERIF = { fontFamily: "'Fraunces', serif" };
const FONT_SANS = { fontFamily: "'Be Vietnam Pro', sans-serif" };

// Ba màu điểm nhấn xoay vòng cho từng thẻ kết quả, tạo cảm giác sinh động
const ACCENT_BORDERS = ["border-l-teal-400", "border-l-rose-400", "border-l-amber-400"];
const ACCENT_MARKERS = ["marker:text-teal-500", "marker:text-rose-500", "marker:text-amber-500"];

/* =========================================================================
 * 3) HÀM TIỆN ÍCH
 * ======================================================================= */
function normalize(s) {
  return (s || "").toLowerCase().trim();
}

function Highlighted({ text, query }) {
  if (!query) return <>{text}</>;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-amber-300 text-stone-900 rounded px-0.5">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </>
  );
}

/* =========================================================================
 * 4) COMPONENT CHÍNH
 * ======================================================================= */
export default function BahnarDictionary() {
  const [direction, setDirection] = useState("bv"); // 'bv' = Bahnar->Việt, 'vb' = Việt->Bahnar
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const map = new Map();
    for (const row of DICT_RAW) {
      const bana = row.bana;
      const viet = row.viet;
      const example = row.example;
      const src = direction === "bv" ? bana : viet;
      const tgt = direction === "bv" ? viet : bana;
      const key = normalize(src);
      if (!key) continue;
      if (!map.has(key)) {
        map.set(key, { display: src, meanings: [], examples: [] });
      }
      const g = map.get(key);
      if (!g.meanings.includes(tgt)) g.meanings.push(tgt);
      if (example && !g.examples.includes(example)) g.examples.push(example);
    }
    return map;
  }, [direction]);

  const entryCount = useMemo(() => {
    const s = new Set();
    DICT_RAW.forEach((r) => s.add(normalize(r.bana) + "|" + normalize(r.viet)));
    return s.size;
  }, []);

  const results = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    const starts = [];
    const includes = [];
    for (const [key, g] of grouped) {
      if (key.startsWith(q)) starts.push({ key, ...g });
      else if (key.includes(q)) includes.push({ key, ...g });
    }
    const byLenThenAlpha = (a, b) => a.key.length - b.key.length || a.key.localeCompare(b.key);
    starts.sort(byLenThenAlpha);
    includes.sort(byLenThenAlpha);
    return [...starts, ...includes].slice(0, 60);
  }, [query, grouped]);

  const srcLabel = direction === "bv" ? "Tiếng Bahnar" : "Tiếng Việt";
  const tgtLabel = direction === "bv" ? "Tiếng Việt" : "Tiếng Bahnar";
  const placeholder =
    direction === "bv"
      ? "Nhập từ Bahnar, ví dụ: akap, ake, along…"
      : "Nhập từ tiếng Việt, ví dụ: bẫy, sừng, cây lúa…";

  function swap() {
    setDirection((d) => (d === "bv" ? "vb" : "bv"));
  }

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-br from-amber-50 via-orange-50 to-teal-50 px-4 py-8 sm:px-6 sm:py-10"
      style={FONT_SANS}
    >
      <style>{FONT_IMPORT_CSS}</style>

      <div className="mx-auto max-w-4xl">
        {/* ---------- HEADER ---------- */}
        <div className="flex flex-col items-center text-center gap-2">
          <span className="flex items-center gap-2 text-teal-600">
            <BookOpenText size={22} />
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold text-stone-800" style={FONT_SERIF}>
            <span className="text-rose-500">Bahnar</span>
            <span className="text-amber-400 mx-2">·</span>
            <span className="text-teal-600">Việt</span>
          </h1>
          <p className="text-sm sm:text-base text-stone-500">
            Từ điển đối chiếu Bahnar – Tiếng Việt
          </p>
        </div>

        {/* dải hoa văn thổ cẩm */}
        <div className="h-2.5 rounded-full my-6 opacity-90" style={WOVEN_BAR_STYLE} />

        {/* ---------- KHU VỰC TRA CỨU ---------- */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Panel nguồn */}
          <div className="flex flex-col min-h-72 sm:min-h-80 rounded-2xl border-2 border-teal-100 bg-white/80 shadow-sm shadow-teal-100 p-5">
            <div className="flex items-center gap-2 text-teal-600 font-semibold mb-3">
              <Search size={16} />
              <span>{srcLabel}</span>
            </div>
            <textarea
              className="flex-1 w-full resize-none bg-transparent outline-none text-lg text-stone-800 placeholder-stone-400"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              spellCheck={false}
            />
            <div className="pt-3 text-xs text-stone-400">
              {entryCount.toLocaleString("vi-VN")} mục từ trong từ điển
            </div>
          </div>

          {/* Nút đổi chiều */}
          <div className="flex md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 justify-center -my-2.5 md:my-0 z-10">
            <button
              onClick={swap}
              aria-label="Đổi chiều dịch"
              title="Đổi chiều dịch"
              className="w-12 h-12 rounded-full flex items-center justify-center text-white
                         bg-gradient-to-br from-rose-500 via-orange-400 to-amber-400
                         border-4 border-amber-50 shadow-lg shadow-rose-200
                         hover:scale-110 active:scale-95 transition-transform duration-150"
            >
              <ArrowLeftRight size={20} className="rotate-90 md:rotate-0" />
            </button>
          </div>

          {/* Panel kết quả */}
          <div className="flex flex-col min-h-72 sm:min-h-80 rounded-2xl border-2 border-rose-100 bg-white/80 shadow-sm shadow-rose-100 p-5">
            <div className="flex items-center gap-2 text-rose-500 font-semibold mb-3">
              <BookOpenText size={16} />
              <span>{tgtLabel}</span>
            </div>

            {results.length === 0 ? (
              <div className="text-sm text-stone-400 leading-relaxed">
                {query.trim()
                  ? "Không tìm thấy từ phù hợp trong từ điển."
                  : "Kết quả tra cứu sẽ hiện ở đây."}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 overflow-y-auto max-h-72 sm:max-h-80 pr-1">
                {results.map((r, i) => {
                  const accent = i % 3;
                  return (
                    <div
                      key={r.key}
                      className={`rounded-xl border border-stone-100 bg-white p-3 border-l-4 ${ACCENT_BORDERS[accent]}`}
                    >
                      <div className="text-lg font-semibold text-stone-800" style={FONT_SERIF}>
                        <Highlighted text={r.display} query={query} />
                      </div>
                      <ul className={`mt-1.5 pl-4 list-disc text-[15px] leading-relaxed text-stone-700 ${ACCENT_MARKERS[accent]}`}>
                        {r.meanings.map((m, j) => (
                          <li key={j}>{m}</li>
                        ))}
                      </ul>
                      {r.examples.length > 0 && (
                        <div className="mt-1.5 text-xs text-stone-400 italic">
                          {r.examples[0]}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-stone-400">
          Tra cứu theo từ · gõ để tìm các từ bắt đầu hoặc chứa nội dung bạn nhập
        </div>
      </div>
    </div>
  );
}
