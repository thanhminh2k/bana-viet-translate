#!/usr/bin/env node
/**
 * split-dict-meanings.mjs
 * ---------------------------------------------------------------
 * Xử lý bana_viet_dict.json: một số mục có nhiều nghĩa/biến thể
 * gộp chung trong một trường, phân cách bởi dấu ";" — ví dụ:
 *   { "bana": "hla",  "viet": "mình; chúng mình" }
 * Script này tách chúng thành các mục riêng biệt để việc tra cứu
 * và tính năng "Dịch từng từ" khớp đúng từng nghĩa một, thay vì
 * hiện nguyên cụm "Minh; chúng mình" như một khối.
 *
 * Cách dùng:
 *   node split-dict-meanings.mjs <input.json> [output.json] [tuỳ chọn]
 *
 * Tuỳ chọn:
 *   --fields=viet,bana   Các trường cần tách theo ";" (mặc định: viet,bana)
 *   --dry-run            Chỉ in báo cáo, không ghi file
 *   --keep-original      Giữ lại mục gốc (chưa tách) bên cạnh các mục đã tách
 *
 * Quy tắc tách:
 *   - Nếu chỉ MỘT trong hai trường (bana/viet) có nhiều biến thể,
 *     nhân với trường còn lại (giữ nguyên) -> an toàn, không đoán sai.
 *   - Nếu CẢ HAI trường có nhiều biến thể và SỐ LƯỢNG BẰNG NHAU,
 *     ghép theo thứ tự tương ứng (biến thể 1 với 1, 2 với 2, ...),
 *     vì đây thường là danh sách nghĩa/biến thể song song.
 *   - Nếu CẢ HAI có nhiều biến thể nhưng SỐ LƯỢNG KHÁC NHAU, không
 *     thể suy luận chắc chắn -> ghép tổ hợp (cartesian product) và
 *     GHI RÕ CẢNH BÁO để người dùng tự kiểm tra lại thủ công.
 *   - Loại bỏ khoảng trắng thừa, mục rỗng, và các mục trùng lặp
 *     hoàn toàn sau khi tách.
 * ------------------------------------------------------------- */

import fs from "node:fs";
import path from "node:path";

function parseArgs(argv) {
  const args = { _: [] };
  for (const a of argv) {
    if (a.startsWith("--fields=")) args.fields = a.slice("--fields=".length).split(",").map((s) => s.trim());
    else if (a === "--dry-run") args.dryRun = true;
    else if (a === "--keep-original") args.keepOriginal = true;
    else args._.push(a);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));
const inputPath = args._[0];
const outputPath = args._[1] || (inputPath ? inputPath.replace(/\.json$/i, ".split.json") : null);
const fields = args.fields || ["viet", "bana"];

if (!inputPath) {
  console.error("Thiếu file đầu vào.\nCách dùng: node split-dict-meanings.mjs <input.json> [output.json] [--fields=viet,bana] [--dry-run] [--keep-original]");
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));
if (!Array.isArray(raw)) {
  console.error("File JSON đầu vào phải là một mảng các mục từ điển.");
  process.exit(1);
}

// Tách một chuỗi theo dấu ";" (và biến thể có khoảng trắng quanh dấu ";")
function splitVariants(value) {
  if (typeof value !== "string") return [value];
  if (!value.includes(";")) return [value];
  return value
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

let splitCount = 0;
let zippedCount = 0;
let crossProductWarnings = [];
const output = [];
const seen = new Set();

function pushEntry(entry) {
  const sig = JSON.stringify(entry);
  if (seen.has(sig)) return;
  seen.add(sig);
  output.push(entry);
}

for (const entry of raw) {
  const variantsByField = {};
  let anyMultiField = false;

  for (const f of fields) {
    if (!(f in entry)) continue;
    const variants = splitVariants(entry[f]);
    variantsByField[f] = variants;
    if (variants.length > 1) anyMultiField = true;
  }

  if (!anyMultiField) {
    pushEntry(entry);
    continue;
  }

  splitCount++;
  if (args.keepOriginal) pushEntry(entry);

  const multiFields = fields.filter((f) => (variantsByField[f]?.length || 1) > 1);

  let combos;
  if (multiFields.length <= 1) {
    // Chỉ một trường có nhiều biến thể -> nhân đơn giản, an toàn tuyệt đối
    combos = [{}];
    for (const f of fields) {
      const variants = variantsByField[f] || [entry[f]];
      const next = [];
      for (const c of combos) for (const v of variants) next.push({ ...c, [f]: v });
      combos = next;
    }
  } else {
    const lengths = multiFields.map((f) => variantsByField[f].length);
    const sameLength = lengths.every((l) => l === lengths[0]);

    if (sameLength) {
      // Nhiều trường cùng có N biến thể -> ghép theo cặp tương ứng (zip)
      zippedCount++;
      const n = lengths[0];
      combos = [];
      for (let i = 0; i < n; i++) {
        const c = { ...entry };
        for (const f of fields) {
          const variants = variantsByField[f];
          c[f] = variants ? variants[Math.min(i, variants.length - 1)] : entry[f];
        }
        combos.push(c);
      }
      combos = combos.map(({ ...c }) => {
        const only = {};
        for (const f of fields) only[f] = c[f];
        return only;
      });
    } else {
      // Số biến thể khác nhau giữa các trường -> không chắc chắn, ghép tổ hợp + cảnh báo
      crossProductWarnings.push({ bana: entry.bana, viet: entry.viet });
      combos = [{}];
      for (const f of fields) {
        const variants = variantsByField[f] || [entry[f]];
        const next = [];
        for (const c of combos) for (const v of variants) next.push({ ...c, [f]: v });
        combos = next;
      }
    }
  }

  for (const combo of combos) {
    pushEntry({ ...entry, ...combo });
  }
}

console.log(`Đầu vào: ${raw.length} mục`);
console.log(`Đầu ra:  ${output.length} mục (đã loại trùng lặp)`);
console.log(`Số mục được tách: ${splitCount}`);
if (zippedCount) console.log(`  - trong đó ghép theo cặp tương ứng (zip, cùng số lượng biến thể): ${zippedCount}`);
if (crossProductWarnings.length) {
  console.log(`\n⚠️  ${crossProductWarnings.length} mục có SỐ BIẾN THỂ KHÁC NHAU giữa các trường — đã ghép tổ hợp, vui lòng kiểm tra lại thủ công:`);
  crossProductWarnings.slice(0, 20).forEach((w) => console.log(`   - bana: "${w.bana}" | viet: "${w.viet}"`));
  if (crossProductWarnings.length > 20) console.log(`   ... và ${crossProductWarnings.length - 20} mục khác`);
}

if (args.dryRun) {
  console.log("\n(--dry-run) Không ghi file. Bỏ cờ --dry-run để lưu kết quả.");
  process.exit(0);
}

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n", "utf8");
console.log(`\nĐã ghi kết quả vào: ${path.resolve(outputPath)}`);
