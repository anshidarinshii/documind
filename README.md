# DocuMind

DocuMind is a Retrieval-Augmented Generation (RAG) document Q&A app. A user uploads a PDF, the
backend extracts and chunks its text, embeds each chunk, and stores the embeddings in MongoDB.
When the user asks a question, the app embeds the question, retrieves the most relevant chunks
by similarity search, and passes only that context to an LLM, which answers the question and
cites which chunks it used (or says it doesn't have enough information, rather than guessing).

## Architecture

The backend pipeline runs in six stages:

```
 PDF Upload
     |
     v
 1. Ingest    -- extract raw text from the PDF (pypdf)                [ingestion.py]
     |
     v
 2. Chunk     -- split text into overlapping word-window chunks       [ingestion.py]
     |
     v
 3. Embed     -- embed each chunk via the Gemini embeddings API       [embeddings.py]
     |
     v
 4. Store     -- persist {doc_id, text, embedding} per chunk          [vector_store.py]
     |                                                          \
     v                                                           v
 5. Retrieve  -- embed the question, cosine-similarity search    SQL metadata layer
     over the doc's stored chunks, take the top-k               [metadata.py]
     |                                                      (documents + queries tables,
     v                                                       written to on /upload and /ask)
 6. Generate  -- send the question + retrieved chunks to the
     Groq LLM, constrained to answer only from that context    [generation.py]
```

Two datastores back the pipeline, each doing a different job:

- **MongoDB** (`vector_store.py`) holds the actual chunk text and embedding vectors — the data
  the retrieval step searches over.
- **SQLite** (`metadata.py`) holds structured, relational pipeline metadata: one row per
  uploaded document (`doc_id`, filename, upload time, chunk count, ingestion status) and one row
  per question asked (`doc_id`, question, timestamp, number of source chunks used). This is
  intentionally separate from the vector store — it's for auditing/observability of the
  pipeline itself (what was ingested, when, how many questions were asked against which
  document), not for retrieval.

`main.py` (FastAPI) wires the two datastores together: `/upload` runs stages 1-4 and records a
`documents` row (with `status` set to `"success"` or `"failed"`), and `/ask` runs stages 5-6 and
records a `queries` row.

The frontend (`frontend/`, React + Vite) is a single-page app that uploads a PDF, then presents
a chat-style interface for asking questions and viewing cited source passages.

## Tech stack

| Layer                | Technology                                   |
|-----------------------|----------------------------------------------|
| API                   | Python, FastAPI                              |
| PDF text extraction   | pypdf                                        |
| Embeddings            | Google Gemini (`gemini-embedding-001`)       |
| Vector storage        | MongoDB                                      |
| Pipeline metadata     | SQLite (stdlib `sqlite3`)                    |
| Answer generation     | Groq (`openai/gpt-oss-20b`)                  |
| Frontend              | React 19, Vite, axios                        |

## Setup

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows; use `source venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
```

Copy `backend/.env.example` to `backend/.env` and fill in real values:

```bash
cp .env.example .env
```

| Variable         | Used by            | Purpose                                      |
|------------------|---------------------|-----------------------------------------------|
| `GEMINI_API_KEY` | `embeddings.py`     | Generates chunk and query embeddings          |
| `GROQ_API_KEY`   | `generation.py`     | Generates the final answer from retrieved text|
| `MONGO_URI`      | `vector_store.py`   | Connection string for the chunk/vector store  |

Run the API:

```bash
uvicorn main:app --reload
```

The API is served at `http://localhost:8000`; interactive docs at `http://localhost:8000/docs`.
The SQLite metadata database (`backend/metadata.db`) is created automatically on first run.

Run tests:

```bash
pytest
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

By default the frontend calls `http://localhost:8000`. To point at a different backend, set
`VITE_API_URL` (e.g. in a `frontend/.env` file):

```
VITE_API_URL=https://your-deployed-backend.example.com
```

## Known limitations

- **Similarity search is brute-force, not indexed.** `search_similar_chunks` loads every stored
  chunk for a document and scores it against the query embedding with cosine similarity in
  Python. This is fine for small documents and demo purposes, but doesn't scale — it's an O(n)
  scan per question. Next step: move to an indexed vector search, such as MongoDB Atlas Vector
  Search, or a dedicated vector index (FAISS, pgvector) once document/chunk volume grows.
- Chunking is a fixed-size word-count window with overlap, not a semantic or token-aware split.
- There's no per-user auth or document-access scoping — any `doc_id` can be queried by anyone
  who has it.
