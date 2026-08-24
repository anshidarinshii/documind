from pymongo import MongoClient
import numpy as np
import os

client = MongoClient(os.getenv("MONGO_URI"))
db = client["documind"]
collection = db["chunks"]

def store_chunk(doc_id: str, chunk_text: str, embedding: list[float]):
    collection.insert_one({
        "doc_id": doc_id,
        "text": chunk_text,
        "embedding": embedding
    })

def cosine_similarity(vec_a: list[float], vec_b: list[float]) -> float:
    a, b = np.array(vec_a), np.array(vec_b)
    dot_product = np.dot(a, b)
    magnitude_a = np.linalg.norm(a)
    magnitude_b = np.linalg.norm(b)
    return dot_product / (magnitude_a * magnitude_b)

def search_similar_chunks(query_embedding: list[float], doc_id: str, top_k: int = 3):
    all_chunks = collection.find({"doc_id": doc_id})
    scored = []
    for chunk in all_chunks:
        score = cosine_similarity(query_embedding, chunk["embedding"])
        scored.append((score, chunk["text"]))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [text for score, text in scored[:top_k]]