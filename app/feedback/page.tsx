'use client';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Footer from '../../components/Footer';

export default function FeedbackPage() {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating.'); return; }
    setError(''); setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('https://firebackend-tsi7.onrender.com/api/feedback/', {
        method: 'POST',
        headers,
        body: JSON.stringify({ rating, message, name: user ? '' : name }),
      });
      if (res.ok) { setSuccess(true); }
      else { const d = await res.json(); setError(d.message || 'Failed to submit feedback.'); }
    } catch { setError('Connection error. Please try again.'); }
    finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e2e8f0', fontSize: 14, color: '#1e293b', backgroundColor: '#fff', outline: 'none', boxSizing: 'border-box' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="/" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none' }}>← Home</a>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 16 }}>💬 Feedback</div>
        </div>
      </header>

      <main style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', borderRadius: 20, padding: '28px 24px', marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>💬</div>
          <div style={{ color: '#fff', fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Share Your Feedback</div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>Help us improve the Cebu City Fire Department portal</div>
        </div>

        {success ? (
          <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 20, padding: '40px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
            <div style={{ fontWeight: 800, color: '#16a34a', fontSize: 18, marginBottom: 8 }}>Thank you for your feedback!</div>
            <div style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>Your response has been submitted successfully.</div>
            <a href="/" style={{ backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, padding: '10px 28px', borderRadius: 10, textDecoration: 'none', fontSize: 14 }}>← Back to Home</a>
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff', borderRadius: 20, padding: '28px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Star Rating */}
              <div>
                <label style={labelStyle}>Rating *</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      style={{ fontSize: 36, background: 'none', border: 'none', cursor: 'pointer', color: star <= (hovered || rating) ? '#f59e0b' : '#e2e8f0', transition: 'color 0.15s' }}>
                      ★
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <div style={{ color: '#64748b', fontSize: 12, marginTop: 6 }}>
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]} — {rating}/5
                  </div>
                )}
              </div>

              {/* Name — guests only */}
              {!user && (
                <div>
                  <label style={labelStyle}>Your Name *</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your name" style={inputStyle} required />
                </div>
              )}

              {/* Message */}
              <div>
                <label style={labelStyle}>Message *</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} rows={5}
                  placeholder="Tell us what you think about the portal, what can be improved, or any suggestions..."
                  style={{ ...inputStyle, resize: 'none' }} required />
              </div>

              {error && <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '10px 14px', color: '#dc2626', fontSize: 13 }}>⚠️ {error}</div>}

              <button type="submit" disabled={loading}
                style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', backgroundColor: '#dc2626', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Submitting...' : '💬 Submit Feedback'}
              </button>
            </form>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
