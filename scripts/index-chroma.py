"""Build and verify a local ChromaDB index from Gemini embeddings.

This script is intentionally offline-only. It does not call Gemini and is not
required by the deployed Next.js application.
"""
import json
import shutil
from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer

ROOT = Path(__file__).resolve().parents[1]
ARTIFACT = ROOT / "data/embeddings/listings-multilingual-e5-small-384.json"
PERSIST_DIR = ROOT / "data/chroma"
COLLECTION_NAME = "homatch-listings-v1"

if not ARTIFACT.exists():
    raise SystemExit("BLOCKED: embedding artifact is missing. Run npm run embeddings first.")

artifact = json.loads(ARTIFACT.read_text(encoding="utf-8"))
embeddings = artifact.get("embeddings", [])
ids = [item["id"] for item in embeddings]
if artifact.get("model") != "intfloat/multilingual-e5-small" or artifact.get("dimensions") != 384:
    raise SystemExit("BLOCKED: embedding artifact model or dimensions are incompatible.")
if len(embeddings) != 100 or len(set(ids)) != 100:
    raise SystemExit("BLOCKED: expected exactly 100 unique listing embeddings.")
if any(len(item.get("vector", [])) != 384 for item in embeddings):
    raise SystemExit("BLOCKED: at least one embedding does not have 384 dimensions.")

if PERSIST_DIR.exists():
    shutil.rmtree(PERSIST_DIR)
client = chromadb.PersistentClient(path=str(PERSIST_DIR))
collection = client.get_or_create_collection(COLLECTION_NAME, metadata={"model": artifact["model"], "dimensions": 768})
collection.add(
    ids=ids,
    embeddings=[item["vector"] for item in embeddings],
    documents=[item["metadata"]["title"] for item in embeddings],
    metadatas=[{"listing_id": item["id"], "artifact_version": artifact["version"]} for item in embeddings],
)

result = collection.query(query_embeddings=[embeddings[0]["vector"]], n_results=3)
if not result["ids"] or result["ids"][0][0] != embeddings[0]["id"]:
    raise SystemExit("Chroma verification failed: self-retrieval did not return the source listing.")
print(f"Indexed and verified {collection.count()} listings in {PERSIST_DIR}")

query_model = SentenceTransformer("intfloat/multilingual-e5-small")
for label, query in [
    ("student", "query: sinh viên cần phòng yên tĩnh gần trường đại học"),
    ("working professional", "query: người đi làm cần căn hộ thuận tiện đi làm"),
    ("family", "query: gia đình cần nhà rộng, an toàn, gần trường học"),
]:
    query_vector = query_model.encode([query], normalize_embeddings=True)[0].tolist()
    matches = collection.query(query_embeddings=[query_vector], n_results=3)["ids"][0]
    print(f"{label}: {', '.join(matches)}")
