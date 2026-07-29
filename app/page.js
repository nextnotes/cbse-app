import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <div className="navbar">
        <div className="brand">📘 CBSE Learn</div>
        <Link href="/admin/login" style={{ fontSize: 13, color: '#6b7280' }}>
          Admin
        </Link>
      </div>

      <div className="container">
        <div style={{ textAlign: 'center', margin: '40px 0 30px' }}>
          <h1 style={{ fontSize: 30, marginBottom: 8 }}>
            Std 6 – 10 CBSE, made simple
          </h1>
          <p style={{ color: '#6b7280', fontSize: 16 }}>
            Notes, practice sets, mind maps & 3D models — English, Odia, Math, Science, SST, Computer & Odia notes.
          </p>
        </div>

        <div className="grid cols-2" style={{ maxWidth: 460, margin: '0 auto' }}>
          <Link href="/login" className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28 }}>👋</div>
            <div style={{ fontWeight: 700, marginTop: 8 }}>Log in</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>Already have an account</div>
          </Link>
          <Link href="/signup" className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28 }}>✨</div>
            <div style={{ fontWeight: 700, marginTop: 8 }}>Sign up</div>
            <div style={{ color: '#6b7280', fontSize: 13 }}>New student? Start here</div>
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: 18 }}>
          <Link href="/forgot-password" style={{ fontSize: 13, color: '#6b7280' }}>
            Forgot your ID or password?
          </Link>
        </div>

        <div className="grid cols-3" style={{ marginTop: 50 }}>
          <div className="card">
            <div className="badge">Notes</div>
            <p style={{ marginTop: 10, fontSize: 14, color: '#6b7280' }}>
              Clear, chapter-wise notes for every subject.
            </p>
          </div>
          <div className="card">
            <div className="badge">Practice Sets</div>
            <p style={{ marginTop: 10, fontSize: 14, color: '#6b7280' }}>
              Practice questions with instant explanations.
            </p>
          </div>
          <div className="card">
            <div className="badge">Mind Maps & 3D</div>
            <p style={{ marginTop: 10, fontSize: 14, color: '#6b7280' }}>
              Visual mind maps and interactive 3D models.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
