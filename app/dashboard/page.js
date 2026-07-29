'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import MindMap from '../../components/MindMap';
import Model3DViewer from '../../components/Model3DViewer';

const SUBJECTS = ['English', 'Odia', 'Math', 'Science', 'SST', 'Computer'];

export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [subject, setSubject] = useState('SST');
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [view, setView] = useState('notes'); // notes | practice | mindmap | 3d
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileData) {
        router.push('/login');
        return;
      }
      setProfile(profileData);
      setLoading(false);
    }
    init();
  }, [router]);

  useEffect(() => {
    if (!profile) return;
    async function loadChapters() {
      const { data } = await supabase
        .from('content')
        .select('*')
        .eq('grade', profile.grade)
        .eq('subject', subject)
        .order('created_at', { ascending: true });
      setChapters(data || []);
      setSelectedChapter(data && data.length > 0 ? data[0] : null);
      setView('notes');
    }
    loadChapters();
  }, [profile, subject]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div>
      <div className="navbar">
        <div className="brand">📘 CBSE Learn</div>
        <div style={{ fontSize: 14, color: '#6b7280' }}>
          {profile.name} · Std {profile.grade}{' '}
          <button className="btn secondary" style={{ marginLeft: 12, padding: '6px 12px' }} onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>

      <div className="container">
        <div className="tabs" style={{ flexWrap: 'wrap' }}>
          {SUBJECTS.map((s) => (
            <div key={s} className={`tab ${subject === s ? 'active' : ''}`} onClick={() => setSubject(s)}>
              {s}
            </div>
          ))}
        </div>

        <div className="grid" style={{ gridTemplateColumns: '220px 1fr', gap: 20 }}>
          <div className="card" style={{ padding: 12, height: 'fit-content' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
              CHAPTERS
            </div>
            {chapters.length === 0 && (
              <p style={{ fontSize: 13, color: '#6b7280' }}>No chapters yet for Std {profile.grade} {subject}.</p>
            )}
            {chapters.map((c) => (
              <div
                key={c.id}
                onClick={() => { setSelectedChapter(c); setView('notes'); }}
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: selectedChapter?.id === c.id ? 700 : 500,
                  background: selectedChapter?.id === c.id ? '#eef2fc' : 'transparent',
                  color: selectedChapter?.id === c.id ? '#4562b8' : '#2b2f3a',
                  marginBottom: 4,
                }}
              >
                {c.chapter}
              </div>
            ))}
          </div>

          <div className="card">
            {!selectedChapter ? (
              <p style={{ color: '#6b7280' }}>Select a chapter to begin.</p>
            ) : (
              <>
                <h2 style={{ marginTop: 0 }}>{selectedChapter.chapter}</h2>
                <div className="tabs">
                  {[
                    ['notes', 'Notes'],
                    ['practice', 'Practice Set'],
                    ['mindmap', 'Mind Map'],
                    ['3d', '3D Model'],
                  ].map(([key, label]) => (
                    <div key={key} className={`tab ${view === key ? 'active' : ''}`} onClick={() => setView(key)}>
                      {label}
                    </div>
                  ))}
                </div>

                {view === 'notes' && (
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: 15 }}>
                    {selectedChapter.notes || 'No notes yet.'}
                  </div>
                )}

                {view === 'practice' && <PracticeSet questions={selectedChapter.practice_questions} />}

                {view === 'mindmap' && <MindMap data={selectedChapter.mindmap} />}

                {view === '3d' && (
                  <Model3DViewer src={selectedChapter.model_3d_url} alt={selectedChapter.chapter} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PracticeSet({ questions }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!questions || questions.length === 0) {
    return <p style={{ color: '#6b7280' }}>No practice questions yet.</p>;
  }

  return (
    <div>
      {questions.map((q, i) => (
        <div key={i} className="card" style={{ marginBottom: 12, boxShadow: 'none' }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            {i + 1}. {q.question}
          </div>
          {q.options.map((opt, j) => {
            const isSelected = answers[i] === opt;
            const isCorrect = submitted && opt === q.answer;
            const isWrongSelected = submitted && isSelected && opt !== q.answer;
            return (
              <div
                key={j}
                onClick={() => !submitted && setAnswers({ ...answers, [i]: opt })}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1.5px solid',
                  borderColor: isCorrect ? '#35b7a3' : isWrongSelected ? '#e0645a' : isSelected ? '#5b7fdb' : '#e5e9f0',
                  background: isCorrect ? '#eafaf6' : isWrongSelected ? '#fdecec' : isSelected ? '#eef2fc' : '#fff',
                  marginBottom: 6,
                  cursor: submitted ? 'default' : 'pointer',
                  fontSize: 14,
                }}
              >
                {opt}
              </div>
            );
          })}
          {submitted && q.explanation && (
            <div style={{ fontSize: 13, color: '#6b7280', marginTop: 6 }}>💡 {q.explanation}</div>
          )}
        </div>
      ))}
      {!submitted ? (
        <button className="btn" onClick={() => setSubmitted(true)}>
          Check answers
        </button>
      ) : (
        <button className="btn secondary" onClick={() => { setSubmitted(false); setAnswers({}); }}>
          Try again
        </button>
      )}
    </div>
  );
}
