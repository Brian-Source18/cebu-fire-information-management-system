'use client';
import { useEffect, useState } from 'react';

interface Feedback {
  id: number;
  username: string;
  name: string;
  rating: number;
  message: string;
  created_at: string;
}

const ratingColors: Record<number, { color: string; bg: string }> = {
  1: { color: '#dc2626', bg: '#fef2f2' },
  2: { color: '#ea580c', bg: '#fff7ed' },
  3: { color: '#d97706', bg: '#fffbeb' },
  4: { color: '#16a34a', bg: '#f0fdf4' },
  5: { color: '#2563eb', bg: '#eff6ff' },
};

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/feedback/`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { setFeedbacks(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
    // Mark all as read
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/feedback/mark_all_read/`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
  }, []);

  const filtered = filterRating ? feedbacks.filter(f => f.rating === Number(filterRating)) : feedbacks;

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : '—';

  const cardStyle = { background: 'linear-gradient(135deg, rgba(30,10,10,0.95), rgba(20,5,5,0.98))', border: '1px solid rgba(239,68,68,0.2)' };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-4xl animate-bounce">💬</div></div>;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-black text-orange-800">User Feedback</h1>
          <p className="text-gray-500 text-xs mt-0.5">{feedbacks.length} total · Avg rating: {avgRating} ★</p>
        </div>
        <select value={filterRating} onChange={e => setFilterRating(e.target.value)}
          className="px-3 py-2 rounded-lg text-sm text-white bg-transparent focus:outline-none"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <option value="">All Ratings</option>
          {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
        </select>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {[5,4,3,2,1].map(r => {
          const count = feedbacks.filter(f => f.rating === r).length;
          const c = ratingColors[r];
          return (
            <div key={r} className="rounded-xl p-3 text-center" style={cardStyle}>
              <div style={{ color: '#f59e0b', fontSize: 18 }}>{'★'.repeat(r)}</div>
              <div className="text-white font-black text-xl">{count}</div>
              <div className="text-gray-500 text-xs">{r} star</div>
            </div>
          );
        })}
      </div>

      {/* Feedback List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl p-12 text-center text-gray-600" style={cardStyle}>No feedback yet.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(f => {
            const c = ratingColors[f.rating];
            return (
              <div key={f.id} className="rounded-xl p-4" style={cardStyle}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div style={{ width: 40, height: 40, backgroundColor: 'rgba(220,38,38,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#f87171', flexShrink: 0 }}>
                      {(f.username?.[0] || f.name?.[0] || '?').toUpperCase()}
                    </div>
                    <div>
                      <div className="text-white font-bold text-sm">{f.username || f.name || 'Anonymous'}</div>
                      <div className="text-gray-500 text-xs">{new Date(f.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                  </div>
                  <span className="text-sm font-black px-3 py-1 rounded-full" style={{ color: c.color, backgroundColor: `${c.color}22` }}>
                    {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)} {f.rating}/5
                  </span>
                </div>
                <p className="text-gray-300 text-sm mt-3 leading-relaxed">{f.message}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

