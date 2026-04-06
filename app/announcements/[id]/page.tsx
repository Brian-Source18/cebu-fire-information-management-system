'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Footer from '../../../components/Footer';

interface Announcement {
  id: number;
  title: string;
  message: string;
  priority: string;
  created_by_name: string;
  created_at: string;
}

const priorityConfig: Record<string, { bg: string; bar: string; badge: string; icon: string; label: string }> = {
  emergency: { bg: '#fef2f2', bar: '#dc2626', badge: '#fef2f2', icon: '🚨', label: 'Emergency' },
  warning:   { bg: '#fffbeb', bar: '#d97706', badge: '#fffbeb', icon: '⚠️', label: 'Warning' },
  info:      { bg: '#eff6ff', bar: '#2563eb', badge: '#eff6ff', icon: '📢', label: 'Information' },
};

export default function AnnouncementDetail() {
  const { id } = useParams();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://firebackend-tsi7.onrender.com/api/announcements/${id}/`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { setAnnouncement(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const c = announcement ? (priorityConfig[announcement.priority] || priorityConfig.info) : priorityConfig.info;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', gap: 10 }}>
          <a href="/" style={{ color: '#64748b', fontSize: 13, textDecoration: 'none' }}>← Home</a>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <div style={{ fontWeight: 800, color: '#1e293b', fontSize: 16 }}>📢 Announcement</div>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8', fontSize: 32 }}>🔥</div>
        ) : !announcement ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ color: '#475569', fontWeight: 700 }}>Announcement not found.</div>
            <a href="/" style={{ color: '#dc2626', fontSize: 13, marginTop: 12, display: 'inline-block' }}>← Back to Home</a>
          </div>
        ) : (
          <div style={{ backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: `5px solid ${c.bar}` }}>
            <div style={{ backgroundColor: c.bg, padding: '24px 24px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 28 }}>{c.icon}</span>
                <span style={{ backgroundColor: c.bar, color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{c.label}</span>
                <span style={{ color: '#94a3b8', fontSize: 12 }}>
                  {new Date(announcement.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              <h1 style={{ fontWeight: 900, color: '#1e293b', fontSize: 'clamp(20px, 4vw, 26px)', lineHeight: 1.3 }}>{announcement.title}</h1>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ color: '#475569', fontSize: 15, lineHeight: 1.8, whiteSpace: 'pre-line' }}>
                {announcement.message}
              </div>
              <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #f1f5f9', color: '#94a3b8', fontSize: 12 }}>
                Posted by <span style={{ color: '#dc2626', fontWeight: 700 }}>{announcement.created_by_name}</span>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
