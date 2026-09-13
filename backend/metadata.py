import sqlite3
import os
from datetime import datetime, timezone

DB_PATH = os.path.join(os.path.dirname(__file__), "metadata.db")


def get_connection() -> sqlite3.Connection:
    return sqlite3.connect(DB_PATH)


def init_db() -> None:
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS documents (
                doc_id TEXT PRIMARY KEY,
                filename TEXT,
                upload_time TEXT NOT NULL,
                num_chunks INTEGER NOT NULL,
                status TEXT NOT NULL
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS queries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                doc_id TEXT NOT NULL,
                question TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                num_sources INTEGER NOT NULL,
                FOREIGN KEY (doc_id) REFERENCES documents (doc_id)
            )
        """)


def record_document(doc_id: str, filename: str, num_chunks: int, status: str) -> None:
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO documents (doc_id, filename, upload_time, num_chunks, status) "
            "VALUES (?, ?, ?, ?, ?)",
            (doc_id, filename, datetime.now(timezone.utc).isoformat(), num_chunks, status),
        )


def record_query(doc_id: str, question: str, num_sources: int) -> None:
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO queries (doc_id, question, timestamp, num_sources) "
            "VALUES (?, ?, ?, ?)",
            (doc_id, question, datetime.now(timezone.utc).isoformat(), num_sources),
        )


init_db()
