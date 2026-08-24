import requests
import os

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

def generate_answer(question: str, relevant_chunks: list[str]) -> str:
    context = "\n\n".join([f"[Source {i+1}]: {chunk}" for i, chunk in enumerate(relevant_chunks)])

    prompt = f"""Answer the question using ONLY the sources below. 
If the answer is not in the sources, say "I don't have enough information to answer that."
Cite which source number(s) you used.

Sources:
{context}

Question: {question}

Answer:"""

    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
        json={
            "model": "llama-3.1-8b-instant",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2   # low temperature = more factual, less creative
        }
    )
    return response.json()["choices"][0]["message"]["content"]
    