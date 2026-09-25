import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { DIR_LABEL } from "../constants";
import Quiz from "./Quiz";
import StudySession from "./StudySession";

export default function PracticeModule({
  index,
  direction,
  swapDirection,
  savedKeys,
  srsData,
  setSrsData,
  daily,
  setDaily,
  srsSettings,
  setSrsSettings,
}) {
  const [studyTab, setStudyTab] = useState("srs");

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={swapDirection}
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
  );
}
