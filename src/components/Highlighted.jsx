import { Fragment, useMemo } from "react";
import { highlightParts } from "../dictEngine";

export function Highlighted({ text, terms }) {
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