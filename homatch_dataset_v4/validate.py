"""Full v4 schema, provenance and distribution checks."""
import collections
import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parent
sys.path.insert(0, str(root.parent / "upload"))
from schema_v4 import ListingV4  # noqa: E402

items = json.loads((root / "listings_v4.json").read_text(encoding="utf-8"))
refs = json.loads((root / "market_references.json").read_text(encoding="utf-8"))["references"]
ref_ids = {r["id"] for r in refs}
assert len(items) == 100
assert {x["id"] for x in items} == {f"HCM_{i:03d}" for i in range(1, 101)}
assert len(ref_ids) == len(refs)
for item in items:
    ListingV4.model_validate(item)
    assert set(item["reference_ids"]) <= ref_ids
assert collections.Counter(x["target_segment"] for x in items) == {
    "student": 50, "young_professional":20, "couple_family":20, "premium":10
}
print(f"PASS: {len(items)} listings; {len(refs)} references; schema, ID and segment checks")
print(f"Records with at least one area-level reference: {sum(bool(x['reference_ids']) for x in items)}")
