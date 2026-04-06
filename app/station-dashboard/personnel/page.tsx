'use client';

import { useEffect, useState } from 'react';

const statusBadge = (s: string) => {
  const map: Record<string, [string, string]> = {
    active:   ['rgba(22,163,74,0.2)',  '#4ade80'],
    on_leave: ['rgba(217,119,6,0.2)',  '#fbbf24'],
  };
  const [bg, color] = map[s] || ['rgba(107,114,128,0.2)', '#9ca3af'];
  return { background: bg, color };
};

const initials = (first: string, last: string) =>
  `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

export default function StationPersonnelPage() {
  const [personnel, setPersonnel] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('access_token');
    fetch('https://firebackend-tsi7.onrender.com/api/station/personnel/', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { setPersonnel(data); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="text-2xl animate-pulse">🔥</span>
      <span className="ml-3 text-gray-400">Loading...</span>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-white font-black text-xl uppercase tracking-widest">Personnel</h1>
        <span className="text-sm px-3 py-1 rounded-full font-bold"
          style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' }}>
          {personnel.length} assigned
        </span>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(30,10,10,0.95)', border: '1px solid rgba(239,68,68,0.2)' }}>
        {personnel.length === 0 ? (
          <p className="text-center py-12 text-gray-600">No personnel assigned to your station yet.</p>
        ) : (
          <div className="overflow-x-auto overflow-y-auto max-h-[560px]">
            <table className="min-w-full">
              <thead className="sticky top-0 z-10" style={{ background: 'rgba(30,10,10,0.95)' }}>
                <tr style={{ borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
                  {['Personnel', 'Rank', 'Contact', 'Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-black uppercase tracking-widest" style={{ color: '#6b7280' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {personnel.map(p => (
                  <tr key={p.id} className="transition-colors hover:bg-red-950/20" style={{ borderBottom: '1px solid rgba(239,68,68,0.08)' }}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                          style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' }}>
                          {initials(p.first_name, p.last_name)}
                        </div>
                        <span className="text-white font-semibold text-sm">{p.first_name} {p.last_name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm" style={{ color: '#9ca3af' }}>{p.rank_display}</td>
                    <td className="px-5 py-3 text-sm" style={{ color: '#9ca3af' }}>{p.contact_number || '—'}</td>
                    <td className="px-5 py-3">
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold capitalize" style={statusBadge(p.status)}>{p.status_display}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
