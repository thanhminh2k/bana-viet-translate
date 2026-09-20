/* =========================================================================
 * dictEngine.js — Lõi tìm kiếm của từ điển Bahnar–Việt
 * Module thuần (không phụ thuộc React) nên có thể test độc lập.
 *
 * Khả năng chính:
 *  - Tra không dấu / sai dấu  (fold + chỉ mục theo dạng bỏ dấu)
 *  - Ghép cụm dài nhất trước, rồi dịch từng từ (forward maximum matching)
 *  - Gợi ý khi gõ sai chính tả (khoảng cách Levenshtein có giới hạn)
 *  - Tô sáng đúng vị trí kể cả khi người dùng gõ không dấu
 *  - Sinh câu hỏi trắc nghiệm và "từ của ngày"
 * ======================================================================= */

/* ---------- Cấu hình (chỉnh ở đây) ---------- */

// Loại từ / hư từ tiếng Việt thường không có từ tương ứng trong tiếng Bahnar
// (ví dụ "con" trong "con heo"). Chúng vẫn được tra nhưng bị làm mờ,
// không đưa vào bản ghép và không làm nhiễu danh sách kết quả.
export const LOOSE_WORDS = {
  vb: new Set(["con", "cái", "chiếc", "những", "các", "một", "mấy", "cây", "quả", "trái"]),
  bv: new Set(),
};

// Số từ tối đa của một cụm khi ghép (ví dụ "cây lúa nước" = 3)
export const MAX_PHRASE_WORDS = 6;

/* ---------- Chuẩn hoá chuỗi ---------- */

const SEPARATORS = /[\s,;.!?:()"“”/\\|]+/;
const MARKS = /[\u0300-\u036f]/g;

// Bỏ dấu, không cắt khoảng trắng (dùng được cho từng ký tự)
function foldRaw(s) {
  return s.normalize("NFC").toLowerCase().normalize("NFD").replace(MARKS, "").replace(/đ/g, "d");
}

// NFC + chữ thường: tránh lỗi "gõ đúng mà không khớp" do dấu tổ hợp / dựng sẵn
export function normalize(s) {
  return String(s ?? "").normalize("NFC").toLowerCase().trim();
}

// Dạng không dấu: "Cây lúa" -> "cay lua", "đường" -> "duong"
export function fold(s) {
  return foldRaw(String(s ?? "")).trim();
}

// Tách câu thành danh sách từ THEO ĐÚNG THỨ TỰ (giữ cả từ lặp)
export function splitWords(s) {
  return normalize(s).split(SEPARATORS).filter(Boolean);
}

export function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ---------- Xây chỉ mục ---------- */

/**
 * rows: [{ bana, viet, example? }]
 * direction: "bv" (Bahnar → Việt) hoặc "vb" (Việt → Bahnar)
 *
 * Trả về:
 *  - map:    khoá chuẩn hoá (có dấu) → nhóm mục từ
 *  - byFold: khoá không dấu → mảng các nhóm (các biến thể dấu)
 *  - maxLen: số từ của cụm dài nhất trong từ điển (bị chặn bởi MAX_PHRASE_WORDS)
 */
export function buildIndex(rows, direction) {
  const map = new Map();
  for (const row of rows) {
    const src = direction === "bv" ? row.bana : row.viet;
    const tgt = direction === "bv" ? row.viet : row.bana;
    const words = splitWords(src);
    const key = words.join(" ");
    if (!key || !tgt) continue;
    let g = map.get(key);
    if (!g) {
      g = {
        key,
        display: String(src).trim(),
        words,
        fkey: fold(key),
        fwords: words.map(fold),
        meanings: [],
        examples: [],
      };
      map.set(key, g);
    }
    if (!g.meanings.includes(tgt)) g.meanings.push(tgt);
    if (row.example && !g.examples.includes(row.example)) g.examples.push(row.example);
  }

  const byFold = new Map();
  let maxLen = 1;
  for (const g of map.values()) {
    if (!byFold.has(g.fkey)) byFold.set(g.fkey, []);
    byFold.get(g.fkey).push(g);
    maxLen = Math.max(maxLen, g.words.length);
  }
  return { map, byFold, maxLen: Math.min(maxLen, MAX_PHRASE_WORDS) };
}

/* ---------- Tra một cụm ---------- */

/**
 * - Gõ CÓ dấu và khớp đúng  → chỉ lấy mục đó ("gà" không kéo theo "ga").
 * - Gõ KHÔNG dấu           → lấy mọi biến thể ("ga" → ga, gà, gả…), mục khớp đúng lên trước.
 * - Gõ có dấu nhưng sai     → lấy các biến thể cùng dạng không dấu.
 */
export function lookup(index, cand) {
  const variants = index.byFold.get(fold(cand)) ?? [];
  if (variants.length === 0) return [];
  const exact = index.map.get(cand);
  if (exact && fold(cand) !== cand) return [exact];
  return exact ? [exact, ...variants.filter((v) => v !== exact)] : variants;
}

/* ---------- Chấm điểm ---------- */

/**
 * Chấm điểm một nhóm so với câu tìm kiếm (đã bỏ dấu).
 * Khớp nguyên cụm > từng từ (nguyên từ > bắt đầu bằng > chứa).
 * Mục khớp đủ mọi từ khoá được cộng thêm.
 */
export function scoreEntry(g, fphrase, ftokens) {
  if (!fphrase) return 0;
  let score = 0;
  if (g.fkey === fphrase) score += 1000;
  else if (g.fkey.startsWith(fphrase)) score += 800;
  else if (g.fkey.includes(fphrase)) score += 600;

  let matched = 0;
  for (const t of ftokens) {
    let best = 0;
    for (const w of g.fwords) {
      if (w === t) {
        best = 100;
        break;
      }
      // Từ 1 ký tự chỉ được khớp nguyên từ, tránh ra quá nhiều kết quả nhiễu
      if (t.length >= 2) {
        if (w.startsWith(t)) best = Math.max(best, 60);
        else if (w.includes(t)) best = Math.max(best, 30);
      }
    }
    if (best > 0) {
      matched++;
      score += best;
    }
  }
  if (ftokens.length > 1 && matched === ftokens.length) score += 150;
  return score + matched * 20;
}

/* ---------- Gợi ý khi gõ sai ---------- */

// Levenshtein có giới hạn: dừng sớm khi chắc chắn vượt quá `max`
export function editDistance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

// Gợi ý cho một từ không tra được: mục bắt đầu/chứa từ đó, rồi mục gần giống chính tả
export function suggest(index, token, limit = 3) {
  const t = fold(token);
  if (!t) return [];

  const scored = [];
  for (const g of index.map.values()) {
    const s = scoreEntry(g, t, [t]);
    if (s > 0) scored.push({ g, s });
  }
  scored.sort((a, b) => b.s - a.s || a.g.key.length - b.g.key.length || a.g.key.localeCompare(b.g.key));
  const out = scored.slice(0, limit).map((x) => x.g);

  const max = t.length <= 3 ? 0 : t.length <= 6 ? 1 : 2;
  if (out.length < limit && max > 0) {
    const near = [];
    for (const [fk, groups] of index.byFold) {
      if (fk.includes(" ")) continue;
      const d = editDistance(t, fk, max);
      if (d <= max) near.push({ groups, d });
    }
    near.sort((a, b) => a.d - b.d);
    for (const n of near) {
      for (const g of n.groups) {
        if (out.length < limit && !out.includes(g)) out.push(g);
      }
    }
  }
  return out;
}

/* ---------- Ghép cụm dài nhất (dịch từng từ) ---------- */

/**
 * "con heo": thử "con heo" → nếu không có thì thử "con", rồi "heo".
 * Mỗi đoạn: { text, entries, len, start }. entries rỗng = không tra được.
 */
export function segment(words, index) {
  const segs = [];
  let i = 0;
  while (i < words.length) {
    let hit = null;
    for (let len = Math.min(index.maxLen, words.length - i); len >= 1; len--) {
      const text = words.slice(i, i + len).join(" ");
      const entries = lookup(index, text);
      if (entries.length > 0) {
        hit = { text, entries, len, start: i };
        break;
      }
    }
    if (hit) {
      segs.push(hit);
      i += hit.len;
    } else {
      segs.push({ text: words[i], entries: [], len: 1, start: i });
      i += 1;
    }
  }
  return segs;
}

/* ---------- Phân tích trọn vẹn một câu tra ---------- */

export function analyze(index, query, direction) {
  const words = splitWords(query);
  if (words.length === 0) {
    return { words, phrase: "", terms: [], results: [], segments: [], draft: "" };
  }

  const phrase = words.join(" ");
  const fphrase = fold(phrase);
  const plain = fphrase === phrase; // cả câu không có dấu
  const loose = LOOSE_WORDS[direction] ?? new Set();
  const looseFolded = new Set([...loose].map(fold));
  // Nếu gõ không dấu thì "cai"/"con" vẫn được coi là loại từ
  const isLoose = (w) => loose.has(w) || (plain && looseFolded.has(w));

  const uniq = [...new Set(words)];
  const content = uniq.filter((w) => !isLoose(w));
  const ftokens = [...new Set((content.length > 0 ? content : uniq).map(fold))];

  const terms = [...new Set([fphrase, ...ftokens.filter((t) => t.length >= 2)])]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  // Danh sách mục từ liên quan
  const scored = [];
  for (const g of index.map.values()) {
    let s = scoreEntry(g, fphrase, ftokens);
    if (s > 0) {
      if (g.key === phrase) s += 200; // khớp cả dấu thì hơn khớp không dấu
      scored.push({ g, s });
    }
  }
  scored.sort((a, b) => b.s - a.s || a.g.key.length - b.g.key.length || a.g.key.localeCompare(b.g.key));
  const results = scored.slice(0, 60).map((x) => x.g);

  // Dịch từng từ
  const raw = segment(words, index);
  const hasContent = raw.some((s) => !isLoose(s.text));
  const segments = raw.map((s) => ({
    ...s,
    loose: hasContent && isLoose(s.text),
    suggestions: s.entries.length > 0 ? [] : suggest(index, s.text),
  }));
  const draft = segments
    .filter((s) => !s.loose)
    .map((s) => (s.entries.length > 0 ? s.entries[0].meanings[0] : `[${s.text}]`))
    .join(" ");

  return { words, phrase, terms, results, segments, draft };
}

/* ---------- Tô sáng ---------- */

/**
 * Tô sáng trên văn bản GỐC dù từ khoá đã bỏ dấu.
 * Trả về [{ text, hit }]. `fterms` phải là dạng đã bỏ dấu (analyze().terms).
 */
export function highlightParts(text, fterms) {
  const chars = Array.from(String(text ?? "").normalize("NFC"));
  const terms = (fterms || []).filter(Boolean);
  if (terms.length === 0) return [{ text: chars.join(""), hit: false }];

  let folded = "";
  const map = []; // vị trí trong chuỗi đã bỏ dấu → chỉ số ký tự gốc
  chars.forEach((ch, i) => {
    const piece = foldRaw(ch);
    for (let k = 0; k < piece.length; k++) map.push(i);
    folded += piece;
  });

  const re = new RegExp(
    [...terms].sort((a, b) => b.length - a.length).map(escapeRegExp).join("|"),
    "g"
  );
  const hitChar = new Array(chars.length).fill(false);
  let m;
  while ((m = re.exec(folded)) !== null) {
    if (m[0].length === 0) {
      re.lastIndex++;
      continue;
    }
    for (let j = map[m.index]; j <= map[m.index + m[0].length - 1]; j++) hitChar[j] = true;
  }
  // Dấu tổ hợp đứng riêng đi theo ký tự đứng trước
  chars.forEach((ch, i) => {
    if (i > 0 && foldRaw(ch) === "") hitChar[i] = hitChar[i - 1];
  });

  const parts = [];
  chars.forEach((ch, i) => {
    const last = parts[parts.length - 1];
    if (last && last.hit === hitChar[i]) last.text += ch;
    else parts.push({ text: ch, hit: hitChar[i] });
  });
  return parts;
}

/* ---------- Luyện tập & từ của ngày ---------- */

// Chỉ dùng các mục ngắn gọn cho câu hỏi trắc nghiệm / từ của ngày
export function isQuizable(g) {
  return (
    g.meanings.length > 0 &&
    g.meanings[0].length <= 40 &&
    g.display.length <= 40 &&
    g.words.length <= 3
  );
}

// Từ của ngày: cố định trong một ngày, đổi vào ngày hôm sau
export function wordOfTheDay(index, date = new Date()) {
  const pool = [...index.map.values()].filter(isQuizable);
  if (pool.length === 0) return null;
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  return pool[(day * 7919) % pool.length];
}

/**
 * Câu hỏi trắc nghiệm: `source` là nhóm để hỏi, `pool` là nguồn lấy đáp án nhiễu.
 * Trả về null nếu không đủ dữ liệu.
 */
export function makeQuestion(source, pool, rng = Math.random, nOptions = 4) {
  if (source.length === 0 || pool.length < nOptions) return null;
  const g = source[Math.floor(rng() * source.length)];
  const correct = g.meanings[0];
  const options = [correct];
  let guard = 0;
  while (options.length < nOptions && guard++ < 300) {
    const d = pool[Math.floor(rng() * pool.length)].meanings[0];
    // không chọn đáp án nhiễu trùng nghĩa với đáp án đúng
    if (!options.includes(d) && !g.meanings.includes(d)) options.push(d);
  }
  if (options.length < nOptions) return null;
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { group: g, prompt: g.display, correct, options };
}
