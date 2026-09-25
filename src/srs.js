import {
  EASY_BONUS,
  EASY_DAYS,
  GRADUATE_DAYS,
  LEARNING_STEPS_MIN,
  MIN_EASE,
  RELEARN_STEPS_MIN,
} from "./constants";

export function startOfDay(ts) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function todayKey(ts = Date.now()) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function freshCard() {
  return { state: "new", due: 0, interval: 0, ease: 2.5, reps: 0, lapses: 0, learningStep: 0 };
}

export function freshDaily(ts = Date.now()) {
  return { date: todayKey(ts), bv: { introduced: 0, reviewed: 0 }, vb: { introduced: 0, reviewed: 0 } };
}

export function schedule(card, rating, now = Date.now()) {
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

export function formatDelta(ms) {
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

export function previewLabel(card, rating, now) {
  const next = schedule(card, rating, now);
  return formatDelta(next.due - now);
}
