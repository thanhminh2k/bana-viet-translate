import { FONT_SERIF } from "../constants";

export function AppHeader() {
  return (
      <div className="flex flex-col items-center text-center mb-2">
        <h3 className="text-3xl sm:text-4xl font-semibold text-stone-800" style={FONT_SERIF}>
          <span className="text-rose-500">Bahnar</span>
          <span className="text-amber-400 mx-2">·</span>
          <span className="text-teal-600">Việt</span>
        </h3>
      </div>
  );
}
