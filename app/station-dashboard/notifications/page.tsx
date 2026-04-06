'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const priorityColor: Record<string, [string, string]> = {
  critical: ['rgba(239,68,68,0.2)',  '#f87171'],
  high:     ['rgba(249,115,22,0.2)', '#fb923c'],
  medium:   ['rgba(251,191,36,0.2)', '#fbbf24'],
  low:      ['rgba(74,222,128,0.2)', '#4ade80'],
};

export default function StationNotificationsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [count, setCount]     = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    fetch('http://localhost:8000/api/station/notifications/', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setReports(data.reports || []); setCount(data.count || 0); setLoading(false); })
      .catch(() => setLoading(false));
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
        <h1 className="text-white font-black text-xl uppercase tracking-widest">Notifications</h1>
        <span className="text-sm px-3 py-1 rounded-full font-bold"
          style={{ background: count > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(107,114,128,0.15)', color: count > 0 ? '#f87171' : '#6b7280', border: `1px solid ${count > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(107,114,128,0.3)'}` }}>
          {count} new pending
        </span>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(30,10,10,0.95)', border: '1px solid rgba(239,68,68,0.2)' }}>
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-4xl">🔔</span>
            <p className="text-gray-500 font-semibold">No new pending reports in the last 24 hours.</p>
          </div>
        ) : (
          <ul>
            {reports.map((r, i) => {
              const [bg, color] = priorityColor[r.priority] || ['rgba(107,114,128,0.2)', '#9ca3af'];
              return (
                <li key={r.id} style={{ borderBottom: i < reports.length - 1 ? '1px solid rgba(239,68,68,0.08)' : 'none' }}>
                  <Link href="/station-dashboard/reports"
                    className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-red-950/20">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-2" style={{ background: color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-bold text-sm">{r.title}</p>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
                          style={{ background: bg, color }}>{r.priority}</span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>📍 {r.location}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#6b7280' }}>
                        {new Date(r.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="text-xs font-bold shrink-0 mt-1" style={{ color: '#f97316' }}>View →</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="text-xs text-center mt-4" style={{ color: '#4b5563' }}>Showing all pending reports</p>
    </div>
  );
}
