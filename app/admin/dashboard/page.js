'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';

const SUBJECTS = ['English', 'Odia', 'Math', 'Science', 'SST', 'Computer'];

export default function AdminDashboard() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [existing, setExisting] = useState([]);

  const [grade, setGrade] = useState('8');
  const [subject, setSubject] = useState('SST');
  const [chapter, setChapter] = useState('');
  const [notes, setNotes] = useState('');
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const [mindmap, setMindmap] = useState(null);
  const [model3dUrl, setModel3dUrl] = useState('');

  const [aiTopic, setAiTopic] = useState('');
  const [aiSourceText, setAiSourceText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/admin/login');
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role !== 'admin') return router.push('/admin/login');
      setChecking(false);
      loadContent();
    }
    checkAdmin();
  }, [router]);

  async function loadContent() {
    const { data } = await supabase.from('content').select('*').order('created_at', { ascending: false });
    setExisting(data || []);
  }

  async function generateWithAI(mode) {
    setAiLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode, // 'topic' or 'source'
          grade,
          subject,
          chapter,
          topic: aiTopic,
          sourceText: aiSourceText,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI generation failed');

      setNotes(data.notes || '');
      setPracticeQuestions(data.practice_questions || []);
      setMindmap(data.mindmap || null);
      setMessage('✅ AI content generated below — review and save.');
    } catch (err) {
      setMessage('❌ ' + err.message);
    }
    setAiLoading(false);
  }

  async function handleSave() {
    if (!chapter.trim()) {
      setMessage('❌ Please enter a chapter name.');
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('content').insert({
      grade: Number(grade),
      subject,
      chapter: chapter.trim(),
      notes,
      practice_questions: practiceQuestions,
      mindmap,
      model_3d_url: model3dUrl || null,
      created_by: user.id,
    });

    setSaving(false);
    if (error) {
      setMessage('❌ ' + error.message);
      return;
    }
    setMessage('✅ Saved!');
    setChapter('');
    setNotes('');
    setPracticeQuestions([]);
    setMindmap(null);
    setModel3dUrl('');
    loadContent();
  }

  async function handleDelete(id) {
    await supabase.from('content').delete().eq('id', id);
    loadContent();
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (checking) return <div className="container">Checking access...</div>;

  return (
    <div>
      <div className="navbar">
        <div className="brand">📘 CBSE Learn — Admin</div>
        <button className="btn secondary" style={{ padding: '6px 12px' }} onClick={handleLogout}>
          Log out
        </button>
      </div>

      <div className="container">
        <div className="grid cols-2">
          {/* LEFT: Create/Generate content */}
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Add chapter content</h3>

            <label>Grade</label>
            <select className="input" value={grade} onChange={(e) => setGrade(e.target.value)}>
              {[6, 7, 8, 9, 10].map((g) => (
                <option key={g} value={g}>Std {g}</option>
              ))}
            </select>

            <label>Subject</label>
            <select className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>
              {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <label>Chapter name</label>
            <input className="input" value={chapter} onChange={(e) => setChapter(e.target.value)} />

            <div className="card" style={{ background: '#f9fafc', boxShadow: 'none', marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>🤖 Generate with AI</div>

              <label>Option A — from a topic name</label>
              <input
                className="input"
                placeholder="e.g. Resources and Development"
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
              />
              <button className="btn secondary" style={{ marginBottom: 14 }} disabled={aiLoading} onClick={() => generateWithAI('topic')}>
                {aiLoading ? 'Generating...' : 'Generate from topic'}
              </button>

              <label>Option B — paste text / textbook content to summarize</label>
              <textarea
                className="input"
                rows={5}
                placeholder="Paste chapter text here..."
                value={aiSourceText}
                onChange={(e) => setAiSourceText(e.target.value)}
              />
              <button className="btn secondary" disabled={aiLoading} onClick={() => generateWithAI('source')}>
                {aiLoading ? 'Generating...' : 'Generate from pasted text'}
              </button>
            </div>

            <label>Notes (editable, generated or manual)</label>
            <textarea className="input" rows={8} value={notes} onChange={(e) => setNotes(e.target.value)} />

            <label>Practice questions (JSON — auto-filled by AI, or edit manually)</label>
            <textarea
              className="input"
              rows={6}
              value={JSON.stringify(practiceQuestions, null, 2)}
              onChange={(e) => {
                try { setPracticeQuestions(JSON.parse(e.target.value)); } catch { /* ignore invalid JSON while typing */ }
              }}
            />

            <label>Mind map (JSON — auto-filled by AI, or edit manually)</label>
            <textarea
              className="input"
              rows={6}
              value={JSON.stringify(mindmap, null, 2)}
              onChange={(e) => {
                try { setMindmap(JSON.parse(e.target.value)); } catch { /* ignore invalid JSON while typing */ }
              }}
            />

            <label>3D model URL (optional — link to a .glb file)</label>
            <input className="input" value={model3dUrl} onChange={(e) => setModel3dUrl(e.target.value)} />

            {message && <div style={{ marginBottom: 12, fontSize: 14 }}>{message}</div>}

            <button className="btn" style={{ width: '100%' }} disabled={saving} onClick={handleSave}>
              {saving ? 'Saving...' : 'Save chapter'}
            </button>
          </div>

          {/* RIGHT: Existing content list */}
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Existing chapters</h3>
            {existing.length === 0 && <p style={{ color: '#6b7280' }}>Nothing uploaded yet.</p>}
            {existing.map((c) => (
              <div key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid #e5e9f0' }}>
                <div style={{ fontWeight: 600 }}>{c.chapter}</div>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
                  Std {c.grade} · {c.subject}
                </div>
                <button className="btn danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(c.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
