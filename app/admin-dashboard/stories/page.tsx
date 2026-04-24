'use client';
import { useEffect, useState } from 'react';

const cardStyle = {
  background: 'linear-gradient(135deg, rgba(30,10,10,0.95), rgba(20,5,5,0.98))',
  border: '1px solid rgba(239,68,68,0.2)',
};

const statusCfg: Record<string, { color: string; bg: string }> = {
  pending:  { color: '#fbbf24', bg: 'rgba(251,191,36,0.15)' },
  approved: { color: '#4ade80', bg: 'rgba(74,222,128,0.15)' },
  rejected: { color: '#f87171', bg: 'rgba(248,113,113,0.15)' },
};

export default function AdminStoriesPage() {
  const [stories, setStories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => { fetchStories(); }, []);

  const fetchStories = async () => {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/user-stories/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setStories(await res.json());
    setLoading(false);
  };

  const handleStatus = async (id: number, status: string) => {
    const token = localStorage.getItem('access_token');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/user-stories/${id}/`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchStories();
    if (selected?.id === id) setSelected((s: any) => ({ ...s, status }));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this story?')) return;
    const token = localStorage.getItem('access_token');
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/user-stories/${id}/`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    fetchStories();
    if (selected?.id === id) setSelected(null);
  };

  const filtered = filter ? stories.filter(s => s.status === filter) : stories;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-4xl animate-bounce">🔥</div></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-orange-800">Featured Stories</h1>
          <p className="text-gray-500 text-xs mt-0.5">{filtered.length} of {stories.length} stories</p>
        </div>
      </div>

      {/* Filter */}
      <div className="rounded-xl p-4 flex flex-wrap gap-3 items-center" style={cardStyle}>
        {['', 'pending', 'approved', 'rejected'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: filter === s ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.04)', color: filter === s ? '#fca5a5' : '#6b7280', border: `1px solid ${filter === s ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.15)'}` }}>
            {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={cardStyle}>
        <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
          <table className="w-full">
            <thead style={{ background: 'rgba(239,68,68,0.08)', borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
              <tr>
                {['Title', 'Submitted By', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-widest text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-600">No stories found.</td></tr>
              ) : filtered.map(s => {
                const cfg = statusCfg[s.status] || statusCfg.pending;
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(239,68,68,0.08)' }}>
                    <td className="px-4 py-3 text-white text-sm font-semibold max-w-[200px] truncate">{s.title}</td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{s.submitted_by_name}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ color: cfg.color, background: cfg.bg }}>{s.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setSelected(s)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}>
                          View
                        </button>
                        {s.status !== 'approved' && (
                          <button onClick={() => handleStatus(s.id, 'approved')}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg"
                            style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
                            Approve
                          </button>
                        )}
                        {s.status !== 'rejected' && (
                          <button onClick={() => handleStatus(s.id, 'rejected')}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg"
                            style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
                            Reject
                          </button>
                        )}
                        <button onClick={() => handleDelete(s.id)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{ background: 'rgba(127,29,29,0.3)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}
          onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl"
            style={{ background: '#120505', border: '1px solid rgba(239,68,68,0.35)', boxShadow: '0 25px 60px rgba(0,0,0,0.8)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
              <h2 className="text-white font-black text-lg">Story Details</h2>
              <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f97316' }}>Title</p>
                <p className="text-white font-bold">{selected.title}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f97316' }}>Submitted By</p>
                <p className="text-gray-300 text-sm">{selected.submitted_by_name}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f97316' }}>Story</p>
                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{selected.story}</p>
              </div>
              {selected.image && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#f97316' }}>Photo</p>
                  <img src={selected.image} alt="Story" className="w-full rounded-xl" style={{ border: '1px solid rgba(239,68,68,0.2)', maxHeight: 300, objectFit: 'cover' }} />
                </div>
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: '#f97316' }}>Status</p>
                <span className="text-xs font-bold px-2 py-1 rounded-full"
                  style={{ color: statusCfg[selected.status]?.color, background: statusCfg[selected.status]?.bg }}>
                  {selected.status}
                </span>
              </div>
              <div className="flex gap-3 pt-2">
                {selected.status !== 'approved' && (
                  <button onClick={() => handleStatus(selected.id, 'approved')}
                    className="flex-1 py-2.5 rounded-lg font-bold text-sm"
                    style={{ background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }}>
                    ✅ Approve & Feature
                  </button>
                )}
                {selected.status !== 'rejected' && (
                  <button onClick={() => handleStatus(selected.id, 'rejected')}
                    className="flex-1 py-2.5 rounded-lg font-bold text-sm"
                    style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
                    ❌ Reject
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
