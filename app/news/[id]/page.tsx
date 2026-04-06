'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Footer from '../../../components/Footer';

interface NewsItem {
  id: number;
  title: string;
  content: string;
  image?: string;
  created_by_name: string;
  created_at: string;
}

export default function NewsDetail() {
  const { id } = useParams();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/api/news/${id}/`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { setNews(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }
        .back-btn:hover { background: #fef2f2 !important; color: #dc2626 !important; }
      `}</style>

      {/* Header */}
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <a href="/" className="back-btn" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none', padding: '5px 12px', borderRadius: 8, border: '1px solid #e2e8f0', transition: 'all 0.2s', fontWeight: 600 }}>← Home</a>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 15 }}>📰 News</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 28, height: 28, backgroundColor: '#dc2626', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🔥</div>
            <span style={{ fontWeight: 800, fontSize: 12, color: '#1e293b' }}>CEBU CITY FIRE DEPT.</span>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '32px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔥</div>
            <div style={{ color: '#94a3b8', fontSize: 14 }}>Loading article...</div>
          </div>
        ) : !news ? (
          <div style={{ textAlign: 'center', padding: '80px 0', backgroundColor: '#fff', borderRadius: 20, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <div style={{ color: '#475569', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Article not found</div>
            <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>This news article may have been removed.</div>
            <a href="/" style={{ color: '#dc2626', fontSize: 13, fontWeight: 700, textDecoration: 'none', padding: '8px 20px', borderRadius: 10, backgroundColor: '#fef2f2', border: '1px solid #fca5a5' }}>← Back to Home</a>
          </div>
        ) : (
          <div className="fade-up" style={{ backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            {/* Image inside card */}
            {news.image ? (
              <div style={{ position: 'relative' }}>
                <img src={news.image} alt={news.title} style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 55%)' }} />
                <span style={{ position: 'absolute', bottom: 16, left: 20, backgroundColor: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 20, letterSpacing: 1 }}>📰 NEWS</span>
              </div>
            ) : (
              <div style={{ width: '100%', height: 160, background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>🔥</div>
            )}

            {/* Meta bar */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, backgroundColor: '#fafafa' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ backgroundColor: '#fef2f2', color: '#dc2626', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, border: '1px solid #fca5a5' }}>NEWS</span>
                <span style={{ color: '#94a3b8', fontSize: 12 }}>📅 {new Date(news.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span style={{ color: '#94a3b8', fontSize: 12 }}>✍️ <span style={{ color: '#dc2626', fontWeight: 700 }}>{news.created_by_name}</span></span>
              </div>
              <span style={{ color: '#94a3b8', fontSize: 11 }}>🕐 {new Date(news.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            {/* Content */}
            <div style={{ padding: '28px 28px 36px' }}>
              <h1 style={{ fontWeight: 900, color: '#1e293b', fontSize: 'clamp(20px, 4vw, 30px)', marginBottom: 24, lineHeight: 1.3, borderLeft: '4px solid #dc2626', paddingLeft: 16 }}>
                {news.title}
              </h1>
              <div style={{ color: '#475569', fontSize: 15, lineHeight: 1.9, whiteSpace: 'pre-line' }}>
                {news.content}
              </div>

              {/* Footer */}
              <div style={{ marginTop: 36, paddingTop: 20, borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, backgroundColor: '#dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔥</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 13 }}>Cebu City Fire Department</div>
                    <div style={{ color: '#94a3b8', fontSize: 11 }}>Official News & Updates</div>
                  </div>
                </div>
                <a href="/" style={{ color: '#dc2626', fontSize: 13, fontWeight: 700, textDecoration: 'none', padding: '8px 18px', borderRadius: 10, backgroundColor: '#fef2f2', border: '1px solid #fca5a5' }}>← Back to Home</a>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
