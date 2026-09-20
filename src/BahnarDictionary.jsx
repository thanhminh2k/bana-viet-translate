import { Fragment, useMemo, useState } from "react";
import { ArrowLeftRight, Search, BookOpenText, Languages } from "lucide-react";
import DICT_RAW from "../bana_viet_dict.json";

/* =========================================================================
 * 1) DỮ LIỆU TỪ ĐIỂN
 *    Được import trực tiếp từ file bana_viet_dict.json (đặt cùng thư mục).
 *    Mỗi mục có dạng: { bana, viet, example? }
 * ======================================================================= */

/* =========================================================================
 * 2) STYLE TUỲ BIẾN (phần không thể làm bằng Tailwind thuần)
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

const ACCENT_BORDERS = ["border-l-teal-400", "border-l-rose-400", "border-l-amber-400"];
const ACCENT_MARKERS = ["marker:text-teal-500", "marker:text-rose-500", "marker:text-amber-500"];

/* =========================================================================
 * 3) CẤU HÌNH TÌM KIẾM  (chỉnh ở đây)
 * ======================================================================= */

// Loại từ / hư từ thường không có từ tương ứng trong tiếng Bahnar
// (ví dụ "con" trong "con heo"). Các từ này KHÔNG bị xoá: chúng vẫn được tra,
// nhưng bị làm mờ, không đưa vào bản ghép và không làm nhiễu danh sách kết quả.
// Muốn thêm/bớt cứ sửa danh sách bên dưới.
const LOOSE_WORDS = {
  vb: new Set(["con", "cái", "chiếc", "những", "các", "một", "mấy", "cây", "quả", "trái"]),
  bv: new Set(),
};

// Cụm dài nhất (tính theo số từ) được thử khi ghép cụm, ví dụ "cây lúa nước" = 3
const MAX_PHRASE_WORDS = 6;

/* =========================================================================
 * 4) HÀM TIỆN ÍCH
 * ======================================================================= */

// NFC: tránh lỗi "gõ đúng mà không khớp" do dấu tiếng Việt được lưu dạng tổ hợp
// (a + dấu) trong JSON nhưng bàn phím lại gõ dạng dựng sẵn (hoặc ngược lại).
function normalize(s) {
  return String(s ?? "").normalize("NFC").toLowerCase().trim();
}

const SEPARATORS = /[\s,;.!?:()"“”/\\|]+/;

// Tách câu thành danh sách từ THEO ĐÚNG THỨ TỰ (giữ cả từ lặp)
function splitWords(s) {
  return normalize(s).split(SEPARATORS).filter(Boolean);
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Chấm điểm một mục từ so với câu tìm kiếm.
 * - Khớp nguyên cụm (cả câu) được điểm cao nhất.
 * - Sau đó tới từng từ riêng lẻ: khớp nguyên từ > bắt đầu bằng > chứa.
 * - Mục nào khớp nhiều từ trong câu hơn thì điểm càng cao.
 */
function scoreEntry(key, words, phrase, tokens) {
  let score = 0;

  if (key === phrase) score += 1000;
  else if (key.startsWith(phrase)) score += 800;
  else if (key.includes(phrase)) score += 600;

  let matched = 0;
  for (const t of tokens) {
    let best = 0;
    for (const w of words) {
      if (w === t) {
        best = 100;
        break;
      }
      if (t.length >= 2) {
        if (w.startsWith(t)) best = Math.max(best, 60);
        else if (w.includes(t)) best = Math.max(best, 30);
      }
    }
    if (best > 0) {
      matched++;
      score += best;
    }
  }
  return score + matched * 20;
}

/**
 * Ghép cụm dài nhất trước (forward maximum matching).
 * Với "con heo": thử "con heo" → nếu không có trong từ điển thì thử "con",
 * rồi "heo". Từ nào không tra được sẽ có entry = null.
 */
function segment(words, grouped, maxLen) {
  const segs = [];
  let i = 0;
  while (i < words.length) {
    let found = null;
    for (let len = Math.min(maxLen, words.length - i); len >= 1; len--) {
      const cand = words.slice(i, i + len).join(" ");
      if (grouped.has(cand)) {
        found = { text: cand, entry: grouped.get(cand), len };
        break;
      }
    }
    if (found) {
      segs.push(found);
      i += found.len;
    } else {
      segs.push({ text: words[i], entry: null, len: 1 });
      i += 1;
    }
  }
  return segs;
}

// Gợi ý các mục từ gần giống cho một từ không tra được chính xác
function suggest(token, grouped, limit = 3) {
  const out = [];
  for (const [key, g] of grouped) {
    const s = scoreEntry(key, g.words, token, [token]);
    if (s > 0) out.push({ key, s, display: g.display });
  }
  out.sort((a, b) => b.s - a.s || a.key.length - b.key.length || a.key.localeCompare(b.key));
  return out.slice(0, limit);
}

// Tô sáng tất cả các từ khoá (cả cụm lẫn từng từ) trong văn bản
function Highlighted({ text, terms }) {
  if (!terms || terms.length === 0) return <>{text}</>;
  const pattern = terms.map(escapeRegExp).join("|");
  const parts = text.split(new RegExp(`(${pattern})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="bg-amber-300 text-stone-900 rounded px-0.5">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}

/* =========================================================================
 * 5) COMPONENT CHÍNH
 * ======================================================================= */
export default function BahnarDictionary() {
  const [direction, setDirection] = useState("bv"); // 'bv' = Bahnar->Việt, 'vb' = Việt->Bahnar
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const map = new Map();
    for (const row of DICT_RAW) {
      const src = direction === "bv" ? row.bana : row.viet;
      const tgt = direction === "bv" ? row.viet : row.bana;
      // Khoá đã bỏ dấu câu, cùng cách tách với câu người dùng nhập
      const words = splitWords(src);
      const key = words.join(" ");
      if (!key) continue;
      if (!map.has(key)) {
        map.set(key, { display: src, words, meanings: [], examples: [] });
      }
      const g = map.get(key);
      if (tgt && !g.meanings.includes(tgt)) g.meanings.push(tgt);
      if (row.example && !g.examples.includes(row.example)) g.examples.push(row.example);
    }
    return map;
  }, [direction]);

  const maxLen = useMemo(() => {
    let m = 1;
    for (const g of grouped.values()) m = Math.max(m, g.words.length);
    return Math.min(m, MAX_PHRASE_WORDS);
  }, [grouped]);

  const entryCount = useMemo(() => {
    const s = new Set();
    DICT_RAW.forEach((r) => s.add(normalize(r.bana) + "|" + normalize(r.viet)));
    return s.size;
  }, []);

  // words: các từ theo thứ tự · tokens: từ "có nghĩa" dùng để chấm điểm
  // (bỏ loại từ như "con" nếu câu còn từ khác)
  const { phrase, words, tokens, terms } = useMemo(() => {
    const words = splitWords(query);
    const phrase = words.join(" ");
    const uniq = [...new Set(words)];
    const loose = LOOSE_WORDS[direction];
    const content = uniq.filter((w) => !loose.has(w));
    const tokens = content.length > 0 ? content : uniq;
    const terms = [...new Set([phrase, ...tokens.filter((t) => t.length >= 2)])]
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);
    return { phrase, words, tokens, terms };
  }, [query, direction]);

  // Dịch từng từ: ghép cụm dài nhất trước, rồi tách lẻ
  const { segments, draft } = useMemo(() => {
    if (words.length === 0) return { segments: [], draft: "" };
    const loose = LOOSE_WORDS[direction];
    const segs = segment(words, grouped, maxLen);
    const hasContent = segs.some((s) => !loose.has(s.text));
    const segments = segs.map((s) => ({
      ...s,
      loose: hasContent && loose.has(s.text),
      suggestions: s.entry ? [] : suggest(s.text, grouped),
    }));
    const draft = segments
      .filter((s) => !s.loose)
      .map((s) => (s.entry ? s.entry.meanings[0] : `[${s.text}]`))
      .join(" ");
    return { segments, draft };
  }, [words, grouped, maxLen, direction]);

  const results = useMemo(() => {
    if (tokens.length === 0) return [];
    const scored = [];
    for (const [key, g] of grouped) {
      const score = scoreEntry(key, g.words, phrase, tokens);
      if (score > 0) scored.push({ key, score, ...g });
    }
    scored.sort(
      (a, b) =>
        b.score - a.score ||
        a.key.length - b.key.length ||
        a.key.localeCompare(b.key)
    );
    return scored.slice(0, 60);
  }, [phrase, tokens, grouped]);

  const showBreakdown = words.length > 1 && segments.length > 0;
  const hasAnything = results.length > 0 || segments.some((s) => s.entry);

  const srcLabel = direction === "bv" ? "Tiếng Bahnar" : "Tiếng Việt";
  const tgtLabel = direction === "bv" ? "Tiếng Việt" : "Tiếng Bahnar";
  const placeholder =
    direction === "bv"
      ? "Nhập từ hoặc cả câu Bahnar, ví dụ: akap, ake along…"
      : "Nhập từ hoặc cả câu tiếng Việt, ví dụ: bẫy, sừng, con heo…";

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

            {!query.trim() ? (
              <div className="text-sm text-stone-400 leading-relaxed">
                Kết quả tra cứu sẽ hiện ở đây.
              </div>
            ) : !hasAnything ? (
              <div className="text-sm text-stone-400 leading-relaxed">
                Không tìm thấy từ nào phù hợp trong từ điển.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 overflow-y-auto max-h-72 sm:max-h-80 pr-1">
                {/* ----- Dịch từng từ ----- */}
                {showBreakdown && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-2">
                      <Languages size={14} />
                      <span>Dịch từng từ</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {segments.map((s, i) => (
                        <div
                          key={i}
                          className={`rounded-lg border bg-white px-2.5 py-1.5 ${
                            s.entry ? "border-teal-200" : "border-dashed border-stone-300"
                          } ${s.loose ? "opacity-50" : ""}`}
                        >
                          <div className="text-[11px] text-stone-400">
                            {s.text}
                            {s.loose && " (loại từ)"}
                          </div>
                          <div
                            className={`text-[15px] font-semibold ${
                              s.entry ? "text-stone-800" : "text-stone-400"
                            }`}
                            style={FONT_SERIF}
                          >
                            {s.entry ? s.entry.meanings[0] : "?"}
                          </div>
                          {s.entry && s.entry.meanings.length > 1 && (
                            <div className="text-[11px] text-stone-400">
                              +{s.entry.meanings.length - 1} nghĩa khác
                            </div>
                          )}
                          {!s.entry && s.suggestions.length > 0 && (
                            <div className="text-[11px] text-stone-400">
                              gần giống: {s.suggestions.map((x) => x.display).join(", ")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="mt-2.5 text-sm text-stone-700">
                      <span className="text-stone-400">Bản ghép từng từ: </span>
                      <span className="font-semibold" style={FONT_SERIF}>
                        {draft}
                      </span>
                    </div>
                    <div className="mt-1 text-[11px] text-stone-400 leading-snug">
                      Chỉ ghép theo từng từ, ngữ pháp Bahnar có thể khác. Hãy đối chiếu với các mục bên dưới.
                    </div>
                  </div>
                )}

                {/* ----- Danh sách mục từ liên quan ----- */}
                {results.map((r, i) => {
                  const accent = i % 3;
                  return (
                    <div
                      key={r.key}
                      className={`rounded-xl border border-stone-100 bg-white p-3 border-l-4 ${ACCENT_BORDERS[accent]}`}
                    >
                      <div className="text-lg font-semibold text-stone-800" style={FONT_SERIF}>
                        <Highlighted text={r.display} terms={terms} />
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
          Nhập một từ hoặc cả câu · hệ thống ưu tiên khớp cụm dài nhất, rồi tự tách từng từ để tra cứu
        </div>
      </div>
    </div>
  );
}
