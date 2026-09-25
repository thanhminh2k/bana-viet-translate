import { useEffect, useMemo, useState } from "react";
import { GraduationCap } from "lucide-react";
import { DIR_LABEL, FONT_SERIF } from "../constants";
import { isQuizable, makeQuestion } from "../dictEngine";
import { useStoredState } from "../hooks/useStoredState";

export default function Quiz({ index, direction, savedKeys }) {
  const [poolMode, setPoolMode] = useState("all");
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
