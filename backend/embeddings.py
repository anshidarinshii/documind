import requests
import os

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
URL = f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={GEMINI_API_KEY}"

def get_embedding(text: str) -> list[float]:
    response = requests.post(URL, json={
        "content": {"parts": [{"text": text}]}
    })
    return response.json()["embedding"]["values"]

def get_embeddings_batch(texts: list[str]) -> list[list[float]]:
    return [get_embedding(t) for t in texts]