import { useState } from 'react';
import { Zap, Star, RotateCcw, Shuffle } from 'lucide-react';
import TopBar from '../components/TopBar.jsx';
import { askGeminiJSON } from '../api/gemini.js';

const SYSTEM = 'You are a flashcard generator. Return ONLY a valid JSON array — no markdown, no explanation.';

export default function FlashcardsPage({ documents, flashcardData, setFlashcardData }) {
  const [topic,    setTopic]    = useState('');
  const [docId,    setDocId]    = useState('');
  const [count,    setCount]    = useState(8);
  const [loading,  setLoading]  = useState(false);

  const [current,  setCurrent]  = useState(0);
  const [flipped,  setFlipped]  = useState(false);
  const [mode,     setMode]     = useState('all');   // 'all' | 'favorites'
  const [favs,     setFavs]     = useState(new Set());

  /* ── Generate flashcards ── */
  const generate = async () => {
    const src = documents.find((d) => String(d.id) === docId);
    const context = src
      ? `Based on this document:\n${src.text.slice(0, 2500)}`
      : `Topic: ${topic || 'General Knowledge'}`;

    const prompt = `${context}

Create exactly ${count} flashcards. Return a JSON array ONLY:
[
  {
    "front": "Question, term, or concept (one side of the card)",
    "back": "Answer, definition, or explanation (other side)"
  }
]

Rules:
- front should be concise (a term, question, or short phrase)
- back should be a clear, complete answer or definition
- Cover the most important concepts from the material
- Return ONLY the JSON array, nothing else.`;

    setLoading(true);
    setFlashcardData([]);
    setCurrent(0);
    setFlipped(false);
    setFavs(new Set());

    const raw = await askGeminiJSON(prompt, SYSTEM);
    try {
      const match = raw.match(/\[[\s\S]*\]/);
      const cards = JSON.parse(match ? match[0] : raw);
      setFlashcardData(cards);
    } catch {
      setFlashcardData([
        { front: '⚠️ Parse error', back: `Try again. Raw: ${raw.slice(0, 150)}` },
      ]);
    }
    setLoading(false);
  };

  /* ── Helpers ── */
  const displayCards = mode === 'favorites'
    ? flashcardData.filter((_, i) => favs.has(i))
    : flashcardData;

  const next     = () => { setCurrent((p) => (p + 1) % displayCards.length); setFlipped(false); };
  const prev     = () => { setCurrent((p) => (p - 1 + displayCards.length) % displayCards.length); setFlipped(false); };
  const toggleFav = (i) => setFavs((p) => { const s = new Set(p); s.has(i) ? s.delete(i) : s.add(i); return s; });

  const shuffle = () => {
    setFlashcardData((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrent(0); setFlipped(false);
  };

  // Map display index back to original index for favourites
  const origIdx = (dispIdx) => {
    if (mode === 'all') return dispIdx;
    return flashcardData.findIndex((c) => c === displayCards[dispIdx]);
  };

  return (
    <div className="page fade-up">
      <TopBar title="Flashcards" subtitle="AI-generated flip cards with spaced repetition" />
      <div className="mt-6">

        {/* Config */}
        <div className="card mb-6">
          <div className="flex-center gap-3" style={{ flexWrap: 'wrap', alignItems: 'flex-end' }}>
            {documents.length > 0 && (
              <div style={{ flex: 1, minWidth: 170 }}>
                <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 4 }}>From Document</label>
                <select className="select" value={docId}
                  onChange={(e) => { setDocId(e.target.value); if (e.target.value) setTopic(''); }}>
                  <option value="">Enter topic below</option>
                  {documents.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            )}
            {!docId && (
              <div style={{ flex: 2, minWidth: 200 }}>
                <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 4 }}>Topic</label>
                <input className="input" placeholder="e.g. The French Revolution, Calculus, React Hooks…"
                  value={topic} onChange={(e) => setTopic(e.target.value)} />
              </div>
            )}
            <div>
              <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 4 }}>Cards</label>
              <select className="select" style={{ width: 110 }} value={count} onChange={(e) => setCount(+e.target.value)}>
                {[5, 8, 10, 15, 20].map((n) => <option key={n} value={n}>{n} cards</option>)}
              </select>
            </div>
            <button className="btn btn-primary" onClick={generate} disabled={loading || (!topic && !docId)}>
              {loading ? <><div className="spinner" /> Generating…</> : <><Zap size={13} /> Generate</>}
            </button>
          </div>
        </div>

        {/* Flashcard UI */}
        {flashcardData.length > 0 && (
          <>
            {/* Controls row */}
            <div className="flex-between mb-4">
              <div className="tabs">
                <button className={`tab${mode === 'all' ? ' active' : ''}`}
                  onClick={() => { setMode('all'); setCurrent(0); setFlipped(false); }}>
                  All ({flashcardData.length})
                </button>
                <button className={`tab${mode === 'favorites' ? ' active' : ''}`}
                  onClick={() => { setMode('favorites'); setCurrent(0); setFlipped(false); }}>
                  ★ Favorites ({favs.size})
                </button>
              </div>
              <div className="flex-center gap-2">
                <button className="btn btn-secondary btn-sm" onClick={shuffle} title="Shuffle cards">
                  <Shuffle size={12} /> Shuffle
                </button>
                <span className="text-xs text-muted">
                  {current + 1} / {displayCards.length} · click card to flip
                </span>
              </div>
            </div>

            {displayCards.length > 0 ? (
              <>
                {/* Flip card */}
                <div className="fc-scene" onClick={() => setFlipped((p) => !p)} style={{ marginBottom: 18 }}>
                  <div className={`fc-inner${flipped ? ' flipped' : ''}`}>
                    {/* Front */}
                    <div className="fc-face">
                      <div className="text-xs text-muted mb-3" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Question / Term
                      </div>
                      <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.5 }}>
                        {displayCards[current]?.front}
                      </div>
                      <div className="text-xs text-muted mt-4">👆 Click to reveal answer</div>
                    </div>
                    {/* Back */}
                    <div className="fc-face fc-back">
                      <div className="text-xs mb-3" style={{ color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Answer / Definition
                      </div>
                      <div style={{ fontSize: 15, lineHeight: 1.7 }}>
                        {displayCards[current]?.back}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card controls */}
                <div className="flex-center gap-3" style={{ justifyContent: 'center', marginBottom: 18 }}>
                  <button className="btn btn-secondary btn-icon" onClick={prev} title="Previous">
                    <RotateCcw size={14} />
                  </button>
                  <button
                    className="btn btn-ghost btn-icon"
                    title={favs.has(origIdx(current)) ? 'Remove from favorites' : 'Add to favorites'}
                    onClick={() => toggleFav(origIdx(current))}
                    style={{ color: favs.has(origIdx(current)) ? 'var(--amber)' : 'var(--text2)' }}
                  >
                    <Star size={16} fill={favs.has(origIdx(current)) ? 'var(--amber)' : 'none'} />
                  </button>
                  <button className="btn btn-primary" onClick={next}>Next →</button>
                </div>

                {/* Progress bar */}
                <div className="progress mb-6" style={{ height: 4 }}>
                  <div className="progress-fill"
                    style={{ width: `${((current + 1) / displayCards.length) * 100}%` }} />
                </div>

                {/* All cards grid */}
                <div className="glow-line" />
                <h3 className="font-semibold mb-3" style={{ fontSize: 14 }}>All Cards</h3>
                <div className="grid-3">
                  {flashcardData.map((card, i) => (
                    <div key={i}
                      className="card card-hover"
                      style={{ cursor: 'pointer', borderColor: i === (mode === 'all' ? current : origIdx(current)) ? 'var(--accent)' : 'var(--border)' }}
                      onClick={() => {
                        if (mode === 'all') { setCurrent(i); setFlipped(false); }
                        else {
                          const dispI = displayCards.findIndex((c) => c === flashcardData[i]);
                          if (dispI >= 0) { setCurrent(dispI); setFlipped(false); }
                        }
                      }}
                    >
                      <div className="flex-between mb-2">
                        <span className="badge badge-cyan" style={{ fontSize: 10 }}>#{i + 1}</span>
                        {favs.has(i) && <Star size={11} fill="var(--amber)" color="var(--amber)" />}
                      </div>
                      <div className="font-medium text-sm mb-1 truncate">{card.front}</div>
                      <div className="text-xs text-muted" style={{ lineHeight: 1.5 }}>
                        {card.back.length > 90 ? card.back.slice(0, 90) + '…' : card.back}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text2)' }}>
                No favorites yet — star cards as you study!
              </div>
            )}
          </>
        )}

        {flashcardData.length === 0 && !loading && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text2)' }}>
            <div style={{ fontSize: 42, marginBottom: 12, opacity: 0.2 }}>🃏</div>
            <div className="text-sm">Generate flashcards from a topic or uploaded document</div>
          </div>
        )}
      </div>
    </div>
  );
}
