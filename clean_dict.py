# -*- coding: utf-8 -*-
"""
Script don dep bana_viet_dict.json
Chay: python3 clean_dict.py
Input:  bana_viet_dict.json
Output: bana_viet_dict.clean.json  + report in xu ra man hinh
"""
import json, re, sys
from collections import OrderedDict

SRC = "bana_viet_dict.json"
OUT = "bana_viet_dict.clean.json"

with open(SRC, encoding="utf-8") as f:
    raw = json.load(f)

report = {
    "input_count": len(raw),
    "dropped_empty_bana": 0,
    "dropped_empty_viet": 0,
    "semicolon_split": 0,
    "slash_expanded": 0,
    "exact_duplicates_removed": 0,
    "output_count": 0,
}

def split_semicolon(s):
    parts = [p.strip() for p in s.split(";") if p.strip()]
    return parts if parts else [s.strip()]

def expand_slash(s):
    """
    Tach 1 token co dang 'tuA/tuB' thanh 2 bien the cua ca cum,
    giu nguyen cac tu con lai.
    VD: 'Bôi hŏk hơdoi/hơdai' -> ['Bôi hŏk hơdoi', 'Bôi hŏk hơdai']
    Neu khong co token nao chua '/', tra ve [s] nguyen ban.
    """
    tokens = s.split(" ")
    slash_idx = [i for i, t in enumerate(tokens) if "/" in t]
    if not slash_idx:
        return [s]
    # chi xu ly truong hop pho bien: 1 token co '/'
    variants = [tokens[:]]
    for idx in slash_idx:
        alts = tokens[idx].split("/")
        new_variants = []
        for v in variants:
            for alt in alts:
                vv = v[:]
                vv[idx] = alt
                new_variants.append(vv)
        variants = new_variants
    return [" ".join(v).strip() for v in variants]

def cap_first(s):
    """Viet hoa chu cai dau, giu nguyen phan con lai (khong ha thuong phan sau)."""
    if not s:
        return s
    return s[0].upper() + s[1:]

cleaned = []

for d in raw:
    bana = (d.get("bana") or "").strip()
    viet = (d.get("viet") or "").strip()
    example = (d.get("example") or "").strip()

    if not bana:
        report["dropped_empty_bana"] += 1
        continue
    if not viet:
        report["dropped_empty_viet"] += 1
        continue

    bana_has_semi = ";" in bana
    viet_has_semi = ";" in viet

    bana_parts = split_semicolon(bana) if bana_has_semi else [bana]
    viet_parts = split_semicolon(viet) if viet_has_semi else [viet]

    if bana_has_semi or viet_has_semi:
        report["semicolon_split"] += 1

    # Truong hop CA HAI ben deu co ';' voi so luong bang nhau
    # -> ghep SONG SONG (tung cap tuong ung), khong lam tich Descartes
    if bana_has_semi and viet_has_semi and len(bana_parts) == len(viet_parts):
        pairs = list(zip(bana_parts, viet_parts))
    else:
        # tich Descartes (thuong 1 ben chi co 1 phan tu)
        pairs = [(b, v) for b in bana_parts for v in viet_parts]

    # Xu ly '/' (bien the chinh ta / cach noi khac) trong tung ve bana
    final_pairs = []
    for b, v in pairs:
        b_variants = expand_slash(b)
        if len(b_variants) > 1:
            report["slash_expanded"] += 1
        for bv in b_variants:
            final_pairs.append((bv, v))

    for b, v in final_pairs:
        b = cap_first(b.strip())
        v = cap_first(v.strip())
        entry = OrderedDict()
        entry["bana"] = b
        entry["viet"] = v
        if example:
            entry["example"] = example
        cleaned.append(entry)

# Khu trung lap hoan toan (khong phan biet hoa/thuong)
seen = set()
deduped = []
for e in cleaned:
    key = (e["bana"].lower(), e["viet"].lower())
    if key in seen:
        report["exact_duplicates_removed"] += 1
        continue
    seen.add(key)
    deduped.append(e)

report["output_count"] = len(deduped)

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(deduped, f, ensure_ascii=False, indent=None, separators=(",", ":"))

print(json.dumps(report, ensure_ascii=False, indent=2))
