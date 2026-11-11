"""Generate the portable Multilingual E5 Small listing artifact.

This is an offline operation. It downloads the open model through
sentence-transformers and never needs a provider API key.
"""
import json
from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "homatch_dataset_v4/listings_v4.json"
OUTPUT = ROOT / "data/embeddings/listings-multilingual-e5-small-384.json"
MODEL_ID = "intfloat/multilingual-e5-small"
MODEL = "intfloat/multilingual-e5-small"
DIMENSIONS = 384

listings = json.loads(SOURCE.read_text(encoding="utf-8"))
if len(listings) != 100 or len({item["id"] for item in listings}) != 100:
    raise SystemExit("Expected exactly 100 unique listings.")

def text_for(item):
    attrs = ", ".join(
        f"{key}: {value}" for key, value in item.get("attributes", {}).items()
        if value is True or (isinstance(value, str) and value)
    )
    nearby = ", ".join(place["name"] for place in item.get("nearby", []))
    return "\n".join([
        f"Tiêu đề: {item['title']}",
        f"Loại phòng: {item.get('room_type', '')}",
        f"Diện tích: {item['area_m2']} m2",
        f"Vị trí: {item.get('ward', '')}, {item.get('area_label', '')}, {item['city']}",
        f"Tiện nghi và lối sống: {attrs}",
        f"Địa điểm gần đó: {nearby}",
        f"Mô tả: {item.get('raw_description', '')}",
    ])

texts = [f"passage: {text_for(item)}" for item in listings]
model = SentenceTransformer(MODEL)
vectors = model.encode(texts, normalize_embeddings=True, convert_to_numpy=True, show_progress_bar=True)
if vectors.shape != (100, DIMENSIONS):
    raise SystemExit(f"Expected (100, 384), got {vectors.shape}.")

embeddings = [
    {"id": item["id"], "vector": [float(value) for value in vector], "metadata": {"title": item["title"], "target_segment": item.get("target_segment", "")}}
    for item, vector in zip(listings, vectors)
]
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
OUTPUT.write_text(json.dumps({
    "version": "v1",
    "model": MODEL_ID,
    "dimensions": DIMENSIONS,
    "pooling": "mean",
    "normalized": True,
    "prefix": "passage: ",
    "source": "homatch_dataset_v4/listings_v4.json",
    "embeddings": embeddings,
}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Wrote {len(embeddings)} vectors to {OUTPUT}")
