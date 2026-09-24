import { Fragment, useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  ArrowLeftRight,
  BookOpenText,
  Check,
  Copy,
  Eye,
  GraduationCap,
  History,
  Languages,
  RotateCcw,
  Search,
  Settings2,
  Sparkles,
  Star,
  X,
} from "lucide-react";
import DICT_RAW from "../bana_viet_dict.json";
// Đổi lại tên file bên dưới cho khớp với ảnh logo bạn đã đặt trong src/assets
import div2Logo from "./assets/f2.jpg";
import {
  analyze,
  buildIndex,
  highlightParts,
  isQuizable,
  makeQuestion,
  normalize,
  wordOfTheDay,
} from "./dictEngine";

/* =========================================================================
 * 1) STYLE TUỲ BIẾN
 *    Dữ liệu: bana_viet_dict.json, mỗi mục { bana, viet, example? }
 *    Logic tìm kiếm: ./dictEngine.js (có test riêng)
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

const DIR_LABEL = { bv: "Bahnar → Việt", vb: "Việt → Bahnar" };
const HISTORY_LIMIT = 8;

/* =========================================================================
 * 1b) SRS — lịch ôn tập cách quãng kiểu Anki (thuật toán SM-2 rút gọn)
 *     Thẻ mới → các bước "đang học" (đơn vị phút) → "tốt nghiệp" vào ôn tập
 *     (đơn vị ngày). Thẻ ôn tập dùng hệ số dễ (ease) để co giãn khoảng lặp.
 * ======================================================================= */
const SRS_CARDS_KEY = "bahnar.srs.cards.v1";
const SRS_DAILY_KEY = "bahnar.srs.daily.v1";
const SRS_SETTINGS_KEY = "bahnar.srs.settings.v1";

const LEARNING_STEPS_MIN = [1, 10]; // phút, giống bước mặc định của Anki
const RELEARN_STEPS_MIN = [10];
const GRADUATE_DAYS = 1;
const EASY_DAYS = 4;
const MIN_EASE = 1.3;
const EASY_BONUS = 1.3;
const DEFAULT_SRS_SETTINGS = { newPerDay: 15, reviewPerDay: 100, pool: "all" };

const RATINGS = [
  { id: "again", label: "Lại", cls: "bg-rose-500 hover:bg-rose-600" },
  { id: "hard", label: "Khó", cls: "bg-amber-500 hover:bg-amber-600" },
  { id: "good", label: "Tốt", cls: "bg-teal-500 hover:bg-teal-600" },
  { id: "easy", label: "Dễ", cls: "bg-sky-500 hover:bg-sky-600" },
];

function startOfDay(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
function todayKey(ts = Date.now()) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function freshCard() {
  return { state: "new", due: 0, interval: 0, ease: 2.5, reps: 0, lapses: 0, learningStep: 0 };
}
function freshDaily(ts = Date.now()) {
  return { date: todayKey(ts), bv: { introduced: 0, reviewed: 0 }, vb: { introduced: 0, reviewed: 0 } };
}

// Hàm thuần: tính trạng thái thẻ MỚI sau khi chấm điểm, không sửa thẻ gốc
function schedule(card, rating, now = Date.now()) {
  const c = { ...card };
  const nowDay = startOfDay(now);
  const wasRelearning = c.state === "relearning";

  if (c.state === "new") {
    c.state = "learning";
    c.learningStep = 0;
  }

  if (c.state === "learning" || c.state === "relearning") {
    const steps = wasRelearning ? RELEARN_STEPS_MIN : LEARNING_STEPS_MIN;
    if (rating === "again") {
      c.learningStep = 0;
      c.due = now + steps[0] * 60000;
    } else if (rating === "hard") {
      c.due = now + steps[Math.min(c.learningStep, steps.length - 1)] * 60000;
    } else if (rating === "good") {
      const nextStep = c.learningStep + 1;
      if (nextStep >= steps.length) {
        c.state = "review";
        c.interval = wasRelearning ? Math.max(1, card.interval || GRADUATE_DAYS) : GRADUATE_DAYS;
        c.due = nowDay + c.interval * 86400000;
        c.learningStep = 0;
      } else {
        c.learningStep = nextStep;
        c.due = now + steps[nextStep] * 60000;
      }
    } else if (rating === "easy") {
      c.state = "review";
      c.interval = EASY_DAYS;
      c.due = nowDay + c.interval * 86400000;
      c.learningStep = 0;
    }
  } else if (c.state === "review") {
    if (rating === "again") {
      c.lapses += 1;
      c.ease = Math.max(MIN_EASE, c.ease - 0.2);
      c.state = "relearning";
      c.learningStep = 0;
      c.interval = Math.max(1, Math.round(c.interval * 0.5));
      c.due = now + RELEARN_STEPS_MIN[0] * 60000;
    } else if (rating === "hard") {
      c.ease = Math.max(MIN_EASE, c.ease - 0.15);
      c.interval = Math.max(c.interval + 1, Math.round(c.interval * 1.2));
      c.due = nowDay + c.interval * 86400000;
    } else if (rating === "good") {
      c.interval = Math.max(1, Math.round(c.interval * c.ease));
      c.due = nowDay + c.interval * 86400000;
    } else if (rating === "easy") {
      c.ease = c.ease + 0.15;
      c.interval = Math.max(1, Math.round(c.interval * c.ease * EASY_BONUS));
      c.due = nowDay + c.interval * 86400000;
    }
  }
  c.reps += 1;
  return c;
}

function formatDelta(ms) {
  const min = ms / 60000;
  if (min < 1) return "<1 phút";
  if (min < 60) return `${Math.round(min)} phút`;
  const hours = min / 60;
  if (hours < 24) return `${Math.round(hours)} giờ`;
  const days = hours / 24;
  if (days < 30) return `${Math.round(days)} ngày`;
  const months = days / 30;
  if (months < 12) return `${Math.round(months * 10) / 10} tháng`;
  return `${Math.round((days / 365) * 10) / 10} năm`;
}

// Nhãn thời gian dự kiến hiển thị trên từng nút chấm điểm
function previewLabel(card, rating, now) {
  const next = schedule(card, rating, now);
  return formatDelta(next.due - now);
}

/* =========================================================================
 * 2) HOOK LƯU TRÊN MÁY (sổ từ, lịch sử, điểm luyện tập)
 *    Bọc try/catch: chế độ riêng tư hoặc bị chặn lưu trữ thì app vẫn chạy.
 * ======================================================================= */
function useStoredState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* bỏ qua */
    }
  }, [key, value]);
  return [value, setValue];
}

/* =========================================================================
 * 3) COMPONENT NHỎ
 * ======================================================================= */

// Tô sáng đúng vị trí, kể cả khi người dùng gõ không dấu
function Highlighted({ text, terms }) {
  const parts = useMemo(() => highlightParts(text, terms), [text, terms]);
  return (
    <>
      {parts.map((p, i) =>
        p.hit ? (
          <mark key={i} className="bg-amber-300 text-stone-900 rounded px-0.5">
            {p.text}
          </mark>
        ) : (
          <Fragment key={i}>{p.text}</Fragment>
        )
      )}
    </>
  );
}

function ResultCard({ g, accent, terms, saved, onToggle, tag, onOpen }) {
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

// Khối "Dịch từng từ": mỗi từ một ô, từ sai chính tả có nút gợi ý bấm để sửa
function Breakdown({ analysis, onReplace, copied, onCopy }) {
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

/* ---------- Ôn tập theo lịch lặp lại cách quãng (kiểu Anki) ---------- */
function StudySession({ index, direction, savedKeys, srsData, setSrsData, daily, setDaily, settings, setSettings }) {
  const [now, setNow] = useState(Date.now());
  const [revealed, setRevealed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const pool = useMemo(() => [...index.map.values()].filter(isQuizable), [index]);
  const deckPool = useMemo(
    () => (settings.pool === "saved" ? pool.filter((g) => savedKeys.has(g.key)) : pool),
    [pool, settings.pool, savedKeys]
  );

  const dayStats = daily[direction] || { introduced: 0, reviewed: 0 };
  const newLeft = Math.max(0, settings.newPerDay - dayStats.introduced);
  const reviewLeft = Math.max(0, settings.reviewPerDay - dayStats.reviewed);

  const cards = useMemo(
    () =>
      deckPool.map((g) => {
        const id = `${direction}|${g.key}`;
        return { id, g, card: srsData[id] || freshCard() };
      }),
    [deckPool, srsData, direction]
  );

  const learningDue = cards.filter(
    (c) => (c.card.state === "learning" || c.card.state === "relearning") && c.card.due <= now
  );
  const learningWaiting = cards.filter(
    (c) => (c.card.state === "learning" || c.card.state === "relearning") && c.card.due > now
  );
  const reviewDue = cards.filter((c) => c.card.state === "review" && c.card.due <= now);
  const newCards = cards.filter((c) => c.card.state === "new");

  const reviewQueue = reviewDue.slice(0, reviewLeft);
  const newQueue = newCards.slice(0, newLeft);

  const current = learningDue[0] || reviewQueue[0] || newQueue[0] || null;

  const counts = {
    new: Math.min(newCards.length, newLeft),
    learning: learningDue.length + learningWaiting.length,
    review: Math.min(reviewDue.length, reviewLeft),
  };

  // Cập nhật đồng hồ mỗi giây khi đang chờ thẻ "đang học" tới hạn trở lại
  useEffect(() => {
    if (!current && learningWaiting.length > 0) {
      const t = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(t);
    }
    return undefined;
  }, [current, learningWaiting.length]);

  useEffect(() => {
    setRevealed(false);
  }, [current?.id]);

  function rate(rating) {
    if (!current) return;
    const wasNew = current.card.state === "new";
    const wasReview = current.card.state === "review";
    const nextCard = schedule(current.card, rating, Date.now());
    setSrsData((d) => ({ ...d, [current.id]: nextCard }));
    if (wasNew || wasReview) {
      setDaily((d) => {
        const base = d.date === todayKey() ? d : freshDaily();
        const dstats = base[direction];
        return {
          ...base,
          [direction]: {
            introduced: dstats.introduced + (wasNew ? 1 : 0),
            reviewed: dstats.reviewed + (wasReview ? 1 : 0),
          },
        };
      });
    }
    setNow(Date.now());
  }

  function resetProgress() {
    if (!window.confirm("Xoá toàn bộ tiến trình ôn tập (cả hai chiều)? Không thể hoàn tác.")) return;
    setSrsData({});
    setDaily(freshDaily());
  }

  const waitMs = learningWaiting.length > 0 ? Math.min(...learningWaiting.map((c) => c.card.due)) - now : 0;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-amber-100 bg-white/80 p-3 shadow-sm shadow-amber-100">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1 text-sky-600">
            <span className="h-2 w-2 rounded-full bg-sky-500" /> Mới {counts.new}
          </span>
          <span className="flex items-center gap-1 text-rose-500">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> Đang học {counts.learning}
          </span>
          <span className="flex items-center gap-1 text-teal-600">
            <span className="h-2 w-2 rounded-full bg-teal-500" /> Ôn tập {counts.review}
          </span>
        </div>
        <button
          onClick={() => setShowSettings((s) => !s)}
          aria-expanded={showSettings}
          className="flex items-center gap-1 rounded-full border border-stone-200 px-2.5 py-1 text-xs font-semibold text-stone-500 hover:border-amber-300 hover:text-stone-700"
        >
          <Settings2 size={14} /> Tuỳ chỉnh
        </button>
      </div>

      {showSettings && (
        <div className="mb-4 rounded-2xl border-2 border-stone-200 bg-white/90 p-4 text-sm">
          <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-stone-500">Thẻ mới / ngày</span>
              <input
                type="number"
                min={0}
                max={200}
                value={settings.newPerDay}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, newPerDay: Math.max(0, Number(e.target.value) || 0) }))
                }
                className="rounded-lg border border-stone-200 px-2 py-1.5"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-stone-500">Lượt ôn tập / ngày</span>
              <input
                type="number"
                min={0}
                max={1000}
                value={settings.reviewPerDay}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, reviewPerDay: Math.max(0, Number(e.target.value) || 0) }))
                }
                className="rounded-lg border border-stone-200 px-2 py-1.5"
              />
            </label>
          </div>
          <div className="mb-3">
            <span className="mb-1 block text-xs font-semibold text-stone-500">Nguồn thẻ</span>
            <div className="flex w-fit rounded-full bg-stone-100 p-0.5 text-xs font-semibold">
              {[
                ["all", "Toàn bộ từ điển"],
                ["saved", "Chỉ sổ từ đã lưu"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setSettings((s) => ({ ...s, pool: id }))}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    settings.pool === id ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={resetProgress}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600"
          >
            <RotateCcw size={13} /> Đặt lại toàn bộ tiến trình ôn tập
          </button>
        </div>
      )}

      <div className="flex min-h-[26rem] flex-col rounded-2xl border-2 border-amber-100 bg-white/80 p-7 shadow-sm shadow-amber-100">
        {!current ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            {learningWaiting.length > 0 ? (
              <>
                <div className="text-sm text-stone-500">Đã hết thẻ tới hạn. Thẻ đang học tiếp theo sau:</div>
                <div className="text-2xl font-semibold text-amber-500" style={FONT_SERIF}>
                  {formatDelta(Math.max(0, waitMs))}
                </div>
              </>
            ) : (
              <>
                <div className="text-lg font-semibold text-stone-700" style={FONT_SERIF}>
                  Xong buổi ôn tập hôm nay! 🎉
                </div>
                <div className="text-sm text-stone-400">
                  {settings.pool === "saved"
                    ? "Không còn thẻ nào trong sổ từ đến hạn hoặc trong giới hạn hôm nay."
                    : "Không còn thẻ nào đến hạn hoặc trong giới hạn hôm nay. Quay lại sau hoặc tăng giới hạn ở phần tuỳ chỉnh."}
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="mb-1 text-xs font-semibold text-stone-400">
              {current.card.state === "new"
                ? "Thẻ mới"
                : current.card.state === "review"
                ? `Ôn tập · lần ${current.card.reps + 1}`
                : "Đang học"}
            </div>
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-4 text-center">
              <div className="text-4xl font-semibold text-stone-800" style={FONT_SERIF}>
                {current.g.display}
              </div>
              {revealed && (
                <div className="flex flex-col gap-2">
                  <ul className="list-disc pl-4 text-left text-[15px] text-stone-700 marker:text-teal-500">
                    {current.g.meanings.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                  {current.g.examples.slice(0, 2).map((ex, i) => (
                    <div key={i} className="text-xs italic text-stone-400">
                      {ex}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {!revealed ? (
              <button
                onClick={() => setRevealed(true)}
                className="mx-auto flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-400 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-200 transition-transform hover:scale-105 active:scale-95"
              >
                <Eye size={16} /> Xem đáp án
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {RATINGS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => rate(r.id)}
                    className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-sm font-semibold text-white transition-transform hover:scale-105 active:scale-95 ${r.cls}`}
                  >
                    <span>{r.label}</span>
                    <span className="text-[10px] font-normal opacity-90">
                      {previewLabel(current.card, r.id, Date.now())}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Luyện tập trắc nghiệm ---------- */
function Quiz({ index, direction, savedKeys }) {
  const [poolMode, setPoolMode] = useState("all"); // 'all' | 'saved'
  const [stats, setStats] = useStoredState("bahnar.quiz.v1", { right: 0, total: 0, streak: 0, best: 0 });
  const [q, setQ] = useState(null);
  const [picked, setPicked] = useState(null);

  const pool = useMemo(() => [...index.map.values()].filter(isQuizable), [index]);
  const savedPool = useMemo(() => pool.filter((g) => savedKeys.has(g.key)), [pool, savedKeys]);
  const source = poolMode === "saved" ? savedPool : pool;

  function next() {
    setPicked(null);
    setQ(makeQuestion(source, pool));
  }

  // Đổi chiều dịch / nguồn câu hỏi thì ra câu mới
  useEffect(() => {
    setPicked(null);
    setQ(makeQuestion(source, pool));
  }, [source, pool]);

  function answer(opt) {
    if (picked !== null || !q) return;
    setPicked(opt);
    const ok = opt === q.correct;
    setStats((s) => {
      const streak = ok ? s.streak + 1 : 0;
      return { right: s.right + (ok ? 1 : 0), total: s.total + 1, streak, best: Math.max(s.best, streak) };
    });
  }

  const question =
    direction === "bv" ? "Từ Bahnar này có nghĩa là gì?" : "Từ nào trong tiếng Bahnar có nghĩa này?";

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border-2 border-amber-100 bg-white/80 p-6 shadow-sm shadow-amber-100">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-semibold text-amber-600">
          <GraduationCap size={18} />
          <span>Luyện tập · {DIR_LABEL[direction]}</span>
        </div>
        <div className="flex rounded-full bg-stone-100 p-0.5 text-xs font-semibold">
          {[
            ["all", "Toàn bộ từ điển"],
            ["saved", `Sổ từ (${savedPool.length})`],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setPoolMode(id)}
              className={`rounded-full px-3 py-1 transition-colors ${
                poolMode === id ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {!q ? (
        <div className="py-8 text-center text-sm leading-relaxed text-stone-400">
          {poolMode === "saved"
            ? "Sổ từ của chiều này đang trống. Bấm ngôi sao ở kết quả tra cứu để lưu từ, rồi quay lại luyện tập."
            : "Chưa đủ mục từ ngắn gọn để tạo câu hỏi."}
        </div>
      ) : (
        <>
          <div className="text-sm text-stone-500">{question}</div>
          <div className="mb-4 mt-1 text-3xl font-semibold text-stone-800" style={FONT_SERIF}>
            {q.prompt}
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {q.options.map((opt) => {
              const isCorrect = opt === q.correct;
              const isPicked = opt === picked;
              let cls = "border-stone-200 bg-white text-stone-700 hover:border-teal-300 hover:bg-teal-50";
              if (picked !== null) {
                if (isCorrect) cls = "border-teal-400 bg-teal-50 text-teal-800";
                else if (isPicked) cls = "border-rose-300 bg-rose-50 text-rose-700";
                else cls = "border-stone-100 bg-white text-stone-400";
              }
              return (
                <button
                  key={opt}
                  onClick={() => answer(opt)}
                  disabled={picked !== null}
                  className={`rounded-xl border-2 px-3 py-2.5 text-left text-[15px] font-medium transition-colors ${cls}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <div className="mt-4">
              <div className={`text-sm font-semibold ${picked === q.correct ? "text-teal-600" : "text-rose-500"}`}>
                {picked === q.correct ? "Chính xác!" : `Chưa đúng. Đáp án: ${q.correct}`}
              </div>
              {q.group.examples[0] && (
                <div className="mt-1 text-xs italic text-stone-400">{q.group.examples[0]}</div>
              )}
              <button
                onClick={next}
                className="mt-3 rounded-full bg-gradient-to-r from-rose-500 to-amber-400 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-rose-200 transition-transform hover:scale-105 active:scale-95"
              >
                Câu tiếp theo
              </button>
            </div>
          )}
        </>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-400">
        <span>
          Đúng {stats.right}/{stats.total}
          {stats.total > 0 && ` (${Math.round((stats.right / stats.total) * 100)}%)`} · Chuỗi đúng {stats.streak} ·
          Kỷ lục {stats.best}
        </span>
        <button
          onClick={() => setStats({ right: 0, total: 0, streak: 0, best: 0 })}
          className="hover:text-stone-600"
        >
          Đặt lại
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
 * 4) COMPONENT CHÍNH
 * ======================================================================= */
export default function BahnarDictionary() {
  const [mode, setMode] = useState("lookup"); // 'lookup' | 'quiz' | 'saved'
  const [direction, setDirection] = useState("vb"); // mặc định Việt->Bahnar; 'bv' = Bahnar->Việt
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useStoredState("bahnar.favorites.v1", []);
  const [history, setHistory] = useStoredState("bahnar.history.v1", []);
  const [studyTab, setStudyTab] = useState("srs"); // 'srs' (ôn tập cách quãng) | 'multi' (trắc nghiệm nhanh)
  const [srsData, setSrsData] = useStoredState(SRS_CARDS_KEY, {});
  const [daily, setDaily] = useStoredState(SRS_DAILY_KEY, freshDaily());
  const [srsSettings, setSrsSettings] = useStoredState(SRS_SETTINGS_KEY, DEFAULT_SRS_SETTINGS);

  // Sang ngày mới thì làm mới bộ đếm thẻ mới / lượt ôn tập trong ngày
  useEffect(() => {
    if (daily.date !== todayKey()) setDaily(freshDaily());
  }, [daily.date, setDaily]);

  // Dựng sẵn chỉ mục cho cả hai chiều, chỉ làm một lần
  const indexes = useMemo(() => ({ bv: buildIndex(DICT_RAW, "bv"), vb: buildIndex(DICT_RAW, "vb") }), []);
  const index = indexes[direction];

  const entryCount = useMemo(() => {
    const s = new Set();
    DICT_RAW.forEach((r) => s.add(normalize(r.bana) + "|" + normalize(r.viet)));
    return s.size;
  }, []);

  // Giữ ô nhập luôn mượt: phần tính toán nặng chạy sau với giá trị "hoãn"
  const deferredQuery = useDeferredValue(query);
  const analysis = useMemo(
    () => analyze(index, deferredQuery, direction),
    [index, deferredQuery, direction]
  );
  const { results, segments, terms, words } = analysis;

  const showBreakdown =
    segments.length > 0 && (words.length > 1 || segments.some((s) => s.suggestions.length > 0));
  const hasAnything =
    results.length > 0 || segments.some((s) => s.entries.length > 0 || s.suggestions.length > 0);

  const wod = useMemo(() => wordOfTheDay(index), [index]);

  /* ---------- Sổ từ ---------- */
  const favIds = useMemo(() => new Set(favorites.map((f) => `${f.dir}|${f.key}`)), [favorites]);
  const savedKeys = useMemo(
    () => new Set(favorites.filter((f) => f.dir === direction).map((f) => f.key)),
    [favorites, direction]
  );
  const savedEntries = useMemo(
    () =>
      favorites
        .map((f) => ({ ...f, g: indexes[f.dir].map.get(f.key) }))
        .filter((x) => x.g),
    [favorites, indexes]
  );

  function toggleFavorite(dir, key) {
    setFavorites((fs) =>
      fs.some((f) => f.dir === dir && f.key === key)
        ? fs.filter((f) => !(f.dir === dir && f.key === key))
        : [{ dir, key }, ...fs]
    );
  }

  /* ---------- Lịch sử: chỉ lưu khi người dùng dừng gõ và có kết quả ---------- */
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 || !hasAnything) return undefined;
    const t = setTimeout(() => {
      setHistory((h) =>
        [
          { dir: direction, q },
          ...h.filter((x) => !(x.dir === direction && normalize(x.q) === normalize(q))),
        ].slice(0, HISTORY_LIMIT)
      );
    }, 1500);
    return () => clearTimeout(t);
  }, [query, direction, hasAnything, setHistory]);

  /* ---------- Hành động ---------- */
  function swap() {
    setDirection((d) => (d === "bv" ? "vb" : "bv"));
  }

  // Bấm vào gợi ý "có phải…" thì thay đúng từ đó trong câu đang gõ
  function replaceWord(start, len, replacement) {
    const w = [...words];
    w.splice(start, len, ...replacement.split(" "));
    setQuery(w.join(" "));
  }

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(analysis.draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* trình duyệt không cho chép */
    }
  }

  function openEntry(dir, text) {
    setDirection(dir);
    setQuery(text);
    setMode("lookup");
  }

  const srcLabel = direction === "bv" ? "Tiếng Bahnar" : "Tiếng Việt";
  const tgtLabel = direction === "bv" ? "Tiếng Việt" : "Tiếng Bahnar";
  const placeholder =
    direction === "bv"
      ? "Nhập từ hoặc cả câu Bahnar, ví dụ: akap, ake along…"
      : "Nhập từ hoặc cả câu tiếng Việt, ví dụ: bẫy, sừng, con heo… (gõ không dấu cũng được)";

  const TABS = [
    ["lookup", "Tra cứu", Search],
    ["quiz", "Luyện tập", GraduationCap],
    ["saved", `Sổ từ (${favorites.length})`, Star],
  ];

  return (
    <div
      className="min-h-screen w-full bg-gradient-to-br from-amber-50 via-orange-50 to-teal-50 px-4 py-8 sm:px-6 sm:py-10"
      style={FONT_SANS}
    >
      <style>{FONT_IMPORT_CSS}</style>

      <div className="mx-auto max-w-5xl">
        {/* ---------- TRANG BÌA ---------- */}
        <div className="mb-8 overflow-hidden rounded-3xl border-2 border-amber-100 bg-white shadow-sm shadow-amber-100">
          {/* Tiêu đề đơn vị (letterhead) */}
          <div className="flex items-center gap-3 sm:gap-4 border-b border-amber-100 px-4 py-3 sm:px-6 sm:py-4">
            <img
              src={div2Logo}
              alt="Phù hiệu Sư đoàn Bộ binh 2, Quân khu 5"
              className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-full object-contain"
            />
            <div className="text-left leading-tight">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-rose-600">
                Sư đoàn Bộ binh 2 · Quân khu 5
              </p>
              <p className="text-sm sm:text-base font-semibold text-stone-700">Tiểu đoàn SPG-9</p>
              <p className="text-[11px] sm:text-xs text-stone-400">
                Sản phẩm tham gia Phong trào thi đua Chuyển đổi số
              </p>
            </div>
          </div>
        </div>

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
          <p className="text-sm sm:text-base text-stone-500">Từ điển đối chiếu Bahnar – Tiếng Việt</p>
        </div>

        {/* dải hoa văn thổ cẩm */}
        <div className="h-2.5 rounded-full my-6 opacity-90" style={WOVEN_BAR_STYLE} />

        {/* ---------- CHUYỂN CHẾ ĐỘ ---------- */}
        <div className="mb-5 flex justify-center">
          <div role="tablist" className="flex rounded-full bg-white/70 p-1 shadow-sm shadow-amber-100">
            {TABS.map(([id, label, Icon]) => (
              <button
                key={id}
                role="tab"
                aria-selected={mode === id}
                onClick={() => setMode(id)}
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

        {/* ---------- TRA CỨU ---------- */}
        {mode === "lookup" && (
          <div className="relative grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Panel nguồn */}
            <div className="flex flex-col min-h-80 sm:min-h-[28rem] rounded-2xl border-2 border-teal-100 bg-white/80 shadow-sm shadow-teal-100 p-5 sm:p-6">
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

              {history.length > 0 && (
                <div className="pt-2">
                  <div className="mb-1 flex items-center justify-between text-[11px] text-stone-400">
                    <span className="flex items-center gap-1">
                      <History size={12} /> Tra gần đây
                    </span>
                    <button onClick={() => setHistory([])} className="hover:text-stone-600">
                      Xoá
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {history.map((h) => (
                      <button
                        key={h.dir + h.q}
                        onClick={() => {
                          setDirection(h.dir);
                          setQuery(h.q);
                        }}
                        title={DIR_LABEL[h.dir]}
                        className="max-w-full truncate rounded-full border border-teal-100 bg-white px-2.5 py-0.5 text-xs text-stone-600 hover:border-teal-300 hover:bg-teal-50"
                      >
                        {h.q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 text-xs text-stone-400">
                <span>{entryCount.toLocaleString("vi-VN")} mục từ trong từ điển</span>
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="flex items-center gap-1 hover:text-stone-600"
                    aria-label="Xoá nội dung đang nhập"
                  >
                    <X size={12} /> Xoá
                  </button>
                )}
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
            <div className="flex flex-col min-h-80 sm:min-h-[28rem] rounded-2xl border-2 border-rose-100 bg-white/80 shadow-sm shadow-rose-100 p-5 sm:p-6">
              <div className="flex items-center gap-2 text-rose-500 font-semibold mb-3">
                <BookOpenText size={16} />
                <span>{tgtLabel}</span>
              </div>

              {!query.trim() ? (
                <div className="flex flex-col gap-3">
                  <div className="text-sm leading-relaxed text-stone-400">
                    Kết quả tra cứu sẽ hiện ở đây. Gõ không dấu hoặc sai chính tả nhẹ vẫn tìm được.
                  </div>
                  {wod && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
                      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                        <Sparkles size={14} />
                        <span>Từ hôm nay</span>
                      </div>
                      <div className="text-lg font-semibold text-stone-800" style={FONT_SERIF}>
                        {wod.display}
                      </div>
                      <div className="text-[15px] text-stone-600">{wod.meanings[0]}</div>
                      <button
                        onClick={() => setQuery(wod.display)}
                        className="mt-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700"
                      >
                        Tra từ này
                      </button>
                    </div>
                  )}
                </div>
              ) : !hasAnything ? (
                <div className="text-sm leading-relaxed text-stone-400">
                  Không tìm thấy từ nào phù hợp trong từ điển. Thử gõ ngắn hơn, gõ không dấu hoặc kiểm tra lại
                  chính tả.
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 overflow-y-auto max-h-80 sm:max-h-[28rem] pr-1">
                  {showBreakdown && (
                    <Breakdown
                      analysis={analysis}
                      onReplace={replaceWord}
                      copied={copied}
                      onCopy={copyDraft}
                    />
                  )}
                  {results.map((g, i) => (
                    <ResultCard
                      key={g.key}
                      g={g}
                      accent={i % 3}
                      terms={terms}
                      saved={favIds.has(`${direction}|${g.key}`)}
                      onToggle={() => toggleFavorite(direction, g.key)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------- LUYỆN TẬP ---------- */}
        {mode === "quiz" && (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={swap}
                className="flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-4 py-1.5 text-sm font-semibold text-stone-600 hover:border-amber-300"
              >
                <ArrowLeftRight size={15} />
                {DIR_LABEL[direction]}
              </button>
              <div role="tablist" className="flex rounded-full bg-white/70 p-1 text-xs font-semibold shadow-sm shadow-amber-100">
                {[
                  ["srs", "Ôn tập"],
                  ["multi", "Trắc nghiệm nhanh"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    role="tab"
                    aria-selected={studyTab === id}
                    onClick={() => setStudyTab(id)}
                    className={`rounded-full px-3.5 py-1.5 transition-colors ${
                      studyTab === id
                        ? "bg-gradient-to-r from-rose-500 to-amber-400 text-white shadow-md shadow-rose-200"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {studyTab === "srs" ? (
              <StudySession
                index={index}
                direction={direction}
                savedKeys={savedKeys}
                srsData={srsData}
                setSrsData={setSrsData}
                daily={daily}
                setDaily={setDaily}
                settings={srsSettings}
                setSettings={setSrsSettings}
              />
            ) : (
              <Quiz index={index} direction={direction} savedKeys={savedKeys} />
            )}
          </div>
        )}

        {/* ---------- SỔ TỪ ---------- */}
        {mode === "saved" && (
          <div className="mx-auto max-w-2xl">
            {savedEntries.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-white/60 p-8 text-center text-sm leading-relaxed text-stone-500">
                Sổ từ đang trống. Ở tab Tra cứu, bấm ngôi sao cạnh một mục từ để lưu vào đây. Các từ đã lưu có
                thể dùng để luyện tập.
              </div>
            ) : (
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
            )}
          </div>
        )}

        <div className="text-center mt-6 text-xs text-stone-400">
          Nhập một từ hoặc cả câu · ưu tiên khớp cụm dài nhất, rồi tự tách từng từ để tra cứu
        </div>
      </div>
    </div>
  );
}
