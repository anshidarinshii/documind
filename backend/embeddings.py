import requests
import os

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key={GEMINI_API_KEY}"

def get_embedding(text: str) -> list[float]:
    response = requests.post(URL, json={
        "content": {"parts": [{"text": text}]}
    })
    data = response.json()
    if "embedding" not in data:
        raise Exception(f"Gemini API error: {data}")  # surfaces the real error instead of a vague KeyError
    return data["embedding"]["values"]

def get_embeddings_batch(texts: list[str]) -> list[list[float]]:
    return [get_embedding(t) for t in texts]