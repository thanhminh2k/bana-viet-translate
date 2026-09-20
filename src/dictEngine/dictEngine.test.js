// Chạy: node --test   (cần "type": "module" trong package.json, mặc định của Vite)
import test from "node:test";
import assert from "node:assert/strict";
import {
  analyze,
  buildIndex,
  fold,
  highlightParts,
  lookup,
  makeQuestion,
  isQuizable,
  wordOfTheDay,
} from "./dictEngine.js";

// Dữ liệu giả lập, chỉ để kiểm tra logic
const ROWS = [
  { bana: "aaa", viet: "heo" },
  { bana: "bbb", viet: "con" },
  { bana: "ccc", viet: "gà" },
  { bana: "ddd", viet: "ga" },
  { bana: "eee", viet: "cây lúa" },
  { bana: "fff", viet: "lúa" },
  { bana: "ggg", viet: "con gà trống" },
  { bana: "hhh", viet: "con trâu" },
  { bana: "iii", viet: "nước", example: "Ví dụ" },
];
const vb = buildIndex(ROWS, "vb");
const bv = buildIndex(ROWS, "bv");

test("fold bỏ dấu, kể cả đ", () => {
  assert.equal(fold("Đường Cây Lúa"), "duong cay lua");
});

test("'con heo' tách thành 'con' (loại từ, mờ) + 'heo'", () => {
  const a = analyze(vb, "con heo", "vb");
  assert.equal(a.segments.length, 2);
  assert.equal(a.segments[0].loose, true);
  assert.equal(a.segments[1].entries[0].meanings[0], "aaa");
  assert.equal(a.draft, "aaa");
  // "con gà", "con trâu"… không được làm ngập danh sách
  assert.equal(a.results[0].key, "heo");
  assert.ok(!a.results.some((g) => g.key === "con trâu"));
});

test("ưu tiên cụm dài nhất", () => {
  const a = analyze(vb, "cây lúa", "vb");
  assert.equal(a.segments.length, 1);
  assert.equal(a.segments[0].text, "cây lúa");
  assert.equal(a.draft, "eee");
});

test("gõ không dấu vẫn tra được", () => {
  const a = analyze(vb, "cay lua", "vb");
  assert.equal(a.segments.length, 1);
  assert.equal(a.segments[0].entries[0].key, "cây lúa");
});

test("gõ không dấu lấy mọi biến thể, gõ có dấu chỉ lấy đúng mục", () => {
  assert.deepEqual(lookup(vb, "ga").map((g) => g.key).sort(), ["ga", "gà"]);
  assert.deepEqual(lookup(vb, "gà").map((g) => g.key), ["gà"]);
});

test("gõ sai chính tả thì có gợi ý", () => {
  const a = analyze(vb, "heoo", "vb");
  assert.equal(a.segments[0].entries.length, 0);
  assert.equal(a.segments[0].suggestions[0].key, "heo");
});

test("từ không có trong từ điển hiện dạng [từ] trong bản ghép", () => {
  const a = analyze(vb, "heo zzzz", "vb");
  assert.equal(a.draft, "aaa [zzzz]");
});

test("chỉ gõ mỗi loại từ thì vẫn tra bình thường", () => {
  const a = analyze(vb, "con", "vb");
  assert.equal(a.segments[0].loose, false);
  assert.equal(a.draft, "bbb");
});

test("tô sáng đúng chỗ khi gõ không dấu", () => {
  const parts = highlightParts("Cây lúa", ["lua"]);
  assert.deepEqual(parts, [
    { text: "Cây ", hit: false },
    { text: "lúa", hit: true },
  ]);
});

test("chiều Bahnar → Việt", () => {
  const a = analyze(bv, "aaa bbb", "bv");
  assert.equal(a.draft, "heo con");
});

test("câu hỏi trắc nghiệm hợp lệ", () => {
  const pool = [...vb.map.values()].filter(isQuizable);
  // bộ sinh số ngẫu nhiên có hạt giống để kết quả lặp lại được
  let seed = 42;
  const rng = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
  const q = makeQuestion(pool, pool, rng);
  assert.ok(q);
  assert.equal(q.options.length, 4);
  assert.ok(q.options.includes(q.correct));
  assert.equal(new Set(q.options).size, 4);
});

test("từ của ngày cố định trong cùng một ngày", () => {
  const d = new Date(2026, 8, 20);
  assert.equal(wordOfTheDay(vb, d).key, wordOfTheDay(vb, new Date(2026, 8, 20, 23)).key);
});
