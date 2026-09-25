export const FONT_IMPORT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
`;

export const WOVEN_BAR_STYLE = {
  backgroundImage:
    "repeating-linear-gradient(-45deg, #fb7185 0px, #fb7185 8px, #2dd4bf 8px, #2dd4bf 16px, #fbbf24 16px, #fbbf24 24px, transparent 24px, transparent 28px)",
};

export const FONT_SERIF = { fontFamily: "'Fraunces', serif" };
export const FONT_SANS = { fontFamily: "'Be Vietnam Pro', sans-serif" };

export const ACCENT_BORDERS = ["border-l-teal-400", "border-l-rose-400", "border-l-amber-400"];
export const ACCENT_MARKERS = ["marker:text-teal-500", "marker:text-rose-500", "marker:text-amber-500"];

export const DIR_LABEL = { bv: "Bahnar → Việt", vb: "Việt → Bahnar" };
export const HISTORY_LIMIT = 8;

export const SRS_CARDS_KEY = "bahnar.srs.cards.v1";
export const SRS_DAILY_KEY = "bahnar.srs.daily.v1";
export const SRS_SETTINGS_KEY = "bahnar.srs.settings.v1";

export const LEARNING_STEPS_MIN = [1, 10];
export const RELEARN_STEPS_MIN = [10];
export const GRADUATE_DAYS = 1;
export const EASY_DAYS = 4;
export const MIN_EASE = 1.3;
export const EASY_BONUS = 1.3;
export const DEFAULT_SRS_SETTINGS = { newPerDay: 15, reviewPerDay: 100, pool: "all" };

export const RATINGS = [
  { id: "again", label: "Lại", cls: "bg-rose-500 hover:bg-rose-600" },
  { id: "hard", label: "Khó", cls: "bg-amber-500 hover:bg-amber-600" },
  { id: "good", label: "Tốt", cls: "bg-teal-500 hover:bg-teal-600" },
  { id: "easy", label: "Dễ", cls: "bg-sky-500 hover:bg-sky-600" },
];
