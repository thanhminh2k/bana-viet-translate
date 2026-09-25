import { useDeferredValue, useEffect, useMemo, useState } from "react";
import DICT_RAW from "../bana_viet_dict.json";
import { AppHeader } from "./components/AppHeader";
import { Letterhead } from "./components/Letterhead";
import LookupMode from "./components/LookupMode";
import { ModeTabs } from "./components/ModeTabs";
import PracticeModule from "./components/PracticeModule";
import SavedWordbook from "./components/SavedWordbook";
import {
  DEFAULT_SRS_SETTINGS,
  FONT_IMPORT_CSS,
  FONT_SANS,
  HISTORY_LIMIT,
  SRS_CARDS_KEY,
  SRS_DAILY_KEY,
  SRS_SETTINGS_KEY,
} from "./constants";
import { analyze, buildIndex, normalize, wordOfTheDay } from "./dictEngine";
import { useStoredState } from "./hooks/useStoredState";
import { freshDaily, todayKey } from "./srs";

import backgroundImage from "./assets/background.jpg";

export default function BahnarDictionary() {
  const [mode, setMode] = useState("lookup");
  const [direction, setDirection] = useState("vb");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useStoredState("bahnar.favorites.v1", []);
  const [history, setHistory] = useStoredState("bahnar.history.v1", []);
  const [srsData, setSrsData] = useStoredState(SRS_CARDS_KEY, {});
  const [daily, setDaily] = useStoredState(SRS_DAILY_KEY, freshDaily());
  const [srsSettings, setSrsSettings] = useStoredState(SRS_SETTINGS_KEY, DEFAULT_SRS_SETTINGS);

  useEffect(() => {
    if (daily.date !== todayKey()) setDaily(freshDaily());
  }, [daily.date, setDaily]);

  const indexes = useMemo(() => ({ bv: buildIndex(DICT_RAW, "bv"), vb: buildIndex(DICT_RAW, "vb") }), []);
  const index = indexes[direction];

  const entryCount = useMemo(() => {
    const s = new Set();
    DICT_RAW.forEach((r) => s.add(normalize(r.bana) + "|" + normalize(r.viet)));
    return s.size;
  }, []);

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

  function swap() {
    setDirection((d) => (d === "bv" ? "vb" : "bv"));
  }

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

  return (
    <div
  className="min-h-screen w-full bg-cover bg-center bg-fixed bg-no-repeat px-4 py-8 sm:px-6 sm:py-10"
  style={{
    ...FONT_SANS,
    backgroundImage: `url(${backgroundImage})`,
  }}
    >
      <style>{FONT_IMPORT_CSS}</style>

        <Letterhead />
      <div className="mx-auto max-w-5xl">
        <AppHeader />
        <ModeTabs mode={mode} onChange={setMode} favoriteCount={favorites.length} />

        {mode === "lookup" && (
          <LookupMode
            srcLabel={srcLabel}
            tgtLabel={tgtLabel}
            placeholder={placeholder}
            query={query}
            onQueryChange={setQuery}
            history={history}
            onPickHistory={(h) => {
              setDirection(h.dir);
              setQuery(h.q);
            }}
            onClearHistory={() => setHistory([])}
            entryCount={entryCount}
            onSwap={swap}
            hasAnything={hasAnything}
            showBreakdown={showBreakdown}
            analysis={analysis}
            onReplaceWord={replaceWord}
            copied={copied}
            onCopy={copyDraft}
            results={results}
            terms={terms}
            direction={direction}
            favIds={favIds}
            onToggleFavorite={toggleFavorite}
            wod={wod}
          />
        )}

        {mode === "quiz" && (
          <PracticeModule
            index={index}
            direction={direction}
            swapDirection={swap}
            savedKeys={savedKeys}
            srsData={srsData}
            setSrsData={setSrsData}
            daily={daily}
            setDaily={setDaily}
            srsSettings={srsSettings}
            setSrsSettings={setSrsSettings}
          />
        )}

        {mode === "saved" && (
          <SavedWordbook savedEntries={savedEntries} toggleFavorite={toggleFavorite} openEntry={openEntry} />
        )}

        <div className="text-center mt-6 text-xs text-stone-400">
          Nhập một từ hoặc cả câu · ưu tiên khớp cụm dài nhất, rồi tự tách từng từ để tra cứu
        </div>
      </div>
    </div>
  );
}
