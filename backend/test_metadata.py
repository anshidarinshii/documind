import metadata


def test_record_document_and_query(tmp_path, monkeypatch):
    monkeypatch.setattr(metadata, "DB_PATH", str(tmp_path / "test_metadata.db"))
    metadata.init_db()

    metadata.record_document("doc-1", "sample.pdf", 5, "success")
    metadata.record_query("doc-1", "What is this about?", 3)

    with metadata.get_connection() as conn:
        doc_row = conn.execute(
            "SELECT doc_id, filename, num_chunks, status FROM documents WHERE doc_id = ?",
            ("doc-1",),
        ).fetchone()
        query_row = conn.execute(
            "SELECT doc_id, question, num_sources FROM queries WHERE doc_id = ?",
            ("doc-1",),
        ).fetchone()

    assert doc_row == ("doc-1", "sample.pdf", 5, "success")
    assert query_row == ("doc-1", "What is this about?", 3)


def test_record_document_failed_status(tmp_path, monkeypatch):
    monkeypatch.setattr(metadata, "DB_PATH", str(tmp_path / "test_metadata_2.db"))
    metadata.init_db()

    metadata.record_document("doc-2", "broken.pdf", 0, "failed")

    with metadata.get_connection() as conn:
        status = conn.execute(
            "SELECT status FROM documents WHERE doc_id = ?", ("doc-2",)
        ).fetchone()[0]

    assert status == "failed"
