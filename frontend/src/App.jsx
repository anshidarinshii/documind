import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [docId, setDocId] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e) => {
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    const res = await axios.post(`${API_URL}/upload`, formData);
    setDocId(res.data.doc_id);
  };

  const handleAsk = async () => {
    setLoading(true);
    const res = await axios.post(`${API_URL}/ask`, null, {
      params: { doc_id: docId, question }
    });
    setAnswer(res.data);
    setLoading(false);
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} accept=".pdf" />
      {docId && (
        <>
          <input value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask a question..." />
          <button onClick={handleAsk}>Ask</button>
        </>
      )}
      {loading && <p>Thinking...</p>}
      {answer && (
        <div>
          <p>{answer.answer}</p>
          <details>
            <summary>Sources used</summary>
            {answer.sources.map((s, i) => <p key={i}>[{i+1}] {s}</p>)}
          </details>
        </div>
      )}
    </div>
  );
}

export default App;