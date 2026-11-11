"""Rebuild the supplied Homatch v3 dataset into a source-traceable synthetic v4.

Run from the workspace root:
  python homatch_dataset_v4/generate_market_anchored.py

The real estate advertisements are *references*, not records copied into the
dataset. No real landlord contact details or real listing photographs are used.
"""
from __future__ import annotations

import collections
import json
import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "upload"))
from schemas import Listing, estimate_utilities  # noqa: E402

RNG = random.Random(20261111)
OUT = Path(__file__).resolve().parent

REFERENCES = [
    {"id":"REF_001","platform":"Nha Tot","url":"https://www.nhatot.com/thue-phong-tro-thanh-pho-thu-duc-tp-ho-chi-minh/135223129.htm","area":"Linh Xuan","property_type":"room","price_vnd":1600000,"area_m2":16,"observed":"room, deposit and utility rates"},
    {"id":"REF_002","platform":"Nha Tot","url":"https://www.nhatot.com/thue-phong-tro-thanh-pho-thu-duc-tp-ho-chi-minh/135072472.htm","area":"Linh Xuan","property_type":"room","price_vnd":2200000,"area_m2":20,"observed":"rent, electricity, water and service fees"},
    {"id":"REF_003","platform":"Nha Tot","url":"https://www.nhatot.com/thue-phong-tro-thanh-pho-thu-duc-tp-ho-chi-minh/135652699.htm","area":"Thu Duc","property_type":"room","price_vnd":2100000,"area_m2":20,"observed":"shared laundry and flexible access"},
    {"id":"REF_004","platform":"Batdongsan.com.vn","url":"https://batdongsan.com.vn/cho-thue-can-ho-chung-cu-mini-duong-dinh-bo-linh-66/dt-duoi-30m2","area":"Binh Thanh","property_type":"mini_apartment","price_vnd":4900000,"area_m2":25,"observed":"mini-apartment market price examples"},
    {"id":"REF_005","platform":"Batdongsan.com.vn","url":"https://batdongsan.com.vn/cho-thue-can-ho-chung-cu-mini-binh-thanh","area":"Binh Thanh","property_type":"apartment","price_vnd":6400000,"area_m2":45,"observed":"one-bedroom furnished apartment examples"},
    {"id":"REF_006","platform":"Nha Tot","url":"https://www.nhatot.com/thue-phong-tro-quan-go-vap-tp-ho-chi-minh/135582415.htm","area":"Go Vap","property_type":"room","price_vnd":4600000,"area_m2":40,"observed":"furnished room and amenities"},
    {"id":"REF_007","platform":"Nha Tot","url":"https://www.nhatot.com/thue-phong-tro-quan-go-vap-tp-ho-chi-minh/134329033.htm","area":"Go Vap","property_type":"room","price_vnd":3390000,"area_m2":20,"observed":"occupant surcharge and pet restriction"},
    {"id":"REF_008","platform":"Nha Tot","url":"https://www.nhatot.com/thue-phong-tro-quan-go-vap-tp-ho-chi-minh/135568919.htm","area":"Go Vap","property_type":"room","price_vnd":3500000,"area_m2":21,"observed":"deposit, electricity, water and pet restriction"},
    {"id":"REF_009","platform":"Batdongsan.com.vn","url":"https://batdongsan.com.vn/cho-thue-can-ho-chung-cu-vinhomes-grand-park/cho-moi-2pn-gia-tot-tai-vi-tri-trung-tam-view-ep-pr46213756","area":"Vinhomes Grand Park","property_type":"apartment","price_vnd":8000000,"area_m2":None,"observed":"two-bedroom condominium asking price"},
    {"id":"REF_010","platform":"Batdongsan.com.vn","url":"https://batdongsan.com.vn/cho-thue-can-ho-chung-cu-vinhomes-central-park/2pn","area":"Vinhomes Central Park","property_type":"apartment","price_vnd":20000000,"area_m2":70.6,"observed":"two-bedroom premium condominium asking price"},
]

def reference_ids(item):
    area = (item["area_label"] + " " + item["ward"]).lower()
    if "vinhomes grand" in area:
        return ["REF_009"]
    if "vinhomes central" in area:
        return ["REF_010"]
    if "gò vấp" in area:
        return ["REF_006", "REF_007", "REF_008"]
    if "bình thạnh" in area:
        return ["REF_004", "REF_005"]
    if any(s in area for s in ("đại học", "dĩ an", "thủ đức", "linh xuân")):
        return ["REF_001", "REF_002", "REF_003"]
    # No direct comparable observation collected for premium/core areas yet.
    return []

def segment_assignments(data):
    # Priority counts are quotas for test-design scenarios, not exclusive eligibility.
    # Make plausible assignments from price/size, with a few high-budget students.
    premium = sorted(data, key=lambda x: x["base_price"], reverse=True)
    assigned = {}
    for item in premium[:10]:
        assigned[item["id"]] = "premium"
    family_candidates = sorted((x for x in data if x["id"] not in assigned),
        key=lambda x: (x["attributes"]["bedrooms"] >= 2, x["max_occupants"], x["area_m2"]), reverse=True)
    for item in family_candidates[:20]:
        assigned[item["id"]] = "couple_family"
    worker_candidates = sorted((x for x in data if x["id"] not in assigned),
        key=lambda x: (x["base_price"] >= 4000000, x["attributes"]["remote_work_friendly"], x["base_price"]), reverse=True)
    for item in worker_candidates[:20]:
        assigned[item["id"]] = "young_professional"
    for item in data:
        assigned.setdefault(item["id"], "student")
    return assigned

def enrich(item, segment):
    a = item["attributes"]
    family_sized = item["max_occupants"] >= 3 and (a["bedrooms"] >= 2 or item["area_m2"] >= 45)
    area = item["area_label"].lower()
    highrise = item["room_type"] == "apartment" and ("vinhomes" in area or "masteri" in item["building_name"].lower())
    # These fields are synthetic assumptions, never assertions about a real building.
    a["near_school"] = bool(family_sized and item["nearby"] and RNG.random() < .45)
    a["near_supermarket"] = bool(highrise or (item["ward"] in ("An Khánh", "Thạnh Mỹ Tây") and RNG.random() < .7))
    a["playground"] = bool(highrise and family_sized)
    a["security_24h"] = bool(highrise)
    a["child_friendly"] = bool(family_sized and (a["private_wc"] and (a["private_kitchen"] or item["room_type"] == "townhouse")))
    # Clear, multi-label compatibility rather than exclusive customer labels.
    suitable = set(item["suitable_for"])
    if item["base_price"] <= 9000000 and item["max_occupants"] <= 3:
        suitable.add("student")
    if item["max_occupants"] <= 3:
        suitable.add("worker")
    if family_sized:
        suitable.add("family")
    if segment == "student":
        suitable.add("student")
    if segment == "young_professional":
        suitable.add("worker")
    if segment == "couple_family":
        suitable.add("family")
    # Premium segment is not a demographic: wealthy students may use it too.
    item["suitable_for"] = sorted(suitable)
    item["target_segment"] = segment
    item["synthetic"] = True
    item["reference_ids"] = reference_ids(item)
    item["reference_note"] = ("Comparable market examples used for general pricing and feature ranges; "
                              "this address, price and availability are fictional." if item["reference_ids"]
                              else "No directly comparable price reference collected; synthetic assumption to verify.")
    # Buyer-facing copy should read like a normal rental description; synthetic
    # provenance stays in machine-readable metadata and a dataset-wide notice.
    money = lambda n: f"{n:,}".replace(",", ".")
    intros = [
        f'{item["title"]}. Phòng nằm ở khu {item["area_label"]}, diện tích {item["area_m2"]:g} m², tầng {item["floor"]}.',
        f'Khu {item["area_label"]}, {item["ward"]}: {item["title"]}. Diện tích sử dụng {item["area_m2"]:g} m².',
        f'{item["title"]}, phù hợp tối đa {item["max_occupants"]} người, hợp đồng từ {item["min_lease_months"]} tháng.',
        f'Cho thuê {item["title"]}. Không gian {item["area_m2"]:g} m² ở khu {item["area_label"]}.',
    ]
    parts = [intros[int(item["id"].split("_")[1]) % len(intros)]]
    if item["nearby"]:
        closest = item["nearby"][0]
        parts.append(f'Cách {closest["name"]} khoảng {closest["distance_km"]:g} km theo đường chim bay.')
    furnishing = {"none":"bàn giao trống", "basic":"nội thất cơ bản", "full":"đầy đủ nội thất"}[a["furnishing"]]
    practical = [f'{furnishing}', "WC riêng" if a["private_wc"] else "WC dùng chung",
                 "bếp riêng" if a["private_kitchen"] else "khu nấu ăn dùng chung hoặc chưa trang bị"]
    if a["air_conditioner"]: practical.append("máy lạnh")
    if a["balcony"]: practical.append("ban công")
    if a["elevator"]: practical.append("thang máy")
    if a["washing_machine"]: practical.append("máy giặt")
    parts.append("Trang bị: " + ", ".join(practical) + ".")
    if a["quiet_environment"]: parts.append("Không gian tương đối yên tĩnh, thuận tiện học tập hoặc nghỉ ngơi.")
    if a["remote_work_friendly"]: parts.append("Có thể bố trí góc làm việc tại nhà.")
    if a["natural_light"]: parts.append("Phòng có cửa sổ đón ánh sáng tự nhiên.")
    if a["playground"]: parts.append("Khu căn hộ có tiện ích vui chơi chung.")
    if a["security_24h"]: parts.append("Tòa nhà có khu vực bảo vệ trực 24 giờ.")
    parts.append("Cho phép thú cưng." if a["pet_friendly"] else "Không nhận nuôi thú cưng.")
    parts.append("Giờ giấc tự do." if a["access_hours"] == "flexible" else "Có giờ ra vào theo nội quy.")
    parts.append(f'Giá thuê {money(item["base_price"])}đ/tháng, cọc {money(item["deposit"])}đ; '
                 f'phí dịch vụ {money(item["management_fee"])}đ, gửi xe {money(item["parking_fee"])}đ/tháng. '
                 f'Điện {money(item["utility_rates"]["electricity_per_kwh"])}đ/kWh, '
                 f'nước {money(item["utility_rates"]["water_per_person"])}đ/người/tháng; '
                 f'Internet {money(item["utility_rates"]["internet_fee"])}đ/tháng.')
    parts.append(f'Số người ở tối đa: {item["max_occupants"]}.')
    item["raw_description"] = " ".join(parts)
    # Preserve existing schema's single-occupant all-in invariant.
    item["estimated_utilities"] = estimate_utilities(Listing.model_validate({k:v for k,v in item.items() if k not in ("target_segment","synthetic","reference_ids","reference_note")}), 1)
    return item

def main():
    data = json.loads((ROOT / "upload" / "listings.json").read_text(encoding="utf-8"))
    assert len(data) == 100 and len({x["id"] for x in data}) == 100
    assigned = segment_assignments(data)
    enriched = [enrich(item, assigned[item["id"]]) for item in data]
    assert collections.Counter(assigned.values()) == {"student":50,"young_professional":20,"couple_family":20,"premium":10}
    for item in enriched:
        Listing.model_validate(item)  # Existing v3 schema fields and cost invariants
    (OUT / "listings_v4.json").write_text(json.dumps(enriched, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (OUT / "market_references.json").write_text(json.dumps({"collected_at":"2026-11-11", "references":REFERENCES}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print("Validated:", len(enriched), "listings; target segments:", dict(collections.Counter(assigned.values())))

if __name__ == "__main__":
    main()
