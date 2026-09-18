"""
Gộp các file batch (kết quả từ mỗi đoạn chat xử lý 10 trang) vào
bana_viet_dict.json chính, tự động loại các mục đã trùng (trùng cả
bana lẫn viet, không phân biệt hoa/thường và khoảng trắng thừa).

Cách dùng:
1. Đặt tất cả file batch (vd: batch_p23-32.json, batch_p33-42.json...)
   vào cùng thư mục với bana_viet_dict.json và script này.
2. Chạy:
       python merge_batches.py batch_p23-32.json batch_p33-42.json
   (liệt kê bao nhiêu file batch cũng được, cách nhau bởi dấu cách)
3. Script sẽ cập nhật thẳng bana_viet_dict.json, đồng thời in ra danh
   sách các mục bị coi là trùng (không thêm) để bạn kiểm tra lại nếu cần.
"""

import json
import sys


def normalize(s):
    return (s or "").strip().lower()


def main():
    if len(sys.argv) < 2:
        print("Cách dùng: python merge_batches.py batch1.json batch2.json ...")
        sys.exit(1)

    main_file = "bana_viet_dict.json"
    with open(main_file, "r", encoding="utf-8") as f:
        main_dict = json.load(f)

    existing_keys = set()
    for row in main_dict:
        existing_keys.add((normalize(row.get("bana")), normalize(row.get("viet"))))

    added = 0
    skipped = []

    for batch_path in sys.argv[1:]:
        with open(batch_path, "r", encoding="utf-8") as f:
            batch = json.load(f)
        for row in batch:
            key = (normalize(row.get("bana")), normalize(row.get("viet")))
            if key in existing_keys:
                skipped.append(row)
                continue
            main_dict.append(row)
            existing_keys.add(key)
            added += 1

    with open(main_file, "w", encoding="utf-8") as f:
        json.dump(main_dict, f, ensure_ascii=False, separators=(",", ":"))

    print(f"Đã thêm {added} mục mới. Tổng số mục trong từ điển: {len(main_dict)}")

    if skipped:
        print(f"\nBỏ qua {len(skipped)} mục vì đã trùng sẵn:")
        for row in skipped:
            print(f"  - {row.get('bana')} = {row.get('viet')}")


if __name__ == "__main__":
    main()
