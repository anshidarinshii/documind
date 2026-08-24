from ingestion import chunk_text

def test_chunk_text_basic():
    text = "word " * 100  # 100 words
    chunks = chunk_text(text, chunk_size=20, overlap=5)
    assert len(chunks) > 1
    assert all(len(c.split()) <= 20 for c in chunks)

def test_chunk_overlap():
    text = "one two three four five six seven eight nine ten"
    chunks = chunk_text(text, chunk_size=4, overlap=2)
    # last 2 words of chunk 1 should reappear as first 2 words of chunk 2
    chunk1_end = chunks[0].split()[-2:]
    chunk2_start = chunks[1].split()[:2]
    assert chunk1_end == chunk2_start