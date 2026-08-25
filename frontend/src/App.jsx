import { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [docId, setDocId] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleCopyAnswer = () => {
    if (answer?.answer) {
      navigator.clipboard.writeText(answer.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const syntheticEvent = {
        target: {
          files: e.dataTransfer.files
        }
      };
      handleUpload(syntheticEvent);
    }
  };

  return (
    <div className="app-container">
      {/* Ambient background lighting */}
      <div className="ambient-glow-top" />

      {/* Top Navigation Bar */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-icon-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </div>
          <div className="brand-text-group">
            <span className="brand-name">DocuMind</span>
            <span className="brand-tagline">AI Document Assistant</span>
          </div>
        </div>

        <div className="header-actions">
          {docId ? (
            <>
              <div className="status-badge active">
                <span className="pulsing-indicator" />
                <span>Document Ready</span>
              </div>
              <button
                className="header-btn"
                onClick={() => {
                  setDocId(null);
                  setAnswer(null);
                  setQuestion('');
                }}
                title="Upload a new document"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>New Document</span>
              </button>
            </>
          ) : (
            <div className="status-badge idle">
              <span className="idle-dot" />
              <span>No Document Selected</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="app-main">
        {!docId ? (
          /* ==========================================================================
             State 1: Simple & Clean Document Upload
             ========================================================================== */
          <div className="upload-flow-wrapper">
            <div className="hero-banner">
              <div className="hero-pill-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                <span>Smart Document Reader</span>
              </div>
              <h1 className="hero-heading">
                Ask Questions <span className="hero-heading-gradient">From Your Documents</span>
              </h1>
              <p className="hero-subtext">
                Upload any PDF file to get instant summaries, discover insights, and find specific information with referenced proof from the text.
              </p>
            </div>

            {/* 3-Step Simple Progress Tracker */}
            <div className="steps-tracker">
              <div className="step-chip active">
                <span className="step-num">1</span>
                <span>Upload PDF</span>
              </div>
              <div className="step-divider" />
              <div className="step-chip">
                <span className="step-num">2</span>
                <span>Analyze</span>
              </div>
              <div className="step-divider" />
              <div className="step-chip">
                <span className="step-num">3</span>
                <span>Ask Anything</span>
              </div>
            </div>

            {/* Interactive Upload Dropzone */}
            <div className="upload-card-wrapper">
              <label
                htmlFor="pdf-file-upload"
                className={`upload-drop-surface ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
              >
                <div className="upload-icon-orb">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <h3 className="upload-headline">
                  <span>Click to browse</span> or drop your PDF here
                </h3>
                <p className="upload-description">
                  Your document will be prepared and ready for questions instantly
                </p>
                <div className="upload-badges-row">
                  <span className="format-pill">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    </svg>
                    PDF Document
                  </span>
                  <span className="format-pill">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    Instant Setup
                  </span>
                  <span className="format-pill">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Source Citations
                  </span>
                </div>
                <input
                  id="pdf-file-upload"
                  className="hidden-file-input"
                  type="file"
                  onChange={handleUpload}
                  accept=".pdf"
                />
              </label>
            </div>

            {/* User-Friendly Feature Cards */}
            <div className="highlights-grid">
              <div className="highlight-card">
                <div className="highlight-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <h4>Accurate Answers</h4>
                <p>Every answer is strictly based on the text inside your uploaded document.</p>
              </div>

              <div className="highlight-card">
                <div className="highlight-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <h4>Smart Understanding</h4>
                <p>Finds relevant details even when your question uses different words.</p>
              </div>

              <div className="highlight-card">
                <div className="highlight-icon-box">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
                <h4>Verifiable Sources</h4>
                <p>View the exact passages from your document used to answer your question.</p>
              </div>
            </div>
          </div>
        ) : (
          /* ==========================================================================
             State 2: Clean Q&A Workspace
             ========================================================================== */
          <div className="workspace-container">
            {/* Top Workspace Ribbon */}
            <div className="doc-workspace-toolbar">
              <div className="doc-info-block">
                <div className="doc-badge-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div className="doc-meta-content">
                  <h3>Document Uploaded & Ready</h3>
                  <span className="doc-id-pill">Active Document</span>
                </div>
              </div>

              <div className="toolbar-actions">
                <button
                  className="header-btn"
                  onClick={() => {
                    setAnswer(null);
                    setQuestion('');
                  }}
                  title="Clear conversation"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  <span>Clear Chat</span>
                </button>

                <label htmlFor="change-pdf-file" className="upload-replacement-btn" title="Upload a different document">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>Upload Another File</span>
                  <input
                    id="change-pdf-file"
                    className="hidden-file-input"
                    type="file"
                    onChange={handleUpload}
                    accept=".pdf"
                  />
                </label>
              </div>
            </div>

            {/* Conversation Feed */}
            <div className="conversation-feed">
              {!answer && !loading ? (
                /* Empty State with Everyday Language Starters */
                <div className="empty-feed-card">
                  <div className="empty-spark-icon">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </div>
                  <h3 className="empty-feed-title">What would you like to know?</h3>
                  <p className="empty-feed-subtitle">
                    Type any question in the box below, or pick a suggested topic to get started:
                  </p>

                  <div className="prompt-suggestions-grid">
                    <button
                      className="prompt-card-btn"
                      onClick={() => setQuestion('Provide a complete summary and the main points of this document.')}
                    >
                      <div className="prompt-btn-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="4" y1="6" x2="20" y2="6" />
                          <line x1="4" y1="12" x2="14" y2="12" />
                          <line x1="4" y1="18" x2="18" y2="18" />
                        </svg>
                      </div>
                      <div className="prompt-card-content">
                        <span className="prompt-title">Executive Summary</span>
                        <span className="prompt-body">Summarize the main purpose and key conclusions.</span>
                      </div>
                    </button>

                    <button
                      className="prompt-card-btn"
                      onClick={() => setQuestion('What are the most important conclusions and recommendations?')}
                    >
                      <div className="prompt-btn-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 11 12 14 22 4" />
                          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                        </svg>
                      </div>
                      <div className="prompt-card-content">
                        <span className="prompt-title">Key Takeaways</span>
                        <span className="prompt-body">List the top insights and recommended actions.</span>
                      </div>
                    </button>

                    <button
                      className="prompt-card-btn"
                      onClick={() => setQuestion('List all important numbers, statistics, dates, and facts mentioned.')}
                    >
                      <div className="prompt-btn-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="2" y="3" width="20" height="14" rx="2" />
                          <line x1="8" y1="21" x2="16" y2="21" />
                          <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                      </div>
                      <div className="prompt-card-content">
                        <span className="prompt-title">Facts & Figures</span>
                        <span className="prompt-body">Extract specific numbers, percentages, and dates.</span>
                      </div>
                    </button>

                    <button
                      className="prompt-card-btn"
                      onClick={() => setQuestion('What are the main warnings, challenges, or limitations mentioned?')}
                    >
                      <div className="prompt-btn-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                          <line x1="12" y1="9" x2="12" y2="13" />
                          <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                      </div>
                      <div className="prompt-card-content">
                        <span className="prompt-title">Important Highlights</span>
                        <span className="prompt-body">Point out challenges and notable points to watch.</span>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* User Query Bubble */}
                  {question && (
                    <div className="chat-bubble-card user-bubble">
                      <div className="user-avatar-ring">You</div>
                      <div className="bubble-main">
                        <div className="bubble-header">
                          <span className="bubble-sender">Your Question</span>
                          <span className="bubble-tag">Document Question</span>
                        </div>
                        <p className="user-question-content">{question}</p>
                      </div>
                    </div>
                  )}

                  {/* DocuMind AI Response Bubble */}
                  {(loading || answer) && (
                    <div className="chat-bubble-card assistant-bubble">
                      <div className="ai-avatar-ring">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                      </div>
                      <div className="bubble-main">
                        <div className="bubble-header">
                          <div className="ai-header-badges">
                            <span className="bubble-sender">DocuMind Assistant</span>
                            <span className="grounded-pill">Verified Answer</span>
                          </div>
                          {answer && !loading && (
                            <button
                              className="copy-answer-btn"
                              onClick={handleCopyAnswer}
                              title="Copy answer to clipboard"
                            >
                              {copied ? (
                                <>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                  <span>Copied!</span>
                                </>
                              ) : (
                                <>
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                  </svg>
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {loading ? (
                          /* Thinking State */
                          <div className="thinking-wrapper">
                            <div className="thinking-status-row">
                              <span>Reading document & generating answer</span>
                              <div className="wave-dots">
                                <span />
                                <span />
                                <span />
                              </div>
                            </div>
                            <div className="skeleton-shimmer-container">
                              <div className="skeleton-line full" />
                              <div className="skeleton-line three-fourths" />
                              <div className="skeleton-line half" />
                            </div>
                          </div>
                        ) : answer ? (
                          /* Rendered Answer & Clean Source References */
                          <>
                            <p className="assistant-answer-text">{answer.answer}</p>

                            {answer.sources && answer.sources.length > 0 && (
                              <div className="citations-section">
                                <details className="citations-accordion">
                                  <summary className="citations-summary-bar">
                                    <div className="citations-title-group">
                                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                                      </svg>
                                      <span>Sources from Document</span>
                                      <span className="citations-count-pill">
                                        {answer.sources.length} {answer.sources.length === 1 ? 'passage' : 'passages'}
                                      </span>
                                    </div>
                                    <svg className="accordion-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                  </summary>
                                  <div className="citations-content-box">
                                    {answer.sources.map((s, i) => (
                                      <div key={i} className="citation-card-item">
                                        <div className="citation-header-row">
                                          <span className="citation-index-badge">Source [{i + 1}]</span>
                                          <span className="citation-match-tag">From Document</span>
                                        </div>
                                        <p className="citation-quote-text">{s}</p>
                                      </div>
                                    ))}
                                  </div>
                                </details>
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

            {/* Bottom Sticky Question Bar */}
            <div className="prompt-bar-wrapper">
              <div className="prompt-bar-capsule">
                <div className="prompt-leading-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="prompt-input-field"
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
                <span className="kbd-shortcut-hint">↵ Enter</span>
                <button
                  className="submit-ask-btn"
                  onClick={handleAsk}
                  disabled={loading || !question.trim()}
                  title="Ask question"
                >
                  <span>Ask</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
              <p className="prompt-footer-caption">
                Answers are generated directly from the text of your uploaded document
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;