import { FONT_SERIF, WOVEN_BAR_STYLE } from "../constants";

export function AppHeader() {
  return (
    <>
      <div className="flex flex-col items-center text-center">
        <h3 className="text-3xl sm:text-4xl font-semibold text-stone-800" style={FONT_SERIF}>
          <span className="text-rose-500">Bahnar</span>
          <span className="text-amber-400 mx-2">·</span>
          <span className="text-teal-600">Việt</span>
        </h3>
        <p className="text-sm sm:text-base text-stone-500">Từ điển đối chiếu Bahnar - Tiếng Việt</p>
      </div>
      <div className="h-2.5 rounded-full my-6 opacity-90" style={WOVEN_BAR_STYLE} />
    </>
  );
}
