import { useRef, useState } from 'react';
import { Upload, Trash2, MessageSquare, Zap, FileText, Eye } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import { askGemini } from '../api/gemini.js';
import { extractText, formatSize, fileColor } from '../utils/fileParser.js';

const ACTIONS = [
  { id: 'summary',    label: 'Summary',    prompt: (t) => `Write a concise 3-5 sentence summary of this content:\n\n${t}` },
  { id: 'keypoints',  label: 'Key Points', prompt: (t) => `Extract 6-8 key learning points as a numbered list:\n\n${t}` },
  { id: 'definitions',label: 'Definitions',prompt: (t) => `Extract all important terms/definitions. Format: Term: Definition\n\n${t}` },
  { id: 'simplify',   label: 'Simplify',   prompt: (t) => `Explain this to a beginner using simple language and analogies:\n\n${t}` },
  { id: 'formulas',   label: 'Formulas',   prompt: (t) => `Extract all formulas, equations and technical expressions:\n\n${t}` },
  { id: 'notes',      label: 'Notes',      prompt: (t) => `Create structured study notes with headings and bullet points:\n\n${t}` },
  { id: 'mindmap',    label: 'Mind Map',   prompt: (t) => `Create a text-based mind map of the main topics and subtopics:\n\n${t}` },
  { id: 'questions',  label: 'Questions',  prompt: (t) => `Generate 8 thought-provoking study questions for this material:\n\n${t}` },
];

export default function UploadPage({ documents, setDocuments, setActiveDoc, setPage }) {
  const inputRef    = useRef();
  const [dragging,  setDragging]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [selected,  setSelected]  = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [result,    setResult]    = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  /* ── Process dropped / selected files ── */
  const handleFiles = async (files) => {
    setLoading(true);
    const newDocs = [];
    for (const file of files) {
      const { text, preview } = await extractText(file);
      newDocs.push({
        id:         Date.now() + Math.random(),
        name:       file.name,
        size:       formatSize(file.size),
        text,
        preview:    preview ?? null,
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }
    setDocuments((prev) => [...prev, ...newDocs]);
    setLoading(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles([...e.dataTransfer.files]);
  };

  /* ── Run AI analysis on selected doc ── */
  const runAction = async () => {
    if (!selected) return;
    setAnalyzing(true);
    setResult('');
    const action = ACTIONS.find((a) => a.id === activeTab);
    const snippet = selected.text.slice(0, 3500);
    const res = await askGemini(action.prompt(snippet), 'You are an expert academic tutor. Be clear and educational.');
    setResult(res);
    setAnalyzing(false);
  };

  const deleteDoc = (id) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (selected?.id === id) { setSelected(null); setResult(''); }
  };

  return (
    <div className="page fade-up">
      <TopBar title="Document Center" subtitle="Upload and AI-analyze your study materials" />
      <div className="mt-6">

        {/* Drop Zone */}
        <div
          className={`drop-zone${dragging ? ' over' : ''}`}
          onDrop={onDrop}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef} type="file" multiple
            accept=".pdf,.docx,.doc,.pptx,.txt,.md,.jpg,.jpeg,.png,.csv"
            style={{ display: 'none' }}
            onChange={(e) => handleFiles([...e.target.files])}
          />
          <Upload size={38} color="var(--accent)" style={{ marginBottom: 12 }} />
          <div className="font-semibold mb-1" style={{ fontSize: 15 }}>
            Drop files here or click to browse
          </div>
          <div className="text-sm text-muted">
            PDF · DOCX · PPTX · TXT · MD · CSV · JPG · PNG
          </div>
          {loading && (
            <div className="flex-center gap-2 mt-3" style={{ justifyContent: 'center', color: 'var(--accent)' }}>
              <div className="spinner" /> Processing files…
            </div>
          )}
        </div>

        {/* Files + Analysis panel */}
        {documents.length > 0 && (
          <div className="grid-2 mt-6">
            {/* File list */}
            <div>
              <h3 className="font-semibold mb-3" style={{ fontSize: 14 }}>
                Uploaded Files ({documents.length})
              </h3>
              <div className="flex-col gap-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`file-item${selected?.id === doc.id ? ' active' : ''}`}
                    onClick={() => { setSelected(doc); setResult(''); }}
                  >
                    <FileText size={14} style={{ color: fileColor(doc.name), flexShrink: 0 }} />
                    {doc.preview && (
                      <img src={doc.preview} alt="" className="img-preview"
                        style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4 }} />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="text-sm font-medium truncate">{doc.name}</div>
                      <div className="text-xs text-muted">{doc.size} · {doc.uploadedAt}</div>
                    </div>
                    <div className="flex-center gap-1">
                      <button className="btn btn-ghost btn-icon" title="Chat about this"
                        onClick={(e) => { e.stopPropagation(); setActiveDoc(doc); setPage('chat'); }}>
                        <MessageSquare size={13} />
                      </button>
                      <button className="btn btn-ghost btn-icon" title="Delete"
                        onClick={(e) => { e.stopPropagation(); deleteDoc(doc.id); }}>
                        <Trash2 size={13} color="var(--red)" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis panel */}
            {selected ? (
              <div>
                <h3 className="font-semibold mb-3" style={{ fontSize: 14 }}>
                  AI Analysis — <span className="grad-text">{selected.name}</span>
                </h3>

                {/* Action tabs */}
                <div className="flex-center gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
                  {ACTIONS.map((a) => (
                    <button
                      key={a.id}
                      className={`tab${activeTab === a.id ? ' active' : ''}`}
                      style={{ padding: '5px 11px', fontSize: 12 }}
                      onClick={() => setActiveTab(a.id)}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>

                <button className="btn btn-primary mb-3" onClick={runAction} disabled={analyzing}>
                  {analyzing ? <><div className="spinner" /> Analyzing…</> : <><Zap size={13} /> Run Analysis</>}
                </button>

                {result && (
                  <div className="card card-accent fade-up">
                    <div className="flex-center gap-2 mb-3 text-xs text-accent font-semibold">
                      <Zap size={12} /> AI Result
                    </div>
                    <div style={{ fontSize: 13.5, lineHeight: 1.78, whiteSpace: 'pre-wrap', color: 'var(--text)' }}>
                      {result}
                    </div>
                    <div className="flex-center gap-2 mt-3">
                      <button className="btn btn-secondary btn-sm"
                        onClick={() => navigator.clipboard?.writeText(result)}>
                        Copy
                      </button>
                      <button className="btn btn-secondary btn-sm"
                        onClick={() => { setActiveDoc(selected); setPage('chat'); }}>
                        <MessageSquare size={11} /> Chat About This
                      </button>
                    </div>
                  </div>
                )}

                {/* Text preview */}
                {!result && !analyzing && (
                  <div className="card" style={{ maxHeight: 200, overflowY: 'auto' }}>
                    <div className="flex-center gap-2 mb-2 text-xs text-muted font-semibold">
                      <Eye size={12} /> Extracted Text Preview
                    </div>
                    <pre style={{ fontSize: 12, color: 'var(--text2)', whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>
                      {selected.text.slice(0, 600)}{selected.text.length > 600 ? '…' : ''}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>
                <div style={{ textAlign: 'center' }}>
                  <FileText size={40} style={{ opacity: 0.2, marginBottom: 10 }} />
                  <div className="text-sm">Select a file to run AI analysis</div>
                </div>
              </div>
            )}
          </div>
        )}

        {documents.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text2)' }}>
            <FileText size={44} style={{ opacity: 0.18, marginBottom: 12 }} />
            <div className="text-sm">No documents yet — upload your first study material above!</div>
          </div>
        )}
      </div>
    </div>
  );
}
