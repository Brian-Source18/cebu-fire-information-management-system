'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';

export default function MyStory() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ title: '', story: '' });
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [myStories, setMyStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading]);

  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('access_token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-stories/`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(r => r.json()).then(d => setMyStories(Array.isArray(d) ? d : [])).catch(() => {});
  }, [user, success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('story', form.story);
      if (image) formData.append('image', image);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user-stories/`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) { setSuccess(true); setForm({ title: '', story: '' }); setImage(null); setImagePreview(null); }
      else { const d = await res.json(); setError(d.detail || 'Failed to submit story.'); }
    } catch { setError('Connection error. Please try again.'); }
    finally { setLoading(false); }
  };

  const statusCfg: Record<string, { color: string; bg: string; label: string }> = {
    pending:  { color: '#d97706', bg: '#fffbeb', label: '⏳ Pending Review' },
    approved: { color: '#16a34a', bg: '#f0fdf4', label: '✅ Approved' },
    rejected: { color: '#dc2626', bg: '#fef2f2', label: '❌ Rejected' },
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, color: '#1e293b', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 };

  if (authLoading) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a href="/" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none' }}>← Home</a>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 16 }}>Feature Your Story</div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', borderRadius: 20, padding: '28px 24px', marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔥</div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Share Your Story</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Inspire others with your fire emergency experience. Your story may save a life.</div>
        </div>

        {/* Success */}
        {success && (
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', borderRadius: 14, padding: '14px 16px', marginBottom: 20, color: '#16a34a', fontSize: 13, fontWeight: 600 }}>
            ✅ Your story has been submitted! It will be reviewed by the admin before being featured.
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 14, padding: '14px 16px', marginBottom: 20, color: '#dc2626', fontSize: 13 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '24px', border: '1px solid #e2e8f0', marginBottom: 24 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={labelStyle}>Story Title *</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. How I survived the Mambaling fire" style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>Your Story *</label>
              <textarea value={form.story} onChange={e => setForm({ ...form, story: e.target.value })}
                rows={8} placeholder="Share your experience, how you survived, what you learned, or how it inspired you..."
                style={{ ...inputStyle, resize: 'vertical' }} required />
            </div>
            <div>
              <label style={labelStyle}>Photo *</label>
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', borderRadius: 12, border: '2px dashed #e2e8f0', backgroundColor: '#f8fafc', cursor: 'pointer' }}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" style={{ maxHeight: 160, borderRadius: 10, objectFit: 'cover' }} />
                ) : (
                  <>
                    <span style={{ fontSize: 28, marginBottom: 8 }}>📷</span>
                    <span style={{ color: '#64748b', fontSize: 13 }}>Click to upload a photo</span>
                    <span style={{ color: '#94a3b8', fontSize: 11, marginTop: 4 }}>JPG, PNG up to 10MB</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0] || null; setImage(f); setImagePreview(f ? URL.createObjectURL(f) : null); }} style={{ display: 'none' }} required />
              </label>
              {imagePreview && (
                <button type="button" onClick={() => { setImage(null); setImagePreview(null); }} style={{ marginTop: 8, fontSize: 12, color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer' }}>✕ Remove photo</button>
              )}
            </div>
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', borderRadius: 12, border: 'none', backgroundColor: '#dc2626', color: '#fff', fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Submitting...' : '🔥 Submit Story'}
            </button>
          </form>
        </div>

        {/* My submitted stories */}
        {myStories.length > 0 && (
          <div>
            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 16, marginBottom: 12 }}>My Submitted Stories</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {myStories.map(s => {
                const cfg = statusCfg[s.status] || statusCfg.pending;
                return (
                  <div key={s.id} style={{ backgroundColor: '#fff', borderRadius: 16, padding: '16px 20px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 14 }}>{s.title}</div>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, color: cfg.color, backgroundColor: cfg.bg }}>{cfg.label}</span>
                    </div>
                    <div style={{ color: '#64748b', fontSize: 13, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.story}</div>
                    <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 8 }}>{new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
