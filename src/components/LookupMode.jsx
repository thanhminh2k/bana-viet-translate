import { ArrowLeftRight, BookOpenText, History, Search, Sparkles, X } from "lucide-react";
import { DIR_LABEL, FONT_SERIF } from "../constants";
import { Breakdown } from "./Breakdown";
import { ResultCard } from "./ResultCard";

function SourcePanel({
  srcLabel,
  placeholder,
  query,
  onQueryChange,
  history,
  onPickHistory,
  onClearHistory,
  entryCount,
}) {
  return (
    <div className="flex flex-col min-h-80 sm:min-h-[28rem] rounded-2xl border-2 border-teal-100 bg-white/80 shadow-sm shadow-teal-100 p-5 sm:p-6">
      <div className="flex items-center gap-2 text-teal-600 font-semibold mb-3">
        <Search size={16} />
        <span>{srcLabel}</span>
      </div>
      <textarea
        className="flex-1 w-full resize-none bg-transparent outline-none text-lg text-stone-800 placeholder-stone-400"
        placeholder={placeholder}
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        spellCheck={false}
      />

      {history.length > 0 && (
        <div className="pt-2">
          <div className="mb-1 flex items-center justify-between text-[11px] text-stone-400">
            <span className="flex items-center gap-1">
              <History size={12} /> Tra gần đây
            </span>
            <button onClick={onClearHistory} className="hover:text-stone-600">
              Xoá
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {history.map((h) => (
              <button
                key={h.dir + h.q}
                onClick={() => onPickHistory(h)}
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
            onClick={() => onQueryChange("")}
            className="flex items-center gap-1 hover:text-stone-600"
            aria-label="Xoá nội dung đang nhập"
          >
            <X size={12} /> Xoá
          </button>
        )}
      </div>
    </div>
  );
}

function WordOfTheDay({ wod, onOpen }) {
  if (!wod) return null;
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
        <Sparkles size={14} />
        <span>Từ hôm nay</span>
      </div>
      <div className="text-lg font-semibold text-stone-800" style={FONT_SERIF}>
        {wod.display}
      </div>
      <div className="text-[15px] text-stone-600">{wod.meanings[0]}</div>
      <button onClick={() => onOpen(wod.display)} className="mt-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700">
        Tra từ này
      </button>
    </div>
  );
}

function ResultPanel({
  tgtLabel,
  query,
  onQueryChange,
  hasAnything,
  showBreakdown,
  analysis,
  onReplace,
  copied,
  onCopy,
  results,
  terms,
  direction,
  favIds,
  onToggleFavorite,
  wod,
}) {
  return (
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
          <WordOfTheDay wod={wod} onOpen={onQueryChange} />
        </div>
      ) : !hasAnything ? (
        <div className="text-sm leading-relaxed text-stone-400">
          Không tìm thấy từ nào phù hợp trong từ điển. Thử gõ ngắn hơn, gõ không dấu hoặc kiểm tra lại
          chính tả.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 overflow-y-auto max-h-80 sm:max-h-[28rem] pr-1">
          {showBreakdown && (
            <Breakdown analysis={analysis} onReplace={onReplace} copied={copied} onCopy={onCopy} />
          )}
          {results.map((g, i) => (
            <ResultCard
              key={g.key}
              g={g}
              accent={i % 3}
              terms={terms}
              saved={favIds.has(`${direction}|${g.key}`)}
              onToggle={() => onToggleFavorite(direction, g.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function LookupMode({
  srcLabel,
  tgtLabel,
  placeholder,
  query,
  onQueryChange,
  history,
  onPickHistory,
  onClearHistory,
  entryCount,
  onSwap,
  hasAnything,
  showBreakdown,
  analysis,
  onReplaceWord,
  copied,
  onCopy,
  results,
  terms,
  direction,
  favIds,
  onToggleFavorite,
  wod,
}) {
  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-5">
      <SourcePanel
        srcLabel={srcLabel}
        placeholder={placeholder}
        query={query}
        onQueryChange={onQueryChange}
        history={history}
        onPickHistory={onPickHistory}
        onClearHistory={onClearHistory}
        entryCount={entryCount}
      />

      <div className="flex md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 justify-center -my-2.5 md:my-0 z-10">
        <button
          onClick={onSwap}
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

      <ResultPanel
        tgtLabel={tgtLabel}
        query={query}
        onQueryChange={onQueryChange}
        hasAnything={hasAnything}
        showBreakdown={showBreakdown}
        analysis={analysis}
        onReplace={onReplaceWord}
        copied={copied}
        onCopy={onCopy}
        results={results}
        terms={terms}
        direction={direction}
        favIds={favIds}
        onToggleFavorite={onToggleFavorite}
        wod={wod}
      />
    </div>
  );
}
