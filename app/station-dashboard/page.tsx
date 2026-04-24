'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface DashboardStats {
  total_reports: number;
  pending_reports: number;
  responding_reports: number;
  resolved_reports: number;
  recent_reports: any[];
}

const card = (accent: string) => ({
  background: 'rgba(30,10,10,0.95)',
  border: `1px solid rgba(239,68,68,0.2)`,
  borderTop: `3px solid ${accent}`,
});

export default function StationDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/station/dashboard/stats/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setStats(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <span className="text-2xl animate-pulse">🔥</span>
      <span className="ml-3 text-gray-400">Loading...</span>
    </div>
  );

  const statCards = [
    { label: 'Total Reports', value: stats?.total_reports ?? 0,    icon: '📋', accent: '#6b7280', color: '#d1d5db' },
    { label: 'Pending',       value: stats?.pending_reports ?? 0,  icon: '⏳', accent: '#d97706', color: '#fbbf24' },
    { label: 'Responding',    value: stats?.responding_reports ?? 0, icon: '🚒', accent: '#2563eb', color: '#60a5fa' },
    { label: 'Resolved',      value: stats?.resolved_reports ?? 0, icon: '✅', accent: '#16a34a', color: '#4ade80' },
  ];

  const priorityBadge = (p: string) => {
    const map: Record<string, string> = {
      critical: 'rgba(220,38,38,0.2)',
      high:     'rgba(234,88,12,0.2)',
      medium:   'rgba(234,179,8,0.2)',
      low:      'rgba(107,114,128,0.2)',
    };
    const text: Record<string, string> = { critical: '#f87171', high: '#fb923c', medium: '#fbbf24', low: '#9ca3af' };
    return { background: map[p] || map.low, color: text[p] || text.low };
  };

  const statusBadge = (s: string) => {
    const map: Record<string, [string, string]> = {
      pending:    ['rgba(217,119,6,0.2)',  '#fbbf24'],
      responding: ['rgba(37,99,235,0.2)',  '#60a5fa'],
      resolved:   ['rgba(22,163,74,0.2)',  '#4ade80'],
    };
    const [bg, color] = map[s] || map.pending;
    return { background: bg, color };
  };

  return (
    <div>
      {/* Welcome banner */}
      <div className="rounded-xl p-5 mb-6 flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15) 0%, rgba(220,38,38,0.1) 100%)', border: '1px solid rgba(249,115,22,0.25)' }}>
        <span className="text-4xl">🚒</span>
        <div>
          <h1 className="text-white font-black text-xl">Welcome back, {user?.username}</h1>
          <p className="text-sm mt-0.5" style={{ color: '#f97316' }}>{user?.fire_station_name || 'Fire Station'} — Station Dashboard</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {statCards.map(s => (
          <div key={s.label} className="rounded-xl p-5" style={card(s.accent)}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#6b7280' }}>{s.label}</p>
              <span className="text-2xl">{s.icon}</span>
            </div>
            <p className="text-3xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent reports */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(30,10,10,0.95)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
          <h2 className="text-white font-black text-base uppercase tracking-widest">Recent Emergency Reports</h2>
        </div>
        <div className="p-4">
          {!stats?.recent_reports?.length ? (
            <p className="text-center py-10 text-gray-600">No recent reports</p>
          ) : (
            <div className="space-y-3">
              {stats.recent_reports.map((r: any) => (
                <div key={r.id} className="rounded-lg p-4 flex items-start justify-between gap-4"
                  style={{ background: 'rgba(15,5,5,0.8)', border: '1px solid rgba(239,68,68,0.12)' }}>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{r.title}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: '#9ca3af' }}>{r.location}</p>
                    <p className="text-xs mt-1" style={{ color: '#6b7280' }}>
                      {r.reported_by_name} · {new Date(r.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 rounded text-xs font-bold capitalize" style={statusBadge(r.status)}>{r.status}</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold capitalize" style={priorityBadge(r.priority)}>{r.priority}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

