import { useEffect, useMemo, useState } from "react";
import { Eye, RotateCcw, Settings2 } from "lucide-react";
import { FONT_SERIF, RATINGS } from "../constants";
import { isQuizable } from "../dictEngine";
import { formatDelta, freshCard, freshDaily, previewLabel, schedule, todayKey } from "../srs";

export default function StudySession({
  index,
  direction,
  savedKeys,
  srsData,
  setSrsData,
  daily,
  setDaily,
  settings,
  setSettings,
}) {
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
