from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uuid, os

from ingestion import extract_text_from_pdf, chunk_text
from embeddings import get_embedding, get_embeddings_batch
from vector_store import store_chunk, search_similar_chunks
from generation import generate_answer

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.post("/upload")
async def upload_document(file: UploadFile):
    doc_id = str(uuid.uuid4())
    temp_path = f"temp_{doc_id}.pdf"
    with open(temp_path, "wb") as f:
        f.write(await file.read())

    text = extract_text_from_pdf(temp_path)
    chunks = chunk_text(text)
    embeddings = get_embeddings_batch(chunks)

    for chunk, embedding in zip(chunks, embeddings):
        store_chunk(doc_id, chunk, embedding)

    os.remove(temp_path)
    return {"doc_id": doc_id, "num_chunks": len(chunks)}

@app.post("/ask")
async def ask_question(doc_id: str, question: str):
    query_embedding = get_embedding(question)
    relevant_chunks = search_similar_chunks(query_embedding, doc_id, top_k=3)
    answer = generate_answer(question, relevant_chunks)
    return {"answer": answer, "sources": relevant_chunks}