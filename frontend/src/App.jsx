import { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// The model sometimes emits literal "<br>" tags inside table cells (a common
// GFM convention for line breaks within a cell). ReactMarkdown never renders
// raw HTML, so we convert those to real Markdown hard-breaks before parsing
// -- a plain string substitution, not an HTML pass-through.
const toMarkdownBreaks = (text) => text.replace(/<br\s*\/?>/gi, '  \n');

const STARTER_PROMPTS = [
  {
    title: 'Executive summary',
    body: 'Summarize the main purpose and key conclusions.',
    prompt: 'Provide a complete summary and the main points of this document.',
  },
  {
    title: 'Key takeaways',
    body: 'List the top insights and recommended actions.',
    prompt: 'What are the most important conclusions and recommendations?',
  },
  {
    title: 'Facts & figures',
    body: 'Extract specific numbers, percentages, and dates.',
    prompt: 'List all important numbers, statistics, dates, and facts mentioned.',
  },
  {
    title: 'Watch-outs',
    body: 'Surface challenges and notable limitations.',
    prompt: 'What are the main warnings, challenges, or limitations mentioned?',
  },
];

function App() {
  const [docId, setDocId] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [question, setQuestion] = useState('');
  const [submittedQuestion, setSubmittedQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [askError, setAskError] = useState(null);
  const [openSources, setOpenSources] = useState(() => new Set());
  const [copied, setCopied] = useState(false);

  const resetConversation = () => {
    setAnswer(null);
    setQuestion('');
    setSubmittedQuestion('');
    setAskError(null);
    setOpenSources(new Set());
  };

  const handleUpload = async (fileList) => {
    const file = fileList && fileList[0];
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API_URL}/upload`, formData);
      setDocId(res.data.doc_id);
      setFileName(file.name);
      resetConversation();
    } catch {
      setUploadError("We couldn't read that file. Make sure it's a valid PDF and try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleAsk = async () => {
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setAskError(null);
    setSubmittedQuestion(trimmed);
    setOpenSources(new Set());
    try {
      const res = await axios.post(`${API_URL}/ask`, null, {
        params: { doc_id: docId, question: trimmed },
      });
      setAnswer(res.data);
      setQuestion('');
    } catch {
      setAskError("Something went wrong answering that one. Please try again.");
      setAnswer(null);
    } finally {
      setLoading(false);
    }
  };

  const toggleSource = (index) => {
    setOpenSources((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleCopyAnswer = () => {
    if (!answer?.answer) return;
    navigator.clipboard.writeText(answer.answer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const startOver = () => {
    setDocId(null);
    setFileName('');
    setUploadError(null);
    resetConversation();
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
            </svg>
          </span>
          <div className="brand-copy">
            <span className="brand-name">DocuMind</span>
            <span className="brand-tagline">Document Intelligence</span>
          </div>
        </div>

        <div className="header-status">
          {docId ? (
            <>
              <span className="status-pill is-active">
                <span className="status-dot" />
                <span className="status-pill-label">{fileName || 'Document ready'}</span>
              </span>
              <button className="ghost-btn" onClick={startOver}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                New document
              </button>
            </>
          ) : (
            <span className="status-pill">No document yet</span>
          )}
        </div>
      </header>

      <main className="stage">
        {!docId ? (
          <section className="upload-scene" key="upload">
            <p className="scene-kicker">Document Intelligence, distilled</p>
            <h1 className="scene-heading">
              Ask your documents<br />anything.
            </h1>
            <p className="scene-lede">
              Upload a PDF and get answers drawn strictly from its text — every
              claim traced back to the exact passage that supports it.
            </p>

            <ol className="progress-trail" aria-hidden="true">
              <li className="is-current"><span>01</span> Upload</li>
              <li><span>02</span> Analyze</li>
              <li><span>03</span> Ask</li>
            </ol>

            {uploadError && (
              <div className="error-banner" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <line x1="12" y1="8" x2="12" y2="13" />
                  <line x1="12" y1="16.5" x2="12.01" y2="16.5" />
                </svg>
                <span>{uploadError}</span>
                <button className="error-dismiss" onClick={() => setUploadError(null)} aria-label="Dismiss">×</button>
              </div>
            )}

            <label
              htmlFor="pdf-file-upload"
              className={`dropzone ${isDragOver ? 'is-dragover' : ''} ${uploading ? 'is-busy' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
            >
              {uploading ? (
                <div className="dropzone-busy">
                  <span className="ink-bloom" aria-hidden="true">
                    <span /><span /><span />
                  </span>
                  <p className="dropzone-busy-label">Reading your document&hellip;</p>
                </div>
              ) : (
                <>
                  <span className="dropzone-icon">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </span>
                  <p className="dropzone-title"><span>Click to browse</span> or drop a PDF here</p>
                  <p className="dropzone-hint">Your document is prepared for questions in seconds</p>
                </>
              )}
              <input
                id="pdf-file-upload"
                className="visually-hidden-input"
                type="file"
                accept=".pdf"
                disabled={uploading}
                onChange={(e) => handleUpload(e.target.files)}
              />
            </label>

            <ol className="footnote-grid">
              <li>
                <span className="footnote-index">01</span>
                <h3>Grounded answers</h3>
                <p>Every answer is drawn strictly from the text inside your document.</p>
              </li>
              <li>
                <span className="footnote-index">02</span>
                <h3>Semantic search</h3>
                <p>Finds the relevant passage even when your question uses different words.</p>
              </li>
              <li>
                <span className="footnote-index">03</span>
                <h3>Cited sources</h3>
                <p>Trace every claim back to the exact passage that supports it.</p>
              </li>
            </ol>
          </section>
        ) : (
          <section className="chat-scene" key="chat">
            <div className="chat-toolbar">
              <div className="chat-toolbar-doc">
                <span className="doc-glyph" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </span>
                <span className="chat-toolbar-filename">{fileName || 'Your document'}</span>
              </div>
              <div className="chat-toolbar-actions">
                <button className="ghost-btn" onClick={resetConversation} title="Clear conversation">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Clear
                </button>
                <label htmlFor="change-pdf-file" className="ghost-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Replace
                  <input
                    id="change-pdf-file"
                    className="visually-hidden-input"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleUpload(e.target.files)}
                  />
                </label>
              </div>
            </div>

            <div className="conversation-feed">
              {!answer && !loading && !askError ? (
                <div className="feed-empty">
                  <p className="feed-empty-mark" aria-hidden="true">&para;</p>
                  <h2>What would you like to know?</h2>
                  <p className="feed-empty-sub">Ask a question below, or start with one of these:</p>
                  <div className="starter-grid">
                    {STARTER_PROMPTS.map((item) => (
                      <button key={item.title} className="starter-card" onClick={() => setQuestion(item.prompt)}>
                        <span className="starter-title">{item.title}</span>
                        <span className="starter-body">{item.body}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {submittedQuestion && (
                    <div className="bubble bubble-user">
                      <p>{submittedQuestion}</p>
                    </div>
                  )}

                  {(loading || answer || askError) && (
                    <div className="bubble bubble-assistant">
                      <span className={`assistant-mark ${loading ? 'is-thinking' : ''}`} aria-hidden="true">&para;</span>
                      <div className="bubble-assistant-body">
                        <div className="bubble-assistant-header">
                          <span className="bubble-assistant-name">DocuMind</span>
                          {answer && !loading && <span className="grounded-tag">Grounded</span>}
                          {answer && !loading && (
                            <button className="copy-btn" onClick={handleCopyAnswer}>
                              {copied ? 'Copied' : 'Copy'}
                            </button>
                          )}
                        </div>

                        {loading ? (
                          <div className="thinking-state">
                            <p>Reading the relevant passages&hellip;</p>
                            <span className="thinking-dots" aria-hidden="true"><span /><span /><span /></span>
                          </div>
                        ) : askError ? (
                          <p className="inline-error">{askError}</p>
                        ) : answer ? (
                          <>
                            <div className="answer-text">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {toMarkdownBreaks(answer.answer)}
                              </ReactMarkdown>
                            </div>

                            {answer.sources && answer.sources.length > 0 && (
                              <div className="citations">
                                <div className="citation-chip-row">
                                  <span className="citation-label">Sources</span>
                                  {answer.sources.map((_, i) => (
                                    <button
                                      key={i}
                                      className={`citation-chip ${openSources.has(i) ? 'is-open' : ''}`}
                                      onClick={() => toggleSource(i)}
                                      aria-expanded={openSources.has(i)}
                                    >
                                      {i + 1}
                                    </button>
                                  ))}
                                </div>
                                <div className="citation-panels">
                                  {answer.sources.map((source, i) => (
                                    <div key={i} className={`citation-panel ${openSources.has(i) ? 'is-open' : ''}`}>
                                      <div className="citation-panel-inner">
                                        <blockquote>
                                          <span className="citation-panel-index">Source {i + 1}</span>
                                          {source}
                                        </blockquote>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : null}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="composer">
              <div className="composer-bar">
                <input
                  type="text"
                  className="composer-input"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !loading && question.trim()) {
                      e.preventDefault();
                      handleAsk();
                    }
                  }}
                  placeholder="Ask a question about this document..."
                  disabled={loading}
                />
                <button
                  className="composer-send"
                  onClick={handleAsk}
                  disabled={loading || !question.trim()}
                >
                  Ask
                </button>
              </div>
              <p className="composer-caption">Answers are generated directly from your document's text</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
